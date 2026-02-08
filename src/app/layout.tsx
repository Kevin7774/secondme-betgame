import type { Metadata } from "next";
import { Noto_Sans_SC, ZCOOL_XiaoWei } from "next/font/google";

import "./globals.css";

const notoSans = Noto_Sans_SC({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const xiaoWei = ZCOOL_XiaoWei({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI新葡京娱乐城 | SecondMe 控制台",
  description: "基于 SecondMe OAuth2 的 A2A 控制台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${notoSans.variable} ${xiaoWei.variable} font-body antialiased`}>
        {children}
      </body>
    </html>
  );
}
