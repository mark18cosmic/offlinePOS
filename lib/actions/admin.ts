"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { localDay } from "@/lib/data";
import { db, hashPassword, saveUser } from "@/lib/db";
import {
  cashierSchema,
  passwordSchema,
  productSchema,
  settingsSchema,
  type ActionResult,
  type CashierInput,
  type PasswordInput,
  type ProductInput,
  type SettingsInput,
} from "@/lib/schemas";

const INVALID: ActionResult = { ok: false, error: "Please check the form and try again." };
const refresh = () => revalidatePath("/", "layout");

export async function saveProduct(id: number | null, input: ProductInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return INVALID;
  const { name, price, icon, isAvailable, isHidden } = parsed.data;
  const values = [name, Math.round(price * 100), icon, isAvailable ? 1 : 0, isHidden ? 1 : 0];
  if (id) {
    db.prepare("update products set name = ?, price = ?, icon = ?, is_available = ?, is_hidden = ? where id = ?").run(...values, id);
  } else {
    db.prepare("insert into products (name, price, icon, is_available, is_hidden) values (?, ?, ?, ?, ?)").run(...values);
  }
  refresh();
  return { ok: true };
}

export async function removeProduct(id: number): Promise<ActionResult> {
  await requireAdmin();
  db.prepare("delete from products where id = ?").run(id);
  refresh();
  return { ok: true };
}

export async function saveSettings(input: SettingsInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return INVALID;
  const { storeName, currency, taxRate, receiptFooter, cashEnabled, cardEnabled, transferEnabled, pettyCashEnabled, pettyCashDefault } =
    parsed.data;
  db.prepare(
    `update settings set store_name = ?, currency = ?, tax_rate = ?, receipt_footer = ?,
       cash_enabled = ?, card_enabled = ?, transfer_enabled = ?, petty_cash_enabled = ?, petty_cash_default = ? where id = 1`,
  ).run(
    storeName,
    currency,
    taxRate,
    receiptFooter,
    cashEnabled ? 1 : 0,
    cardEnabled ? 1 : 0,
    transferEnabled ? 1 : 0,
    pettyCashEnabled ? 1 : 0,
    Math.round(pettyCashDefault * 100),
  );
  refresh();
  return { ok: true };
}

/** Sets today's starting cash. Without this, today uses the default from Settings. */
export async function setTodaysPettyCash(amount: number): Promise<ActionResult> {
  await requireAdmin();
  if (!Number.isFinite(amount) || amount < 0 || amount > 9_999_999) {
    return { ok: false, error: "Please enter a valid amount." };
  }
  db.prepare(
    `insert into petty_cash_days (day, amount, is_manual) values (?, ?, 1)
     on conflict (day) do update set amount = excluded.amount, is_manual = 1`,
  ).run(localDay(), Math.round(amount * 100));
  refresh();
  return { ok: true };
}

export async function addCashier(input: CashierInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = cashierSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { username, password, fullName } = parsed.data;
  // A removed person's username can be reused; that brings their account back.
  if (db.prepare("select 1 from users where username = ? and is_active = 1").get(username)) {
    return { ok: false, error: "That username is already taken." };
  }
  saveUser(db, { username, password, fullName, role: "cashier" });
  refresh();
  return { ok: true };
}

export async function resetPassword(id: number, input: PasswordInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  db.prepare("update users set password_hash = ?, session_version = session_version + 1 where id = ?").run(
    hashPassword(parsed.data.password),
    id,
  );
  return { ok: true };
}

/** Signs a cashier out and blocks their login. Their past sales stay in reports. */
export async function removeCashier(id: number): Promise<ActionResult> {
  await requireAdmin();
  db.prepare("update users set is_active = 0, session_version = session_version + 1 where id = ? and role = 'cashier'").run(id);
  refresh();
  return { ok: true };
}
