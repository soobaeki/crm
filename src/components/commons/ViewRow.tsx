"use client";

import { ReactNode } from "react";

interface IProps {
  children: ReactNode;
  /* cols: 데스크톱에서 한 줄에 몇 개를 보여줄지 결정 (기본 4개) */
  cols?: 1 | 2 | 3 | 4 | 6;
  className?: string;
}

export default function ViewRow({
  children,
  cols = 4,
  className = "",
}: IProps) {
  // 그리드 컬럼 개수를 동적으로 매핑
  const colMap = {
    1: "lg:grid-cols-1",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    6: "lg:grid-cols-6",
  };

  const responsiveCols =
    cols === 1 ? "grid-cols-1" : `grid-cols-1 sm:grid-cols-2 ${colMap[cols]}`;

  return (
    // prettier-ignore
    <div
      className={`
        /* 1. 기본 그리드 레이아웃 */
        grid w-full                   /* [이유] 자식 요소들을 격자 형태로 정렬하기 위한 필수 설정 */
        
        /* 2. 요소 간 간격 (global.css의 gap 시스템과 동기화) 모바일(4), 데스크톱(6) */
        gap-4 sm:gap-6                /* [이유] global.css의 ViewBody 간격과 동일하게 맞춰 디자인 일체감 부여 */

        /* 3. 반응형 설정
          - 모바일: 무조건 1열 (한 줄에 하나씩)
          - 태블릿: 무조건 2열 (한 줄에 두 개씩)
          - 데스크톱: 위 colMap에서 선택된 열 개수 적용
        */
        ${responsiveCols}             /* [이유] 기기 너비에 따라 자동으로 줄바꿈을 처리하여 사용자 경험 최적화 */

        /* 4. 자식 요소 조절 */
        justify-items-stretch         /* [이유] Row 안의 각 요소가 주어진 칸 너비를 꽉 채우도록 강제함 */
        items-start                   /* [이유] 추가: 자식들의 높이가 제각각일 때 위쪽 라인을 맞춰 깔끔하게 정렬 */

        /* 5. 애니메이션 및 추가 스타일 */
        animate-fadeIn                /* [이유] 추가: global.css에 정의된 페이드인 효과로 부드러운 화면 전환 제공 */
        ${className}`}
    >
      {children}
    </div>
  );
}
