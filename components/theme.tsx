"use client";

import { Moon, Sun } from "@phosphor-icons/react/dist/ssr";
import { useSyncExternalStore } from "react";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const isDark = () => document.documentElement.classList.contains("dark");

function useDarkMode() {
  return useSyncExternalStore(subscribe, isDark, () => false);
}

export function ThemeToggle({ className, showLabel = false }: { className?: string; showLabel?: boolean }) {
  const dark = useDarkMode();
  const label = dark ? "Light mode" : "Dark mode";
  const Icon = dark ? Sun : Moon;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        const next = !isDark();
        document.documentElement.classList.toggle("dark", next);
        localStorage.setItem("pos-theme", next ? "dark" : "light");
        listeners.forEach((listener) => listener());
      }}
      className={cn(
        "flex items-center justify-center rounded-xl transition duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95",
        className,
      )}
    >
      <Icon className="size-6" aria-hidden />
      {showLabel && <span className="text-xs font-semibold">{dark ? "Light" : "Dark"}</span>}
    </button>
  );
}

export function AppToaster() {
  const dark = useDarkMode();
  return <Toaster position="top-center" richColors theme={dark ? "dark" : "light"} toastOptions={{ className: "text-base" }} />;
}
