"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminPage({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menu = [
    { label: "대시보드", href: "/admin" },
    { label: "고객 데이터", href: "/admin/data/customers" },
    { label: "주문 데이터", href: "/admin/data/orders" },
  ];

  return (
    <div className="layout-root">
      {/* 사이드바 */}
      <aside className="bg-nav-bg border-border hidden w-64 border-r lg:block">
        <div className="border-border border-b px-6 py-5">
          <h2 className="text-lg font-bold">관리자</h2>
          <p className="text-foreground/50 mt-1 text-xs">
            데이터 및 시스템 관리
          </p>
        </div>

        <nav className="space-y-1 p-4">
          {menu.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200${isActive ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-muted"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* 메인 영역 */}
      <main className="layout-main bg-background p-8">{children}</main>
    </div>
  );
}
