"use client";

import { ReactNode } from "react";

interface IProps {
  children: ReactNode;
  className?: string;
}

export default function ViewCol({ children, className = "" }: IProps) {
  return (
    // prettier-ignore
    <div
      className={`
        /* 1. 레이아웃: 플렉스 세로 정렬 */
        flex flex-col 
        
        /* 2. 간격: 요소 사이의 세로 간격 */
        gap-4 
        
        /* 3. 너비: 부모 너비에 맞춤 */
        w-full
        min-w-0      /* 중요: 내부 요소(테이블 등)가 커도 부모 폭을 넘지 않게 방어 */
        items-stretch /* 추가: 자식들(Card)을 가로로 꽉 늘림 */
        
        /* 추가 스타일 */
        ${className}
      `}
    >
      {children}
    </div>
  );
}
