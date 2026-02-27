import AdminBottomNavbar from "@/components/AdminBottomNavbar";
import AdminNavbar from "../_components/AdminNavbar";
import AdminSidebar from "../_components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
  {/* Sidebar */}
  <AdminSidebar />

  {/* Main Content Area */}
  <div className="flex-1 flex flex-col">
    <AdminNavbar />

    <main className="flex-1 bg-slate-50">
      {children}
    </main>

    <AdminBottomNavbar />
  </div>
</div>

  );
}
