import { StaffManager } from "@/components/admin/staff-manager";
import { requireAdmin } from "@/lib/auth";
import { getStaff } from "@/lib/data";

export const metadata = { title: "Staff" };

export default async function AdminStaffPage() {
  await requireAdmin();
  return <StaffManager staff={getStaff()} />;
}
