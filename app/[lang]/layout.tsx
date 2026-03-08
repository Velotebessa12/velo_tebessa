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

  const dir = lang === "ar" ? "rtl" : "ltr";
  return (
        <LanguageProvider lang={lang} dict={dict}>
          <div dir={dir} className="min-h-screen">
        <main>{children}</main>
      </div>
        </LanguageProvider>
  );
}
