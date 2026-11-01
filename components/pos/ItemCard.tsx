import { itemVisual } from "@/lib/item-icons";
import type { Product } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

export function ItemCard({
  product,
  currency,
  quantity,
  onAdd,
}: {
  product: Product;
  currency: string;
  quantity: number;
  onAdd: () => void;
}) {
  const available = Boolean(product.is_available);
  const { icon: Icon, tile } = itemVisual(product.icon);
  return (
    <button
      type="button"
      disabled={!available}
      onClick={onAdd}
      className={cn(
        "relative flex h-full w-full flex-col justify-center gap-3 rounded-2xl border bg-card p-4 text-left transition duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
        available ? "hover:bg-muted active:scale-[0.98]" : "cursor-not-allowed opacity-50",
        quantity > 0 && "border-primary outline-2 -outline-offset-2 outline-primary",
      )}
    >
      <span className={cn("flex size-11 items-center justify-center rounded-xl", tile)}>
        <Icon aria-hidden className="size-6" />
      </span>
      <span className="block">
        <span className="block text-lg leading-tight font-semibold text-balance">{product.name}</span>
        <span className="mt-1 block text-muted-foreground tabular-nums">
          {available ? formatCurrency(product.price, currency) : "Sold out"}
        </span>
      </span>
      {quantity > 0 && (
        <span className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-xl bg-primary font-semibold text-primary-foreground tabular-nums">
          {quantity}
        </span>
      )}
    </button>
  );
}
