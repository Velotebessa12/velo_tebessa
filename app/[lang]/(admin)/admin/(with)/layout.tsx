import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import BottomNavbar from "@/components/BottomNavbar";
import AdminNavbar from "../_components/AdminNavbar";
import AdminBottomNavbar from "@/components/AdminBottomNavbar";

export const metadata: Metadata = {
  title: "Velo-tebassa",
  description: "Valo-tebessa 12",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
<div className="min-h-screen flex bg-slate-50">

  {/* Main Area */}
  <div className="flex-1 flex flex-col min-h-screen min-w-0 md:ms-72 rtl:md:ms-0 rtl:md:me-72">

    {/* Navbar */}
    <AdminNavbar />

    {/* Page Content */}
    <main className="flex-1 p-4 md:p-6">
      {children}
    </main>

    {/* Mobile Bottom Navbar */}
    <AdminBottomNavbar />

  </div>

</div>
  );
}
