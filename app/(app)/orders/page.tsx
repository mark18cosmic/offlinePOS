import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getPettyCash, getSettings, getTodaysOrdersFor, localDay } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "My Sales" };

export default async function MySalesPage() {
  const user = await requireUser();
  if (user.role === "admin") redirect("/reports");
  const orders = getTodaysOrdersFor(user.id);
  const settings = getSettings();
  const money = (value: number) => formatCurrency(value, settings.currency);
  const paid = orders.filter((order) => order.status === "paid");

  return (
    <main className="h-full overflow-y-auto p-3 sm:p-4 lg:p-6">
      <div className="mx-auto max-w-3xl space-y-3">
        <h1 className="text-2xl font-semibold">My sales today</h1>
        <dl className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border bg-card p-4">
            <dt className="text-sm text-muted-foreground">I sold</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">
              {money(paid.reduce((sum, order) => sum + order.total, 0))}
            </dd>
          </div>
          {Boolean(settings.petty_cash_enabled) && (
            <div className="rounded-2xl border bg-card p-4">
              <dt className="text-sm font-medium text-muted-foreground">Starting cash in register</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">
                {money(getPettyCash(localDay()).amount)}
              </dd>
            </div>
          )}
        </dl>
        {orders.length === 0 ? (
          <p className="rounded-2xl border bg-card p-8 text-center text-lg text-muted-foreground">No sales yet today.</p>
        ) : (
          <ul className="grid gap-2">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="flex min-h-16 items-center gap-3 rounded-2xl border bg-card p-4 transition duration-150 hover:bg-muted active:scale-[0.99]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">Sale #{order.id}</span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })},{" "}
                      {order.payment_method}
                    </span>
                  </span>
                  {order.status === "cancelled" ? (
                    <span className="shrink-0 font-semibold text-destructive">Cancelled</span>
                  ) : (
                    <span className="shrink-0 font-semibold tabular-nums">{money(order.total)}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
