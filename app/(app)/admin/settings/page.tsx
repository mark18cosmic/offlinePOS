import { SettingsForm } from "@/components/admin/settings-form";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/data";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  await requireAdmin();
  return <SettingsForm settings={getSettings()} />;
}
