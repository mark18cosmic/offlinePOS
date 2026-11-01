import { Storefront } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground", className)}>
      <Storefront className="size-6" aria-hidden />
    </span>
  );
}
