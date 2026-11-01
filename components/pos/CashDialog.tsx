"use client";

import { Warning } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cashSuggestions, cn, formatCurrency } from "@/lib/utils";

function CashForm({
  total,
  currency,
  registerCash,
  pending,
  onComplete,
}: {
  total: number;
  currency: string;
  registerCash: number | null;
  pending: boolean;
  onComplete: (received: number) => void;
}) {
  // Starts on the exact total, the quickest case. Tapping a note or typing replaces it.
  const [picked, setPicked] = useState(total);
  const [typed, setTyped] = useState("");
  const money = (value: number) => formatCurrency(value, currency);

  const received = typed ? Math.round(Number(typed) * 100) : picked;
  const change = received - total;
  const enough = Number.isFinite(received) && change >= 0;
  const shortOfChange = registerCash !== null && enough && change > registerCash;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {cashSuggestions(total).map((amount) => (
          <button
            key={amount}
            type="button"
            aria-pressed={!typed && picked === amount}
            onClick={() => {
              setPicked(amount);
              setTyped("");
            }}
            className={cn(
              "flex min-h-16 flex-col items-center justify-center rounded-xl px-1 font-semibold tabular-nums transition duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-[0.97]",
              !typed && picked === amount ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-tint",
            )}
          >
            {amount === total && <span className="text-xs font-semibold">Exact</span>}
            {money(amount)}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cash-other">Other amount ({currency})</Label>
        <Input
          id="cash-other"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          className="h-12 text-base"
        />
      </div>

      <div aria-live="polite" className={cn("rounded-2xl p-4", enough ? "bg-tint" : "bg-warn text-warn-ink")}>
        {enough ? (
          <>
            <p className="font-semibold">Give back</p>
            <p className="text-4xl font-semibold tabular-nums">{money(change)}</p>
          </>
        ) : (
          <p className="text-lg font-semibold tabular-nums">Still {money(Number.isFinite(change) ? -change : total)} short</p>
        )}
      </div>

      {shortOfChange && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-warn p-3 text-sm font-semibold text-warn-ink">
          <Warning className="mt-0.5 size-5 shrink-0" aria-hidden />
          The register may not have enough change. It should hold {money(registerCash)}.
        </p>
      )}

      <Button
        className="h-14 w-full rounded-xl text-lg font-semibold"
        disabled={!enough || pending}
        onClick={() => onComplete(received)}
      >
        {pending ? "Saving…" : "Complete sale"}
      </Button>
    </div>
  );
}

export function CashDialog({
  open,
  onOpenChange,
  total,
  currency,
  registerCash,
  pending,
  onComplete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  currency: string;
  registerCash: number | null;
  pending: boolean;
  onComplete: (received: number) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* No auto focus: focusing the amount box would pop up the phone keyboard over the note buttons. */}
      <DialogContent
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="max-h-[92dvh] overflow-y-auto rounded-2xl sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="text-xl">How much did they give you?</DialogTitle>
          <DialogDescription className="text-base tabular-nums">
            Total to pay: {formatCurrency(total, currency)}
          </DialogDescription>
        </DialogHeader>
        <CashForm total={total} currency={currency} registerCash={registerCash} pending={pending} onComplete={onComplete} />
      </DialogContent>
    </Dialog>
  );
}
