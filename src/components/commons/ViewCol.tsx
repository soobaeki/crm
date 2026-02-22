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
        /* 1. 기본 레이아웃: grid 기반 세로 스택 */
        grid                     /* [이유] width 계산이 더 안정적이며, 내부 요소가 부모를 밀어내는 현상을 방지할 수 있음 */
        w-full                   /* [이유] 부모(ViewBody, ViewRow)가 허용하는 가로 영역을 100% 활용하기 위함 */

        /* 2. 요소 간 간격 */
        gap-4 sm:gap-6           /* [이유] global.css의 spacing 시스템과 통일하여 전체 UI 리듬을 맞추기 위함 */

        /* 3. 레이아웃 안전장치 */
        min-w-0                  /* [이유] 매우 중요: 내부에 테이블이나 긴 텍스트가 있어도 부모 폭을 뚫고 나가지 못하도록 강제하여 모바일 레이아웃 깨짐 방지 */

        /* 4. 애니메이션 */
        animate-fadeIn           /* [이유] 화면 전환 시 부드러운 등장 효과를 주어 UX 향상 */

        /* 추가 스타일 */
        ${className}`}
    >
      {children}
    </div>
  );
}
