import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import LanguageProvider from "@/components/LanguageProvider";
import BottomNavbar from "@/components/BottomNavbar";
import { getDictionary } from "../i18n/getDictionary";

export const metadata: Metadata = {
  title: "Velo-tebassa",
  description: "Valo-tebessa 12",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
      <body>
        <LanguageProvider lang={lang} dict={dict}>
          <Navbar />
          <main>
            {children}
            <BottomNavbar />
          </main>
        </LanguageProvider>
      </body>
    </html>
  );
}
