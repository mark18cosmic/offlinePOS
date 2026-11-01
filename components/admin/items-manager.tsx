"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PencilSimple, Plus, Trash } from "@phosphor-icons/react/dist/ssr";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/admin/form-field";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { removeProduct, saveProduct } from "@/lib/actions/admin";
import { ITEM_ICONS, itemVisual } from "@/lib/item-icons";
import { productSchema, type ProductInput } from "@/lib/schemas";
import type { Product } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

function ItemForm({ product, currency, onDone }: { product: Product | null; currency: string; onDone: () => void }) {
  const [pending, startTransition] = useTransition();
  const { register, handleSubmit, control, formState } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      price: product ? product.price / 100 : undefined,
      icon: product && ITEM_ICONS[product.icon] ? product.icon : "bag",
      isAvailable: product ? Boolean(product.is_available) : true,
      isHidden: Boolean(product?.is_hidden),
    },
  });

  const onSubmit = handleSubmit((values) =>
    startTransition(async () => {
      const result = await saveProduct(product?.id ?? null, values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Item saved");
      onDone();
    }),
  );

  const toggles = [
    { name: "isAvailable", label: "In stock (off shows Sold out)" },
    { name: "isHidden", label: "Hide behind the More card" },
  ] as const;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormField label="Name" htmlFor="item-name" error={formState.errors.name?.message}>
        <Input id="item-name" className="h-12 text-base" {...register("name")} />
      </FormField>
      <FormField label="Picture" error={formState.errors.icon?.message}>
        <Controller
          control={control}
          name="icon"
          render={({ field }) => (
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(ITEM_ICONS).map(([key, { label, icon: Icon, tile }]) => (
                <button
                  key={key}
                  type="button"
                  aria-label={label}
                  aria-pressed={field.value === key}
                  title={label}
                  onClick={() => field.onChange(key)}
                  className={cn(
                    "flex aspect-square min-h-11 items-center justify-center rounded-xl transition duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95",
                    tile,
                    field.value === key && "outline-[3px] outline-offset-2 outline-primary",
                  )}
                >
                  <Icon className="size-7" aria-hidden />
                </button>
              ))}
            </div>
          )}
        />
      </FormField>
      <FormField label={`Price (${currency})`} htmlFor="item-price" error={formState.errors.price?.message}>
        <Input
          id="item-price"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          className="h-12 text-base"
          {...register("price", { valueAsNumber: true })}
        />
      </FormField>
      {toggles.map((toggle) => (
        <Controller
          key={toggle.name}
          control={control}
          name={toggle.name}
          render={({ field }) => (
            <div className="flex min-h-11 items-center justify-between gap-3">
              <Label htmlFor={toggle.name}>{toggle.label}</Label>
              <Switch id={toggle.name} checked={field.value} onCheckedChange={field.onChange} />
            </div>
          )}
        />
      ))}
      <Button type="submit" disabled={pending} className="h-14 w-full rounded-xl text-lg font-semibold">
        {pending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}

export function ItemsManager({ products, currency }: { products: Product[]; currency: string }) {
  // undefined = dialog closed, null = adding a new item.
  const [editing, setEditing] = useState<Product | null | undefined>(undefined);
  const [removing, setRemoving] = useState<Product | null>(null);
  const [, startTransition] = useTransition();

  return (
    <main className="h-full overflow-y-auto p-3 sm:p-4 lg:p-6">
      <h1 className="mb-3 text-2xl font-semibold">Items</h1>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="flex min-h-44 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-input text-lg font-semibold text-muted-foreground transition duration-150 hover:bg-card active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Plus className="size-8" aria-hidden />
          Add item
        </button>
        {products.map((product) => {
          const { icon: Icon, tile } = itemVisual(product.icon);
          return (
            <div key={product.id} className="flex min-h-44 flex-col rounded-2xl border bg-card p-3">
              <div className="flex flex-1 items-center gap-3">
                <span className={cn("flex size-16 shrink-0 items-center justify-center rounded-xl", tile)}>
                  <Icon className="size-9" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold">{product.name}</p>
                  <p className="font-medium text-muted-foreground tabular-nums">{formatCurrency(product.price, currency)}</p>
                  <p className="text-sm font-semibold text-primary">
                    {!product.is_available ? "Sold out" : product.is_hidden ? "Behind More" : ""}
                  </p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button variant="secondary" className="h-12 rounded-xl font-semibold" onClick={() => setEditing(product)}>
                  <PencilSimple className="size-5" aria-hidden /> Edit
                </Button>
                <Button
                  variant="secondary"
                  className="h-12 rounded-xl font-semibold text-destructive hover:text-destructive"
                  onClick={() => setRemoving(product)}
                >
                  <Trash className="size-5" aria-hidden /> Remove
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={editing !== undefined} onOpenChange={(open) => !open && setEditing(undefined)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit item" : "Add item"}</DialogTitle>
            <DialogDescription>Changes show on the Sell screen straight away.</DialogDescription>
          </DialogHeader>
          <ItemForm product={editing ?? null} currency={currency} onDone={() => setEditing(undefined)} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(open) => !open && setRemoving(null)}
        title={`Remove ${removing?.name ?? "item"}?`}
        description="It goes off the Sell screen. Past sales keep their record of it."
        confirmLabel="Remove"
        onConfirm={() => {
          if (removing) startTransition(async () => void (await removeProduct(removing.id)));
        }}
      />
    </main>
  );
}
