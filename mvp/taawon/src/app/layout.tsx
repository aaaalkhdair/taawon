import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Inter } from "next/font/google";
import "./globals.css";
import { getT } from "@/i18n/server";
import { I18nProvider } from "@/i18n/client";

const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-arabic",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "تعاون | Taawon",
  description: "منصّة ذكية لمراكز التربية الخاصة — Smart platform for special education centers",
};

export const viewport: Viewport = {
  themeColor: "#1565d8",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { locale, dir } = await getT();
  return (
    <html lang={locale} dir={dir} className={`${plexArabic.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full">
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
