import type { Metadata } from "next";
import { Montserrat, Poppins } from "next/font/google";
import { Backdrop } from "@/components/shell/backdrop";
import { I18nProvider } from "@/i18n/client";
import { getLocale } from "@/i18n/server";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "MosqAI Shield · Beyond the Capture.", template: "%s · MosqAI Shield" },
  description: "Area-level mosquito activity, device health and alerts for health authorities.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${poppins.variable} ${montserrat.variable} h-full antialiased`}>
      <body className="h-full font-sans">
        <Backdrop />
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
