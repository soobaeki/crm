"use client";

import { useState } from "react";
import MobileHeader from "./MobileHeader";
import SideBar from "./SideBar";

interface IProps {
  isLogin: boolean;
}

export default function NavBar({ isLogin }: IProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 모바일 상단 바 */}
      <MobileHeader open={open} onOpen={() => setOpen(true)} />

      {/* 사이드바 */}
      <SideBar open={open} onClose={() => setOpen(false)} isLogin={isLogin} />

      {/* 모바일 오버레이 */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
