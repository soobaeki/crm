"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  UserCircleIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";

const user = {
  name: "Tom Cook",
  email: "tom@example.com",
};

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Customers", href: "/customers", icon: UsersIcon },
  { name: "Analytics", href: "/analytics", icon: ChartBarIcon },
  { name: "Products", href: "/products", icon: CubeIcon },
];

const userNavigation = [
  { name: "Your Profile", href: "/profile" },
  { name: "Settings", href: "/settings" },
  { name: "Sign out", href: "/logout" },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function NavBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div>
      {/* 모바일 토글 버튼 */}
      <div className="fixed top-4 right-4 z-50 px-4 md:hidden">
        <button
          className="rounded-md bg-gray-800 p-2 text-white"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <XMarkIcon className="h-3 w-3" />
          ) : (
            <Bars3Icon className="h-3 w-3" />
          )}
        </button>
      </div>

      {/* 사이드바 */}
      <aside
        className={classNames(
          "fixed top-0 left-0 z-40 h-full w-64 transform bg-gray-800 text-gray-200 transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          {/* 로고 & 제목 */}
          <div className="flex h-16 items-center justify-center border-b border-gray-700 text-xl font-bold">
            CRM Dashboard
          </div>

          {/* 메뉴 */}
          <nav className="flex-1 space-y-2 px-4 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  className={classNames(
                    isActive ? "bg-gray-900 text-white" : "hover:bg-gray-700",
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                  )}
                  href={item.href}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          {/* 유저 메뉴 */}
          <div className="border-t border-gray-700 p-4">
            <div className="mb-2 flex items-center gap-3">
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
              <div>
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-gray-400">{user.email}</div>
              </div>
            </div>
            <div className="space-y-1">
              {userNavigation.map((item) => (
                <Link
                  key={item.name}
                  className="block rounded px-2 py-1 text-sm hover:bg-gray-700"
                  href={item.href}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="classname flex items-center justify-end px-4">
            <span className="text-xs">© 2025 DevS™ All Rights Reserved.</span>
          </div>
        </div>
      </aside>

      {/* 사이드바에 공간 확보 */}
      <div className="md:pr-64" />
    </div>
  );
}
