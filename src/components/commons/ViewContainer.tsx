import React, { ReactNode } from "react";

interface IViewContainerProps {
  children: ReactNode;
  className?: string; // 필요하면 추가 클래스
}

export default function ViewContainer({
  children,
  className = "",
}: IViewContainerProps) {
  return (
    <div
      className={`flex w-full flex-col overflow-auto px-4 py-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
}
