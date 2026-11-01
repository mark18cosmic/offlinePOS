"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setTodaysPettyCash } from "@/lib/actions/admin";

/** Re-fetches the report every few seconds so new sales appear on their own. */
export function LiveRefresh() {
  const router = useRouter();
  useEffect(() => {
    const timer = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(timer);
  }, [router]);
  return (
    <span className="flex items-center gap-2 rounded-full bg-tint px-4 py-2 font-semibold text-primary">
      <span aria-hidden className="size-2 rounded-full bg-primary" />
      Live
    </span>
  );
}

export function PettyCashForm({ currency }: { currency: string }) {
  const [pending, startTransition] = useTransition();
  const form = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={form}
      className="mt-4"
      onSubmit={(event) => {
        event.preventDefault();
        const amount = Number(new FormData(event.currentTarget).get("amount"));
        startTransition(async () => {
          const result = await setTodaysPettyCash(amount);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("Today's petty cash set");
          form.current?.reset();
        });
      }}
    >
      <label htmlFor="today-petty" className="mb-1.5 block text-sm font-semibold">
        Set today&apos;s petty cash ({currency})
      </label>
      <div className="flex gap-2">
        <Input
          id="today-petty"
          name="amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          required
          className="h-12 min-w-0 flex-1 bg-card text-base"
        />
        <Button type="submit" disabled={pending} className="h-12 shrink-0 rounded-xl px-5 font-semibold">
          Set for today
        </Button>
      </div>
    </form>
  );
}
