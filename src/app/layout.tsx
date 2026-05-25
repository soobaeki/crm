import { Geist } from "next/font/google";
import { cookies } from "next/headers";
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
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const hasToken = cookieStore.has("token"); // true 또는 false
  return (
    <html
      className={geistSans.variable} // ✅ 가로 스크롤 방지
      lang="ko"
    >
      <body className="layout-root">
        <Providers>
          {/* 왼쪽 NavBar */}
          <NavBar isLogin={hasToken} />
          <div className="layout-container">
            {/* 오른쪽 본문 */}
            <main className="layout-main">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
