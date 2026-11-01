import { BottomTabs, MobileHeader, NavRail } from "@/components/app-nav";
import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/data";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="flex h-dvh flex-col bg-rail lg:flex-row short:flex-row print:block print:h-auto print:bg-white">
      <NavRail user={user} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background print:overflow-visible print:bg-white">
        <MobileHeader user={user} storeName={getSettings().store_name} />
        <div className="min-h-0 flex-1 print:overflow-visible">{children}</div>
        <BottomTabs user={user} />
      </div>
    </div>
  );
}
