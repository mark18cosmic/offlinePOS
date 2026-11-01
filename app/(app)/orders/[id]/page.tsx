import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SaleActions } from "@/components/sales/sale-actions";
import { requireUser } from "@/lib/auth";
import { getOrder, getSettings } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Sale" };

export default async function SalePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const result = /^\d+$/.test(id) ? getOrder(Number(id)) : null;
  if (!result) notFound();
  const { order, items } = result;
  const settings = getSettings();
  const money = (value: number) => formatCurrency(value, settings.currency);
  const row = "flex justify-between gap-3 tabular-nums";

  return (
    <main className="h-full overflow-y-auto p-3 sm:p-4 lg:p-6 print:h-auto print:overflow-visible print:p-0">
      <Link
        href={user.role === "admin" ? "/reports" : "/orders"}
        className="mb-3 inline-flex h-11 items-center gap-1.5 rounded-xl border bg-card px-4 font-semibold transition duration-150 hover:bg-muted print:hidden"
      >
        <ArrowLeft className="size-5" aria-hidden /> Back
      </Link>

      <div className="mx-auto grid max-w-3xl items-start gap-4 md:grid-cols-[1fr_16rem] print:block print:max-w-[80mm]">
        <article className="rounded-2xl border bg-card p-6 print:rounded-none print:bg-white print:p-0 print:text-black print:shadow-none">
          <header className="border-b border-dashed pb-4 text-center">
            <h1 className="text-xl font-semibold">{settings.store_name}</h1>
            <p className="text-sm text-muted-foreground print:text-black">
              Sale #{order.id}, {new Date(order.created_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
            </p>
            {order.staff && <p className="text-sm text-muted-foreground print:text-black">Served by {order.staff}</p>}
            {order.status === "cancelled" && <p className="mt-1 font-semibold text-destructive print:text-black">CANCELLED</p>}
          </header>

          <ul className="space-y-2 border-b border-dashed py-4 text-sm">
            {items.map((item) => (
              <li key={item.id} className={row}>
                <span>
                  {item.quantity} × {item.name}
                </span>
                <span className="shrink-0">{money(item.unit_price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-1 pt-4 text-sm">
            {order.tax_amount > 0 && (
              <>
                <div className={row}>
                  <span>Subtotal</span>
                  <span>{money(order.subtotal)}</span>
                </div>
                <div className={row}>
                  <span>Tax ({order.tax_percent}%)</span>
                  <span>{money(order.tax_amount)}</span>
                </div>
              </>
            )}
            <div className={`${row} text-lg font-semibold`}>
              <span>Total</span>
              <span>{money(order.total)}</span>
            </div>
            <div className={row}>
              <span>Paid by</span>
              <span className="capitalize">{order.payment_method}</span>
            </div>
            {order.cash_received !== null && (
              <>
                <div className={row}>
                  <span>Cash received</span>
                  <span>{money(order.cash_received)}</span>
                </div>
                <div className={`${row} font-semibold`}>
                  <span>Change</span>
                  <span>{money(order.change_given)}</span>
                </div>
              </>
            )}
          </div>

          {settings.receipt_footer && (
            <p className="mt-4 border-t border-dashed pt-4 text-center text-sm">{settings.receipt_footer}</p>
          )}
        </article>

        <SaleActions id={order.id} canCancel={user.role === "admin" && order.status === "paid"} />
      </div>
    </main>
  );
}
