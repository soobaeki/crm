import { Geist } from "next/font/google";
import type { Metadata } from "next";
import "@/styles/globals.css";
import NavBar from "../components/layouts/NavBar";
import Providers from "./Providers";

// 폰트 설정
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// 메타데이터
export const metadata: Metadata = {
  title: "CRM",
  description: "Customer Relationship Management",
};

// RootLayout 컴포넌트
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={geistSans.variable} // ✅ 가로 스크롤 방지
      lang="ko"
    >
      <body className="layout-root">
        {/* 왼쪽 NavBar */}
        <NavBar />
        <div className="layout-container">
          {/* 오른쪽 본문 */}
          <main className="layout-main">
            <Providers>{children}</Providers>
          </main>
        </div>
      </body>
    </html>
  );
}
