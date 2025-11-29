"use client";

//////////////////////
// types / interfaces
//////////////////////
interface IProps {
  children: React.ReactNode;
  className?: string; // 추가 스타일 옵션
}

//////////////////////
// component start
//////////////////////
export default function ViewBody({ children, className = "" }: IProps) {
  //////////////////////
  // render (JSX)
  //////////////////////
  return <div className={`flex flex-col gap-4 ${className}`}>{children}</div>;
}
