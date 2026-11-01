import { ItemsManager } from "@/components/admin/items-manager";
import { requireAdmin } from "@/lib/auth";
import { getProducts, getSettings } from "@/lib/data";

export const metadata = { title: "Items" };

export default async function AdminItemsPage() {
  await requireAdmin();
  return <ItemsManager products={getProducts()} currency={getSettings().currency} />;
}
