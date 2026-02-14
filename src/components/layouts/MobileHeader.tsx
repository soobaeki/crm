"use client";

import { Bars3Icon, CubeIcon } from "@heroicons/react/24/outline";

interface IProps {
  open: boolean;
  onOpen: () => void;
}

export default function MobileHeader({ open, onOpen }: IProps) {
  return (
    <header
      className={`border-border sticky top-0 z-50 flex h-16 items-center gap-4 px-4 md:hidden ${open ? "border-nav-bg" : "border-b"}`}
    >
      <button onClick={onOpen} className="text-foreground">
        <Bars3Icon className="h-6 w-6" />
      </button>
      {!open && (
        <div className="flex items-center justify-center">
          <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-lg">
            <CubeIcon className="h-6 w-6 text-white" />
          </div>
          <span className="text-primary ml-3 text-xl font-black tracking-tighter uppercase">
            CRM SYSTEM
          </span>
        </div>
      )}
    </header>
  );
}
