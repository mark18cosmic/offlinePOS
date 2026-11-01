"use client";

import {
  ChartBar,
  Gear,
  Package,
  Receipt,
  ShoppingBag,
  SignOut,
  Storefront,
  Users,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme";
import { logout } from "@/lib/actions/auth";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

const SELL = { href: "/", label: "Sell", icon: ShoppingBag };
const CASHIER_LINKS = [SELL, { href: "/orders", label: "My Sales", icon: Receipt }];
const ADMIN_LINKS = [
  SELL,
  { href: "/reports", label: "Reports", icon: ChartBar },
  { href: "/admin/products", label: "Items", icon: Package },
  { href: "/admin/staff", label: "Staff", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Gear },
];

function useLinks(user: User) {
  const pathname = usePathname();
  const links = user.role === "admin" ? ADMIN_LINKS : CASHIER_LINKS;
  return links.map((link) => ({
    ...link,
    active: link.href === "/" ? pathname === "/" : pathname.startsWith(link.href),
  }));
}

/** Left rail on laptops, tablets in landscape and sideways phones. */
export function NavRail({ user }: { user: User }) {
  const links = useLinks(user);
  return (
    <aside className="hidden w-24 shrink-0 flex-col items-center gap-1.5 overflow-y-auto bg-rail px-2 py-4 text-white lg:flex short:flex short:w-20 short:py-2 print:hidden">
      <span className="mb-3 flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/10 short:hidden">
        <Storefront className="size-7" aria-hidden />
      </span>
      <nav aria-label="Main" className="flex w-full flex-col gap-1.5">
        {links.map(({ href, label, icon: Icon, active }) => (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-16 w-full flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold transition duration-150 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none active:scale-95 short:min-h-12",
              active ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="size-6" aria-hidden />
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto flex w-full flex-col gap-1.5 pt-3">
        <ThemeToggle showLabel className="min-h-14 w-full flex-col gap-1 text-white/80 hover:bg-white/10 hover:text-white short:min-h-12" />
        <button
          type="button"
          onClick={() => logout()}
          className="flex min-h-14 w-full flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold text-white/80 transition duration-150 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none active:scale-95 short:min-h-12"
        >
          <SignOut className="size-6" aria-hidden />
          Sign out
        </button>
      </div>
    </aside>
  );
}

/** Phones and upright tablets: shop name on top, thumb-reach tabs at the bottom. */
export function MobileHeader({ user, storeName }: { user: User; storeName: string }) {
  return (
    <header className="flex shrink-0 items-center gap-2.5 px-3 pt-3 pb-2 sm:px-4 lg:hidden short:hidden print:hidden">
      <Logo />
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg leading-tight font-semibold">{storeName}</p>
        <p className="truncate text-sm text-muted-foreground">{user.full_name}</p>
      </div>
      <ThemeToggle className="size-11 shrink-0 border bg-card" />
      <button
        type="button"
        onClick={() => logout()}
        className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-card px-3 text-sm font-semibold shadow-sm transition duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95"
      >
        <SignOut className="size-5" aria-hidden />
        Sign out
      </button>
    </header>
  );
}

export function BottomTabs({ user }: { user: User }) {
  const links = useLinks(user);
  return (
    <nav
      aria-label="Main"
      className="grid shrink-0 auto-cols-fr grid-flow-col gap-1 border-t bg-card px-1.5 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] lg:hidden short:hidden print:hidden"
    >
      {links.map(({ href, label, icon: Icon, active }) => (
        <Link
          key={href}
          href={href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex h-14 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl text-xs font-semibold transition duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95",
            active ? "bg-tint text-primary" : "text-muted-foreground",
          )}
        >
          <Icon className="size-6" aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );
}
