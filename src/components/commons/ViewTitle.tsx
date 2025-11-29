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
export default function ViewTitle({ children, className = "" }: IProps) {
  //////////////////////
  // render (JSX)
  //////////////////////
  return <h2 className={`px-4 text-xl font-bold ${className}`}>{children}</h2>;
}
