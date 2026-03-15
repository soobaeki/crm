"use client";

import { ReactNode } from "react";

//////////////////////
// types / interfaces
//////////////////////
interface IProps {
  title?: string;
  value?: string | number;
  trend?: number; // 상승/하락 등 추가 정보
  trendLabel?: string; // "지난달 대비", "어제 대비" 등 유동적인 문구
  icon?: ReactNode; // svg, span 등 다양한 값 받기 위함
  actions?: ReactNode; // header 우측 버튼 영역
  children?: ReactNode; // 표나 차트를 담기 위해 추가
  className?: string;
}

//////////////////////
// component start
//////////////////////
export default function ViewCard({
  title,
  value,
  trend,
  trendLabel,
  icon,
  actions,
  children,
  className = "",
}: IProps) {
  // 수치형 카드인지 컨텐츠형(표/차트) 카드인지 판별
  const isStatsType = value !== undefined;
  const hasHeader = title || icon || actions;

  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;

  //////////////////////
  // render (JSX)
  //////////////////////
  return (
    // prettier-ignore
    <div className={`
      /* 1. 레이아웃 및 기반 설정 */
      relative
      min-w-0
      flex flex-col gap-3                  /* [이유] 내부 요소를 세로로 배치하고 요소 간 16px 간격을 일정하게 유지함 */
      w-full bg-background p-6             /* [이유] 가로를 꽉 채우고 배경은 흰색, 내부엔 24px의 충분한 여백을 부여함 */
      rounded-xl border border-border      /* [이유] 모서리를 부드럽게 깎고 시스템 구분선 컬러(--border)로 디자인 통일감을 줌 */
      h-full                              /* [이유] 데이터 양과 상관없이 부모(ViewRow) 높이에 맞춰 옆 카드와 높이를 동기화함 */

      /* 2. 그림자 및 애니메이션 */
      shadow-[0_2px_10px_rgba(0,0,0,0.04)] /* [이유] 평상시 아주 은은한 그림자로 깔끔함 유지 */
      transition-all duration-200 ease-out /* [이유] 호버 시 0.2초의 부드러운 움직임 제공 */

      /* 3. 호버 인터랙션 (공중 부양 효과) */
      ${isStatsType ? "hover:border-primary/40 /* [이유] 테두리를 브랜드 컬러로 강조 */ hover:shadow-md /* [이유] 높이 뜬 만큼 그림자를 크고 부드럽게 확산 */" : ""}

    /* 추가 스타일 */
    ${className}`}
    >
      {/* 상단 섹션: 제목과 아이콘 */}
      {hasHeader && (
        <div className="flex items-center justify-between">
          {/* text-sm: 부차적 정보이므로 작게 / font-medium: 가독성 확보 */}
          {title && (
            <span
              className={`/* [이유] 수치형은 라벨 느낌(gray-400), 컨텐츠형은 강조된 제목(foreground) */ font-bold ${isStatsType ? "text-muted-foreground text-sm" : "text-foreground text-base"} `}
            >
              {title}
            </span>
          )}
          {/* 아이콘 박스: 배경색을 넣어 아이콘을 강조하고 시각적 균형을 맞춤 */}
          {icon && (
            /* [이유] h-9, w-9로 살짝 키워 가독성을 높이고 primary 컬러를 은은하게 배경으로 깔아줌 */
            <div className="bg-primary/5 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
              {icon}
            </div>
          )}
          {actions &&<div>{actions}</div>}
        </div>
      )}

      {/* 중간 섹션: 숫자 데이터 (value가 있을 때만 렌더링) */}
      {isStatsType && (
        <div className="flex items-end justify-between">
          {/* tabular-nums: 숫자의 폭을 일정하게 맞춰 데이터 변경 시 흔들림 방지 */}
          {/* tracking-tight: 숫자가 너무 퍼져 보이지 않게 자간을 좁힘 */}
          <p className="text-foreground text-2xl font-bold tracking-tight tabular-nums">
            {value}
          </p>
          {/* 트렌드 표시 영역: 수치가 있을 때만 렌더링 */}
          {trend !== undefined &&  (
            <div className="flex items-center gap-1 text-xs">
              {/* 플러스(+) 기호 여부에 따라 초록색(상승) / 빨간색(하락) 자동 전환 */}
              <span
                className={`font-semibold ${isPositive ? "text-success" : isNegative ? "text-danger" : "text-muted-foreground" }`}
              >
                {/* [이유] 텍스트에 따라 시스템 컬러(성공/위험)를 자동으로 입힘 */}
                {trend > 0 && "+"}{trend}%
              </span>
              {/* 하드코딩을 피해 props로 받은 라벨 출력 */}
              <span className="text-muted-foreground text-[11px]">
                {trendLabel}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 하단 섹션: 표, 차트 등 자유 컨텐츠 (children이 있을 때만 렌더링) */}
      {children && (
        <div
          className={`/* [이유] 남은 높이를 이 영역이 다 차지하게 하여 하단 여백을 일정하게 유지 */ min-h-0 flex-1 ${isStatsType ? "border-border/50 border-t pt-4" : ""} /* [이유] 수치 아래에 오는 컨텐츠라면 상단 경계선(border-t)을 연하게 주어 구분감 부여 가능 */`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
