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
  return (
    // prettier-ignore
    <div className={`
    /* 레이아웃: 세로 정렬 및 가로 꽉 채우기 */
      flex flex-col            /* [이유] 내부의 검색바, 테이블, 통계 카드 등을 수직으로 차곡차곡 쌓기 위함 */
      w-full                   /* [이유] 부모인 ViewContainer의 가로 너비를 100% 활용하여 시원한 뷰 제공 */
    
    /* 간격: 모바일에서는 좁게(4), 태블릿 이상에선 넓게(6) */ 
      gap-4 sm:gap-6          /* [이유] 요소 사이의 숨통을 틔워줌. 화면이 커질수록 여백을 늘려 고급스러운 느낌 전달 */

    /* 유연성: 자식들이 넘칠 때 대비 */
      flex-1                  /* [이유] ViewTitle이 차지하고 남은 모든 세로 공간을 '독점'하여 화면 하단까지 꽉 채움 */
      min-h-0                 /* [이유] 중요! 자식은 내용물이 많으면 부모를 뚫고 나감. 이를 0으로 고정해야 내부 스크롤이 작동함 */
      overflow-y-auto         /* [이유] 제목은 상단에 고정하고 본문 내용만 독립적으로 스크롤하기 위해 필수 */

    /* [추가] 층수 상승 및 여백 확보 */
                                /* pt-2: [이유] 중요! 정도로 늘려야 카드가 위로 뜰 공간이 생김 */

    /* 추가 스타일 */
    ${className}`}
    >
      {children}</div>
  );
}
