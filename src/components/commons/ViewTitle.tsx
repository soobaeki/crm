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
  return (
    // prettier-ignore
    <h2 className={`
    /* 폰트 설정: 모바일에서는 text-lg(18px), 태블릿 이상은 text-xl(20px) 시스템 foreground 컬러와 폰트 크기 조절 */
      text-lg sm:text-xl           /* [이유] 모바일과 데스크톱의 위계 차이를 주어 시각적 균형 확보 */
      font-extrabold               /* [이유] 본문(Body)과 확연히 구분되는 굵기로 "제목"임을 강조 */
      tracking-tight               /* [이유] 자간을 좁혀 굵은 글씨가 퍼져 보이지 않고 단단해 보이게 함 */
      text-foreground              /* [이유] global.css의 텍스트 색상을 추적하여 테마 일관성 유지 */

    /* 여백: 좌우 여백은 부모(ViewContainer)가 담당하게 하고, 위아래 간격만 조정 */
      flex items-center gap-2      /* [이유] 텍스트와 before(포인트 바)를 수직 중앙 정렬하고 간격 유지 */
      py-2                         /* [이유] 제목 자체의 터치 영역 및 시각적 상하 여백 확보 */
      mb-2                         /* [이유] 아래에 올 Body(본문)와의 최소한의 거리를 둠 */

    /* 유연성: 제목이 길어질 경우 대비 */
      break-keep                   /* [이유] 한글 단어가 중간에 끊겨서 다음 줄로 넘어가는 지저분한 현상 방지 */

    /* 디자인 포인트 (선택사항): 제목 옆에 작은 인디고 바 추가 */
      before:content-['']          /* [이유] 실제 돔 요소를 늘리지 않고 가짜 요소를 생성하여 디자인 포인트 추가 */
      before:w-1.5                 /* [이유] 너무 얇지 않은 두께로 포인트 바의 존재감 부여 */
      before:h-5                   /* [이유] 제목 텍스트 높이와 비슷하게 맞추어 정돈된 느낌 전달 */
      before:bg-primary            /* [이유] 시스템 메인 컬러(Blue)를 사용하여 브랜드 아이덴티티 강조 */
      before:rounded-full          /* [이유] 막대 끝을 둥글게 깎아 딱딱한 CRM 이미지를 부드럽게 완화 */

    /* 추가 스타일 */
    ${className}`}
    >
      {children}</h2>
  );
}
