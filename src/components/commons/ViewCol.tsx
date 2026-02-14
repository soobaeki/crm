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
        flex flex-col         /* [이유] 내부의 카드, 제목, 텍스트 등을 위에서 아래로 순서대로 배치하기 위함 */
        
        /* 2. 간격: 요소 사이의 세로 간격 */
        gap-4                 /* [이유] 수직으로 쌓이는 요소들이 서로 답답하게 달라붙지 않도록 일정한 숨통을 틔워줌 */
        
        /* 3. 너비: 부모 너비에 맞춤 */
        w-full                /* [이유] 부모인 ViewRow나 ViewBody가 허용하는 가로 폭을 최대한 활용하기 위함 */
        min-w-0               /* [이유] 매우 중요: 내부의 큰 테이블이나 긴 텍스트가 부모 폭을 뚫고 나가는 '레이아웃 터짐' 현상을 방지 */
        items-stretch         /* [이유] 자식 요소들이 본인의 최소 너비만 차지하지 않고 가로로 꽉 차도록 늘려줌 */
        
        /* 추가 스타일 */
        ${className}`}
    >
      {children}
    </div>
  );
}
