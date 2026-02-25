import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spring FES Video - 故事转视频生成平台",
  description: "将你的故事转化为精美视频",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
