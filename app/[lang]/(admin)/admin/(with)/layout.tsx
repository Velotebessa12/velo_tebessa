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

          {/* Desktop Sidebar space */}
          <div className="hidden md:block w-72 flex-shrink-0" />

          {/* Main Area */}
          <div className="flex-1 flex flex-col min-h-screen">

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
