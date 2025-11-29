"use client";

//////////////////////
// import
//////////////////////
import { ReactNode } from "react";

//////////////////////
// types / interfaces
//////////////////////
interface IProps {
  children: ReactNode;
  className?: string; // 필요하면 추가 클래스
}

//////////////////////
// component start
//////////////////////
export default function ViewContainer({ children, className = "" }: IProps) {
  //////////////////////
  // render (JSX)
  //////////////////////
  return (
    <div
      className={`flex w-full flex-col overflow-auto px-4 py-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
}
