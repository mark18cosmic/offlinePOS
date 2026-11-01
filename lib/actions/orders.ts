"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSettings, localDay } from "@/lib/data";
import { saleSchema, type ActionResult, type SaleInput } from "@/lib/schemas";
import { calcTotals } from "@/lib/utils";

class SaleError extends Error {}

/** Records a paid sale. Prices always come from the database, never from the browser. */
export async function completeSale(input: SaleInput): Promise<ActionResult<{ total: number; change: number }>> {
  const user = await requireUser();
  const parsed = saleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Something went wrong. Please try again." };
  const sale = parsed.data;
  if (!getSettings()[`${sale.paymentMethod}_enabled`]) {
    return { ok: false, error: "That way to pay is switched off. Please choose another." };
  }

  try {
    const placed = db.transaction(() => {
      const lines = sale.items.map((item) => {
        const product = db.prepare("select name, price, is_available from products where id = ?").get(item.productId) as
          | { name: string; price: number; is_available: number }
          | undefined;
        if (!product) throw new SaleError("An item was removed from the shop. Please take it off this sale.");
        if (!product.is_available) throw new SaleError(`${product.name} is sold out. Please take it off this sale.`);
        return { ...item, name: product.name, price: product.price };
      });

      const settings = getSettings();
      const taxPercent = settings.tax_rate;
      // Remember the default that applied today, so changing it later leaves this day's report alone.
      db.prepare(
        `insert into petty_cash_days (day, amount) values (?, ?)
         on conflict (day) do update set amount = excluded.amount where is_manual = 0`,
      ).run(localDay(), settings.petty_cash_default);
      const totals = calcTotals(
        lines.reduce((sum, line) => sum + line.price * line.quantity, 0),
        taxPercent,
      );

      const isCash = sale.paymentMethod === "cash";
      const cashReceived = isCash ? (sale.cashReceived ?? totals.total) : null;
      if (cashReceived !== null && cashReceived < totals.total) {
        throw new SaleError("The cash received is less than the total.");
      }
      const change = cashReceived === null ? 0 : cashReceived - totals.total;

      const { lastInsertRowid } = db
        .prepare(
          `insert into orders (subtotal, tax_percent, tax_amount, total, payment_method, cash_received, change_given,
             created_by, created_at)
           values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          totals.subtotal,
          taxPercent,
          totals.taxAmount,
          totals.total,
          sale.paymentMethod,
          cashReceived,
          change,
          user.id,
          new Date().toISOString(),
        );

      const insertItem = db.prepare(
        "insert into order_items (order_id, product_id, name, unit_price, quantity) values (?, ?, ?, ?, ?)",
      );
      for (const line of lines) {
        insertItem.run(lastInsertRowid, line.productId, line.name, line.price, line.quantity);
      }
      return { total: totals.total, change };
    })();

    revalidatePath("/", "layout");
    return { ok: true, data: placed };
  } catch (error) {
    if (error instanceof SaleError) return { ok: false, error: error.message };
    throw error;
  }
}

export async function cancelSale(id: number): Promise<ActionResult> {
  await requireAdmin();
  db.prepare("update orders set status = 'cancelled' where id = ? and status = 'paid'").run(id);
  revalidatePath("/", "layout");
  return { ok: true };
}
