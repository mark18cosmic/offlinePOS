"use client";

import { Bank, CreditCard, HandTap, Minus, Money, Plus } from "@phosphor-icons/react/dist/ssr";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { CashDialog } from "@/components/pos/CashDialog";
import { completeSale } from "@/lib/actions/orders";
import { itemVisual } from "@/lib/item-icons";
import { useCart } from "@/lib/store/cart";
import type { PaymentMethod, Product, Settings } from "@/lib/types";
import { calcTotals, cn, formatCurrency } from "@/lib/utils";

const PAYMENTS: { value: PaymentMethod; label: string; icon: typeof Money }[] = [
  { value: "cash", label: "Cash", icon: Money },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "transfer", label: "Transfer", icon: Bank },
];

/** Cart lines joined with current product data; items removed from the shop drop out. */
export function useCartLines(products: Product[]) {
  const items = useCart((state) => state.items);
  return items.flatMap((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    return product ? [{ item, product }] : [];
  });
}

export function OrderPanel({
  products,
  settings,
  registerCash,
  onDone,
  className,
}: {
  products: Product[];
  settings: Settings;
  registerCash: number | null;
  onDone?: () => void;
  className?: string;
}) {
  const { reset, setQuantity } = useCart();
  const lines = useCartLines(products);
  const [pending, startTransition] = useTransition();
  const [clearing, setClearing] = useState(false);
  const [takingCash, setTakingCash] = useState(false);
  const money = (value: number) => formatCurrency(value, settings.currency);

  const subtotal = lines.reduce((sum, { item, product }) => sum + product.price * item.quantity, 0);
  const totals = calcTotals(subtotal, settings.tax_rate);
  const isEmpty = lines.length === 0;
  const payments = PAYMENTS.filter(({ value }) => settings[`${value}_enabled`]);

  function finish(paymentMethod: PaymentMethod, cashReceived: number | null) {
    startTransition(async () => {
      try {
        const result = await completeSale({
          paymentMethod,
          cashReceived,
          items: lines.map(({ item }) => ({ productId: item.productId, quantity: item.quantity })),
        });
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        const change = result.data?.change ?? 0;
        toast.success(
          change > 0
            ? `Sale complete. Give back ${money(change)}`
            : `Sale complete. ${money(result.data?.total ?? 0)} by ${paymentMethod}`,
        );
        setTakingCash(false);
        reset();
        onDone?.();
      } catch {
        toast.error("The sale was not saved. Please try again.");
      }
    });
  }

  function onPay(method: PaymentMethod) {
    if (isEmpty) {
      toast.info("Tap an item first");
      return;
    }
    if (method === "cash") setTakingCash(true);
    else finish(method, null);
  }

  return (
    <div className={cn("flex min-h-0 flex-col overflow-hidden rounded-2xl border bg-card", className)}>
      <div className="flex min-h-0 flex-1 flex-col p-4 short:p-3">
        <div className="flex min-h-11 items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">This sale</h2>
          {!isEmpty && (
            <button
              type="button"
              onClick={() => setClearing(true)}
              className="h-11 rounded-xl px-3 text-sm font-semibold text-destructive transition duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="min-h-16 flex-1 overflow-y-auto">
          {isEmpty ? (
            <div className="flex h-full min-h-16 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <HandTap className="size-10 short:hidden" aria-hidden />
              <p className="text-lg font-medium">Tap an item to start</p>
            </div>
          ) : (
            <ul className="divide-y">
              {lines.map(({ item, product }) => {
                const { icon: Icon, tile } = itemVisual(product.icon);
                return (
                  <li
                    key={item.productId}
                    className="flex items-center gap-2.5 py-2"
                  >
                    <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", tile)}>
                      <Icon className="size-6" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{product.name}</p>
                      <p className="text-sm font-medium text-muted-foreground tabular-nums">
                        {money(product.price * item.quantity)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center rounded-xl bg-muted">
                      <button
                        type="button"
                        aria-label={`One less ${product.name}`}
                        onClick={() => setQuantity(item.productId, item.quantity - 1)}
                        className="flex size-11 items-center justify-center rounded-xl transition duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-90"
                      >
                        <Minus className="size-5" aria-hidden />
                      </button>
                      <span aria-live="polite" className="w-6 text-center font-semibold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`One more ${product.name}`}
                        onClick={() => setQuantity(item.productId, item.quantity + 1)}
                        className="flex size-11 items-center justify-center rounded-xl transition duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-90"
                      >
                        <Plus className="size-5" aria-hidden />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Stays dark in both themes: this is the one block staff should always find. */}
      <div className="shrink-0 bg-pay p-4 text-white short:flex short:flex-col short:justify-center short:p-3">
        {settings.tax_rate > 0 && (
          <p className="flex justify-between text-sm text-white/80 tabular-nums">
            <span>Tax ({settings.tax_rate}%)</span>
            <span>{money(totals.taxAmount)}</span>
          </p>
        )}
        <p className="flex items-baseline justify-between gap-3">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-3xl font-semibold tabular-nums">{money(totals.total)}</span>
        </p>
        <p className="mt-3 mb-2 font-semibold short:mt-1 short:mb-1">How did they pay?</p>
        <div className="grid auto-cols-fr grid-flow-col gap-2">
          {payments.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              disabled={pending}
              onClick={() => onPay(value)}
              className={cn(
                "flex h-20 min-w-0 flex-col items-center justify-center gap-1 rounded-xl text-base font-semibold transition duration-150 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-pay focus-visible:outline-none active:scale-[0.96] short:h-16",
                isEmpty ? "bg-white/15 text-white hover:bg-white/20" : "bg-white text-rail shadow-sm hover:bg-white/90",
                pending && "opacity-70",
              )}
            >
              <Icon className="size-7 short:size-6" aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </div>

      <CashDialog
        open={takingCash}
        onOpenChange={setTakingCash}
        total={totals.total}
        currency={settings.currency}
        registerCash={registerCash}
        pending={pending}
        onComplete={(received) => finish("cash", received)}
      />
      <ConfirmDialog
        open={clearing}
        onOpenChange={setClearing}
        title="Clear this sale?"
        description="All items on this sale will be taken off."
        confirmLabel="Yes, clear"
        onConfirm={reset}
      />
    </div>
  );
}
