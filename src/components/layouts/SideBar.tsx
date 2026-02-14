"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CubeIcon,
  DocumentIcon,
  HomeIcon,
  ShieldExclamationIcon,
  UserCircleIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Customers", href: "/customers", icon: UsersIcon },
  { name: "Products", href: "/products", icon: CubeIcon },
  { name: "Excel", href: "/excel", icon: DocumentIcon },
  { name: "Admin", href: "/admin", icon: ShieldExclamationIcon },
];

interface SideBarProps {
  open: boolean;
  onClose: () => void;
}

export default function SideBar({ open }: SideBarProps) {
  const pathname = usePathname();

  return (
    // prettier-ignore
    <aside
      className={`
        /* 1. 공통 스타일 */
        bg-nav-bg border-r border-border/50 transition-transform duration-300
        
        /* 2. 모바일 스타일: 공중에 떠 있음 (fixed) */
        fixed inset-y-0 left-0 z-50 w-64 
        ${open ? "translate-x-0" : "-translate-x-full"}
        
        /* 3. 데스크톱 스타일: 자리를 차지함 (sticky 또는 flex 자식) */
        md:relative md:translate-x-0 md:flex md:flex-col
        /* [핵심] md:relative를 사용하면 데스크톱에서 자리를 차지하게 되어 본문이 옆으로 밀립니다. */
        `}
    >
      <div className="flex h-full flex-col">
        {/* 로고 */}
        <div className="flex h-20 items-center px-6">
          <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-lg">
            <CubeIcon className="h-6 w-6 text-white" />
          </div>
          <span className="text-primary ml-3 text-xl font-black tracking-tighter uppercase">
            CRM SYSTEM
          </span>
        </div>

        {/* 메뉴 */}
        <nav className="flex-1 space-y-1.5 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary shadow-primary/20 text-white shadow-lg"
                    : "text-slate-400 hover:bg-(--primary-hover)/20 hover:text-white"
                } `}
              >
                {isActive && (
                  <span className="absolute left-2 h-5 w-1 rounded-r-full bg-white" />
                )}

                <item.icon
                  className={`h-5 w-5 ${
                    isActive
                      ? "text-white"
                      : "text-slate-500 group-hover:text-white"
                  }`}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* 유저 카드 */}
        <div className="mt-auto px-4 py-4">
          <div className="flex items-center gap-3 rounded-xl p-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
              <UserCircleIcon className="text-primary h-7 w-7" />
            </div>
            <div className="min-w-0">
              <p className="text-foreground truncate text-xs font-bold">
                Tom Cook
              </p>
              <p className="truncate text-sm font-medium text-slate-500">
                tom@example.com
              </p>
            </div>
          </div>

          <p className="px-2 pt-2 text-[10px] font-medium text-slate-500">
            © Devs Corp. All rights reserved.
          </p>
        </div>
      </div>
    </aside>
  );
}
