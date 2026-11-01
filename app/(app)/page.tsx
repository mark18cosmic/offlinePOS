import { PosScreen } from "@/components/pos/PosScreen";
import { requireUser } from "@/lib/auth";
import { getDailyReport, getPettyCash, getProducts, getSettings, getTodaysOrdersFor, localDay } from "@/lib/data";

export default async function SellPage() {
  const user = await requireUser();
  const settings = getSettings();
  const today = localDay();
  const report = getDailyReport(today);
  const salesToday =
    user.role === "admin"
      ? report.count
      : getTodaysOrdersFor(user.id).filter((order) => order.status === "paid").length;

  return (
    <PosScreen
      products={getProducts()}
      settings={settings}
      // What should be in the register right now, for the change warning. Null when petty cash is off.
      registerCash={settings.petty_cash_enabled ? getPettyCash(today).amount + report.byMethod.cash : null}
      salesToday={salesToday}
      dateLabel={new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
    />
  );
}
