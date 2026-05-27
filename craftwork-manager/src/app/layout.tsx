import type { Metadata } from "next";
import { Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import Layout from "@/components/Layout";

const notoSansSC = Noto_Sans_SC({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "匠心工坊 - 手艺人的全链路管理系统",
  description: "面向手工从业者、手作工作室、独立匠人的全链路工艺管理+成本核算+作品归档系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={notoSansSC.className}>
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
