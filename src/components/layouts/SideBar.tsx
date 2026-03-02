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
  { name: "현황", href: "/dashboard", icon: HomeIcon },
  { name: "고객", href: "/customers", icon: UsersIcon },
  { name: "상품", href: "/products", icon: CubeIcon },
  { name: "엑셀", href: "/excel", icon: DocumentIcon },
  {
    name: "관리자",
    href: "/admin",
    icon: ShieldExclamationIcon,
    children: [
      { label: "대시보드", href: "/admin" },
      { label: "고객 데이터", href: "/admin/data/customers" },
      { label: "주문 데이터", href: "/admin/data/orders" },
    ],
  },
];

const baseItemClass =
  "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all";

const activeClass = "bg-primary text-white shadow-lg";

const inactiveClass =
  "text-muted-foreground hover:bg-nav-hover-bg hover:text-nav-hover-text";

interface IProps {
  open: boolean;
  onClose: () => void;
}

export default function SideBar({ open }: IProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`/* 1. 공통 스타일 */ bg-nav-bg border-border/50 /* 2. 모바일 스타일: 공중에 떠 있음 (fixed) */ fixed inset-y-0 left-0 z-50 w-64 border-r transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"} /* 3. 데스크톱 스타일: 자리를 차지함 (sticky 또는 자식) */ /* [핵심] md:relative를 사용하면 데스크톱에서 자리를 차지하게 되어 본문이 옆으로 밀립니다. */ flex lg:relative lg:flex lg:translate-x-0 lg:flex-col`}
    >
      <div className="flex h-full flex-col">
        {/* 로고 */}
        <Logo />

        {/* 메뉴 */}
        <nav className="flex-1 space-y-1.5 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const isChildActive =
              item.children?.some((c) => pathname.startsWith(c.href)) ?? false;

            return (
              <div key={item.name}>
                {/* 부모 메뉴 */}
                <Link
                  href={item.href}
                  className={`${baseItemClass} ${
                    isActive || isChildActive ? activeClass : inactiveClass
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 transition-colors ${
                      isActive || isChildActive
                        ? "text-white"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>

                {/* 자식 메뉴 */}
                {item.children && isChildActive && (
                  <div className="bg-nav-sub-bg animate-fadeIn mt-2 space-y-1 rounded-xl p-2">
                    {item.children.map((sub) => {
                      const isSubActive = pathname === sub.href;

                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`block rounded-lg px-3 py-2 text-sm transition-all ${
                            isSubActive
                              ? "bg-nav-hover-bg text-primary font-semibold"
                              : "text-muted-foreground hover:bg-nav-hover-bg hover:text-nav-hover-text"
                          }`}
                        >
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        {/* 유저카드 */}
        <UserCard />
      </div>
    </aside>
  );
}

function Logo() {
  return (
    <div className="flex h-20 items-center px-6">
      <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-lg">
        <CubeIcon className="h-6 w-6 text-white" />
      </div>
      <span className="text-primary ml-3 text-xl font-black tracking-tighter uppercase">
        고객 관리 시스템
      </span>
    </div>
  );
}

function UserCard() {
  return (
    <div className="mt-auto px-4 py-4">
      <div className="flex items-center gap-3 rounded-xl p-3">
        <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
          <UserCircleIcon className="text-primary h-7 w-7" />
        </div>
        <div className="min-w-0">
          <p className="text-foreground truncate text-xs font-bold">Tom Cook</p>
          <p className="text-muted-foreground truncate text-sm font-medium">
            tom@example.com
          </p>
        </div>
      </div>

      <p className="text-muted-foreground px-2 pt-2 text-[10px] font-medium">
        © Devs Corp. All rights reserved.
      </p>
    </div>
  );
}
