"use client";

import { ReactNode } from "react";

//////////////////////
// types / interfaces
//////////////////////
interface IProps {
  title?: string;
  value?: string | number;
  trend?: string; // 상승/하락 등 추가 정보
  trendLabel?: string; // "지난달 대비", "어제 대비" 등 유동적인 문구
  icon?: ReactNode; // svg, span 등 다양한 값 받기 위함
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
  children,
  className = "",
}: IProps) {
  // 수치형 카드인지 컨텐츠형(표/차트) 카드인지 판별
  const isStatsType = value !== undefined;

  //////////////////////
  // render (JSX)
  //////////////////////
  return (
    // prettier-ignore
    <div className={`
    /* 기본 형태: 둥근 모서리와 아주 연한 테두리 */
    rounded-xl border border-gray-100 bg-white p-6

    /* 그림자: 바닥에 살짝 뜬 느낌을 주는 소프트 쉐도우 */
    shadow-[0_2px_10px_rgba(0,0,0,0.04)]

    /* 레이아웃: 내부 요소 정렬 */
    flex flex-col gap-4

    /* 상호작용: 마우스 올렸을 때 테두리 색상 변화 */
    transition-all duration-200 hover:border-blue-200 hover:shadow-md

    /* 추가 스타일 */
    ${className}
    `}>
      {/* 상단 섹션: 제목과 아이콘 */}
      <div className="flex items-center justify-between">
        {/* text-sm: 부차적 정보이므로 작게 / font-medium: 가독성 확보 */}
        {title && (
          <span className={`
            font-bold 
            /* 수치형일 땐 작게(sm), 컨텐츠형일 땐 크게(base) */
            ${isStatsType ? "text-sm text-gray-400" : "text-base text-gray-800"}
          `}>
            {title}
          </span>
        )}
        {/* 아이콘 박스: 배경색을 넣어 아이콘을 강조하고 시각적 균형을 맞춤 */}
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
            {icon}
          </div>
        )}
      </div>

      {/* 중간 섹션: 숫자 데이터 (value가 있을 때만 렌더링) */}
      {value !== undefined && (
        <div className="flex items-end justify-between">
          <div>
            {/* tabular-nums: 숫자의 폭을 일정하게 맞춰 데이터 변경 시 흔들림 방지 */}
            {/* tracking-tight: 숫자가 너무 퍼져 보이지 않게 자간을 좁힘 */}
            <p className="text-2xl font-bold tracking-tight text-gray-900 tabular-nums">
              {value}
            </p>
            {/* 트렌드 표시 영역: 수치가 있을 때만 렌더링 */}
            {trend && (
              <div className="mt-1 flex items-center gap-1">
                {/* 플러스(+) 기호 여부에 따라 초록색(상승) / 빨간색(하락) 자동 전환 */}
                <span
                  className={`text-xs font-semibold ${trend.includes("+") ? "text-emerald-500" : "text-rose-500"}`}
                >
                  {trend}
                </span>
                {/* 하드코딩을 피해 props로 받은 라벨 출력 */}
                <span className="text-[10px] font-normal text-gray-400">
                  {trendLabel}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 하단 섹션: 표, 차트 등 자유 컨텐츠 (children이 있을 때만 렌더링) */}
      {children && (
        /* 표가 들어올 경우 위 제목과의 간격을 벌려줌 */
        <div className={isStatsType ? "mt-2" : "mt-0"}>
          {children}
        </div>
      )}
    </div>
  );
}
