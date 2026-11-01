"use client";

import { CaretUp, DotsThreeOutline } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useState } from "react";
import { ItemCard } from "@/components/pos/ItemCard";
import { OrderPanel, useCartLines } from "@/components/pos/OrderPanel";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/store/cart";
import type { Product, Settings } from "@/lib/types";
import { calcTotals, formatCurrency } from "@/lib/utils";

export function PosScreen({
  products,
  settings,
  registerCash,
  salesToday,
  dateLabel,
}: {
  products: Product[];
  settings: Settings;
  registerCash: number | null;
  salesToday: number;
  dateLabel: string;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const items = useCart((state) => state.items);
  const add = useCart((state) => state.add);
  const lines = useCartLines(products);

  useEffect(() => {
    useCart.persist.rehydrate();
  }, []);

  const quantityOf = (id: number) => items.find((item) => item.productId === id)?.quantity ?? 0;
  const visible = products.filter((product) => !product.is_hidden);
  const hidden = products.filter((product) => product.is_hidden);

  const count = lines.reduce((sum, { item }) => sum + item.quantity, 0);
  const subtotal = lines.reduce((sum, { item, product }) => sum + product.price * item.quantity, 0);
  const { total } = calcTotals(subtotal, settings.tax_rate);

  const card = (product: Product, onAdd = () => add(product.id)) => (
    <ItemCard
      key={product.id}
      product={product}
      currency={settings.currency}
      quantity={quantityOf(product.id)}
      onAdd={onAdd}
    />
  );

  return (
    <main className="flex h-full flex-col lg:flex-row lg:gap-5 lg:p-5">
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="mb-3 hidden items-end justify-between gap-4 lg:flex">
          <div>
            <h1 className="text-xl font-semibold">{settings.store_name}</h1>
            <p className="text-sm text-muted-foreground">{dateLabel}</p>
          </div>
          <p className="text-sm text-muted-foreground tabular-nums">
            {salesToday} {salesToday === 1 ? "sale" : "sales"} today
          </p>
        </header>
        <h1 className="sr-only lg:hidden">Sell</h1>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3 sm:p-4 lg:-m-2 lg:p-2">
          {products.length === 0 ? (
            <p className="rounded-2xl border bg-card p-8 text-center text-lg text-muted-foreground">
              No items yet. An admin can add them on the Items page.
            </p>
          ) : (
            // Rows share the free height, so tiles fill the screen; past that the area scrolls.
            <div className="grid flex-1 auto-rows-[minmax(8.5rem,1fr)] grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4">
              {visible.map((product) => card(product))}
              {hidden.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMoreOpen(true)}
                  className="flex h-full flex-col items-center justify-center gap-1 rounded-2xl border bg-card p-3 text-lg font-semibold text-muted-foreground transition duration-150 hover:bg-muted active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <DotsThreeOutline className="size-7" aria-hidden />
                  More
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <OrderPanel
        products={products}
        settings={settings}
        registerCash={registerCash}
        className="hidden lg:flex lg:w-[370px] xl:w-[420px]"
      />

      {count > 0 && (
        <div className="shrink-0 px-3 pb-2 sm:px-4 lg:hidden short:p-2">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="flex h-16 w-full items-center justify-between gap-3 rounded-2xl bg-pay px-5 text-white transition duration-150 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none short:h-12"
          >
            <span className="font-semibold">
              {count} {count === 1 ? "item" : "items"}
            </span>
            <span className="flex items-center gap-2 text-lg font-semibold tabular-nums">
              Pay {formatCurrency(total, settings.currency)}
              <CaretUp className="size-5" aria-hidden />
            </span>
          </button>
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="h-[92dvh] gap-0 rounded-t-3xl bg-background p-3 pt-12 lg:hidden short:h-dvh short:rounded-none short:p-2 short:pr-12">
          <SheetTitle className="sr-only">This sale</SheetTitle>
          <SheetDescription className="sr-only">Check the items and choose how the customer paid.</SheetDescription>
          <OrderPanel
            products={products}
            settings={settings}
            registerCash={registerCash}
            onDone={() => setSheetOpen(false)}
            className="h-full short:grid short:grid-cols-2"
          />
        </SheetContent>
      </Sheet>

      <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">More items</DialogTitle>
            <DialogDescription>Tap an item to add it.</DialogDescription>
          </DialogHeader>
          <div className="grid auto-rows-[10rem] grid-cols-2 gap-3">
            {hidden.map((product) =>
              card(product, () => {
                add(product.id);
                setMoreOpen(false);
              }),
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
