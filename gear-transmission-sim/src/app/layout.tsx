import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "齿轮传动模拟器",
  description: "机械齿轮传动动态模拟器 - 自由添加不同齿数齿轮，拖拽啮合组合，自动计算传动转速比",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
