import {
  Acorn,
  BowlFood,
  Cigarette,
  Coffee,
  Cookie,
  Drop,
  Hamburger,
  Package,
  PintGlass,
  ShoppingBag,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

type ItemVisual = { label: string; icon: Icon; tile: string };

const COFFEE = "bg-coffee text-coffee-ink";
const WATER = "bg-water text-water-ink";
const NUTS = "bg-nuts text-nuts-ink";
const PLATE = "bg-plate text-plate-ink";
const SMOKE = "bg-smoke text-smoke-ink";
const SWEET = "bg-sweet text-sweet-ink";
const BAG = "bg-bag text-bag-ink";

/** The pictures an admin can choose for an item. Each one brings its own tile colour. */
export const ITEM_ICONS: Record<string, ItemVisual> = {
  coffee: { label: "Coffee", icon: Coffee, tile: COFFEE },
  water: { label: "Water", icon: Drop, tile: WATER },
  drink: { label: "Drink", icon: PintGlass, tile: WATER },
  nuts: { label: "Nuts", icon: Acorn, tile: NUTS },
  plate: { label: "Plate", icon: BowlFood, tile: PLATE },
  burger: { label: "Burger", icon: Hamburger, tile: PLATE },
  snack: { label: "Snack", icon: Cookie, tile: SWEET },
  cigarette: { label: "Cigarette", icon: Cigarette, tile: SMOKE },
  box: { label: "Box", icon: Package, tile: SMOKE },
  bag: { label: "Other", icon: ShoppingBag, tile: BAG },
};

export const itemVisual = (key: string) => ITEM_ICONS[key] ?? ITEM_ICONS.bag;
