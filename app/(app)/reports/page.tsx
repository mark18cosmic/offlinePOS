import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { LiveRefresh, PettyCashForm } from "@/components/admin/report-controls";
import { requireAdmin } from "@/lib/auth";
import { getDailyReport, getPettyCash, getSettings, localDay } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Reports" };

function shiftDay(day: string, by: number) {
  const date = new Date(`${day}T00:00:00`);
  date.setDate(date.getDate() + by);
  return localDay(date);
}

const hourLabel = (hour: number) => `${hour % 12 || 12}${hour < 12 ? "am" : "pm"}`;

function HourlyChart({ hourly, money }: { hourly: number[]; money: (value: number) => string }) {
  const active = hourly.flatMap((value, hour) => (value > 0 ? [hour] : []));
  if (active.length === 0) return null;
  const first = Math.min(8, active[0]);
  const last = Math.max(20, active[active.length - 1]);
  const hours = Array.from({ length: last - first + 1 }, (_, index) => first + index);
  const peak = Math.max(...hourly);

  return (
    <section aria-label="Sales by hour" className="rounded-2xl border bg-card p-4 sm:p-5">
      <h2 className="mb-4 text-lg font-semibold">Sales by hour</h2>
      <div aria-hidden className="flex h-36 items-end gap-0.5 border-b sm:gap-1">
        {hours.map((hour) => (
          <div key={hour} tabIndex={-1} className="group relative flex h-full min-w-0 flex-1 items-end">
            {hourly[hour] > 0 && (
              <div
                style={{ height: `${Math.max(4, (hourly[hour] / peak) * 100)}%` }}
                className="w-full rounded-t bg-primary transition duration-150 group-hover:opacity-80"
              />
            )}
            {hourly[hour] > 0 && (
              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 hidden -translate-x-1/2 rounded-lg bg-foreground px-2 py-1 text-xs font-semibold whitespace-nowrap text-background tabular-nums group-hover:block">
                {hourLabel(hour)}: {money(hourly[hour])}
              </span>
            )}
          </div>
        ))}
      </div>
      <div aria-hidden className="mt-1.5 flex justify-between text-xs font-medium text-muted-foreground">
        <span>{hourLabel(first)}</span>
        <span>{hourLabel(last)}</span>
      </div>
      <table className="sr-only">
        <caption>Sales by hour</caption>
        <tbody>
          {active.map((hour) => (
            <tr key={hour}>
              <th scope="row">{hourLabel(hour)}</th>
              <td>{money(hourly[hour])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  await requireAdmin();
  const today = localDay();
  const { date } = await searchParams;
  const valid = date && /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date)) && date <= today;
  const day = valid ? date : today;
  const isToday = day === today;

  const settings = getSettings();
  const money = (value: number) => formatCurrency(value, settings.currency);
  const report = getDailyReport(day);
  const pettyCash = getPettyCash(day);
  const showPetty = Boolean(settings.petty_cash_enabled);
  const average = report.count ? Math.round(report.total / report.count) : 0;

  const methods = (["cash", "card", "transfer"] as const).filter(
    (method) => settings[`${method}_enabled`] || report.byMethod[method] > 0,
  );
  const navButton =
    "flex size-12 shrink-0 items-center justify-center rounded-xl border bg-card transition duration-150 hover:bg-muted active:scale-95";
  const topItem = Math.max(1, ...report.items.map((item) => item.total));

  return (
    <main className="h-full overflow-y-auto p-3 sm:p-4 lg:p-6">
      <div className="mx-auto max-w-6xl space-y-3 lg:space-y-4">
        <div className="flex items-center gap-2">
          <Link href={`/reports?date=${shiftDay(day, -1)}`} aria-label="Previous day" className={navButton}>
            <CaretLeft className="size-5" aria-hidden />
          </Link>
          {!isToday && (
            <Link href={`/reports?date=${shiftDay(day, 1)}`} aria-label="Next day" className={navButton}>
              <CaretRight className="size-5" aria-hidden />
            </Link>
          )}
          <h1 className="ml-1 min-w-0 truncate text-2xl font-semibold sm:text-3xl">
            {isToday
              ? "Today"
              : new Date(`${day}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </h1>
          <div className="ml-auto shrink-0">
            {isToday ? (
              <LiveRefresh />
            ) : (
              <Link href="/reports" className="flex h-12 items-center rounded-xl border bg-card px-4 font-semibold">
                Today
              </Link>
            )}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-4">
          <dl className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-4 sm:p-5">
            <div>
              <dt className="text-muted-foreground">Total sales</dt>
              <dd className="mt-1 text-3xl font-semibold tabular-nums">{money(report.total)}</dd>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-sm text-muted-foreground">Number of sales</dt>
                <dd className="text-xl font-semibold tabular-nums">{report.count}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Average sale</dt>
                <dd className="text-xl font-semibold tabular-nums">{money(average)}</dd>
              </div>
            </div>
          </dl>

          {showPetty ? (
            <section aria-label="Cash in register" className="rounded-2xl border bg-card p-4 sm:p-5">
              <h2 className="text-lg font-semibold">Cash in register</h2>
              <dl className="mt-2 grid gap-1 tabular-nums">
                <div className="flex justify-between gap-3">
                  <dt>Petty cash{pettyCash.isDefault && " (default)"}</dt>
                  <dd className="font-semibold">{money(pettyCash.amount)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Cash sales</dt>
                  <dd className="font-semibold">{money(report.byMethod.cash)}</dd>
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-3 border-t pt-2 text-lg font-semibold">
                  <dt>Should be in register</dt>
                  <dd className="text-2xl">{money(pettyCash.amount + report.byMethod.cash)}</dd>
                </div>
                <div className="flex justify-between gap-3 text-sm text-muted-foreground">
                  <dt>Change given out so far</dt>
                  <dd>{money(report.changeGiven)}</dd>
                </div>
              </dl>
              {isToday && <PettyCashForm currency={settings.currency} />}
            </section>
          ) : (
            <HourlyChart hourly={report.hourly} money={money} />
          )}
        </div>

        <dl className="grid auto-cols-fr grid-flow-col gap-2 sm:gap-3">
          {methods.map((method) => (
            <div key={method} className="min-w-0 rounded-2xl border bg-card p-3 sm:p-4">
              <dt className="text-sm font-medium text-muted-foreground capitalize">{method}</dt>
              <dd className="mt-1 truncate font-semibold tabular-nums sm:text-xl">{money(report.byMethod[method])}</dd>
            </div>
          ))}
        </dl>

        {showPetty && <HourlyChart hourly={report.hourly} money={money} />}

        <div className="grid items-start gap-3 lg:grid-cols-2 lg:gap-4">
          <section aria-label="Employees" className="rounded-2xl border bg-card p-4 sm:p-5">
            <h2 className="mb-3 text-lg font-semibold">Employees</h2>
            {report.employees.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">No sales yet.</p>
            ) : (
              <ul className="space-y-3">
                {report.employees.map((employee) => (
                  <li key={employee.name} className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-tint font-semibold text-primary"
                    >
                      {employee.name[0]?.toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{employee.name}</span>
                      <span className="block truncate text-sm text-muted-foreground tabular-nums">
                        {employee.count} {employee.count === 1 ? "sale" : "sales"}, {money(employee.cash)} cash
                      </span>
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums">{money(employee.total)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-label="Items sold" className="rounded-2xl border bg-card p-4 sm:p-5">
            <h2 className="mb-3 text-lg font-semibold">Items sold</h2>
            {report.items.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">No sales yet.</p>
            ) : (
              <ul className="space-y-3">
                {report.items.map((item) => (
                  <li key={item.name}>
                    <div className="flex items-baseline justify-between gap-3 tabular-nums">
                      <span className="min-w-0 truncate">
                        <span className="font-semibold">{item.quantity} ×</span> {item.name}
                      </span>
                      <span className="shrink-0 font-semibold">{money(item.total)}</span>
                    </div>
                    <div aria-hidden style={{ width: `${(item.total / topItem) * 100}%` }} className="mt-1 h-1.5 rounded-full bg-primary" />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <section aria-label="Sales">
          <h2 className="mb-2 text-lg font-semibold">All sales</h2>
          {report.orders.length === 0 ? (
            <p className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">No sales on this day.</p>
          ) : (
            <ul className="grid gap-2 lg:grid-cols-2">
              {report.orders.map((order) => (
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
                        {order.staff && `, ${order.staff}`}
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
        </section>
      </div>
    </main>
  );
}
