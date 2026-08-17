import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin();
  if (!admin) redirect("/login");
  return <AdminShell email={admin.email}>{children}</AdminShell>;
}
