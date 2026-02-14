"use client";

//////////////////////
// import
//////////////////////
import { ReactNode } from "react";

//////////////////////
// types / interfaces
//////////////////////
interface IProps {
  children: ReactNode;
  className?: string; // 필요하면 추가 클래스
}

//////////////////////
// component start
//////////////////////
export default function ViewContainer({ children, className = "" }: IProps) {
  //////////////////////
  // render (JSX)
  //////////////////////
  return (
    // prettier-ignore
    <div
      className={`
        /* 레이아웃 기본 설정 */
        flex w-full flex-col     /* [이유] 자식(제목, 본문)을 위아래로 쌓기 위해 필수 */
        h-full                   /* [이유] 부모 높이를 꽉 채워야 컨텐츠가 적어도 화면이 휑하지 않음 */
        min-h-0                  /* [이유] 내부 컨텐츠가 넘칠 때 레이아웃이 터지지 않게 막아주는 안전장치 */
        
        /* 스크롤: 내부 컨텐츠가 길어질 때 브라우저 전체가 아닌 이 영역만 스크롤 */
        overflow-y-auto 
        
        /* 중앙 정렬: 아주 큰 모니터에서 컨텐츠가 너무 퍼지지 않게 최대치 제한 및 가운데 배치 */
        mx-auto max-w-[1440px]   /* [이유] 광활한 모니터에서 컨텐츠가 좌우로 너무 퍼지는 것을 방지 */
        
        /* 좌우 여백: 모든 페이지의 시작 라인을 통일 (ViewTitle, ViewBody의 기준선) */
        px-4 py-4                /* 모바일: 16px */
        sm:px-6                  /* 태블릿: 24px */
        lg:px-8                  /* 데스크톱: 32px */
        ${className}`}
    >
      {children}
    </div>
  );
}
