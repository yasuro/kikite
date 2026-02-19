import type { Metadata } from "next";
import { Montserrat, BIZ_UDPGothic } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";

const montserrat = Montserrat({ 
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700"],
});

const bizUdGothic = BIZ_UDPGothic({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: true,
  variable: "--font-biz-ud-gothic",
});

export const metadata: Metadata = {
  title: "kikite - 電話受注入力システム",
  description: "電話注文受付オペレーター向け受注情報入力システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${montserrat.variable} ${bizUdGothic.variable}`}>
      <body className={bizUdGothic.className}>
        {children}
				<Toaster position="top-right" richColors />
				<SpeedInsights />
      </body>
    </html>
  );
}
