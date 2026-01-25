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
        /* 기본 그리드 레이아웃 */
        grid w-full 

        /* 요소 간 간격: 모바일(4), 데스크톱(6) */
        gap-4 sm:gap-6 

        /* 반응형 설정:
           - 모바일: 무조건 1열 (한 줄에 하나씩)
           - 태블릿: 무조건 2열 (한 줄에 두 개씩)
           - 데스크톱: 위 colMap에서 선택된 열 개수 적용
        */
        ${responsiveCols}
        justify-items-stretch  /* 추가: 가로 방향 꽉 채움 */
        
        /* 추가 스타일 */
        ${className}
      `}
    >
      {children}
    </div>
  );
}
