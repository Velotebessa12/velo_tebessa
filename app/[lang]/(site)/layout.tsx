import type { Metadata } from "next";
import Navbar from "@/components/Navbar";;
import BottomNavbar from "@/components/BottomNavbar";

export const metadata: Metadata = {
  title: "Velo-tebassa",
  description: "Valo-tebessa 12",
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {

  return (
    <html>
      <body>
          <Navbar />
          <main>
            {children}
            <BottomNavbar />
          </main>
      </body>
    </html>
  );
}
