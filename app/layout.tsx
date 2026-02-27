import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { LanguageContext } from "@/components/LanguageContext";
import LanguageProvider from "@/components/LanguageProvider";
import BottomNavbar from "@/components/BottomNavbar";
import { AuthProvider } from "@/components/AuthContext";

export const metadata: Metadata = {
  title: {
    default: "Velo-Tebassa",
    template: "%s | Velo-Tebassa",
  },

  description:
    "Your store in seconds – Quality bikes and accessories in Tebassa.",

  keywords: [
    "velo",
    "tebassa",
    "bikes",
    "bicycle store",
    "cycling",
    "algeria bikes",
    "velo tebessa",
    "bike accessories",
  ],

  authors: [{ name: "Velo-Tebassa" }],

  creator: "Velo-Tebassa",
  metadataBase: new URL("https://velo-tebassa.com"),

  openGraph: {
    title: "Velo-Tebassa",
    description:
      "Your store in seconds – Discover the best bikes and accessories.",
    url: "https://velo-tebassa.com",
    siteName: "Velo-Tebassa",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Velo-Tebassa Store",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Velo-Tebassa",
    description: "Your store in seconds – Quality bikes and accessories.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],

    apple: [{ url: "/apple-touch-icon.png" }],

    other: [
      {
        rel: "android-chrome-192x192",
        url: "/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/android-chrome-512x512.png",
      },
    ],
  },

  manifest: "/site.webmanifest",

  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }: Readonly<{
  children: React.ReactNode;
 }>) {


  return (
    <html>
      <body>
        <main>
          <AuthProvider>{children}</AuthProvider>

          {/* <BottomNavbar/> */}
        </main>
        <Toaster />

        <div
          className="text-center text-white py-3 text-sm tracking-wide shadow-inner"
          style={{ backgroundColor: "#C7290E" }}
        >
          <span className="opacity-90">Powered by</span>{" "}
          <a
            href="https://www.instagram.com/dzbuildssite"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:underline underline-offset-2 transition"
          >
            @Dzbuildssite
          </a>
        </div>
      </body>
    </html>
  );
}
