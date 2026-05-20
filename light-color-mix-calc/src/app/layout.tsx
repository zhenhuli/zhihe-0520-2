import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "光学三原色混色精准演算工具 | RGB Light Mixer",
  description: "专业舞台灯光混色计算器，调节红绿蓝三色光源亮度占比，实时预览混合色光效果，自动计算混色配比参数与对应色值，支持保存经典灯光配方。",
  keywords: "RGB混色, 舞台灯光, 三原色, 色光混合, 灯光设计, 色彩计算",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
