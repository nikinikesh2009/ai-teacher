import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-panel flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <div className="ml-[240px] flex flex-1 flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-6 transition-opacity duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}
