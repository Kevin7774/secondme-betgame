import type { Metadata } from "next";

import "./globals.css";

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
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
