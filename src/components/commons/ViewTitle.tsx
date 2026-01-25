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
    /* 폰트 설정: 모바일에서는 text-lg(18px), 태블릿 이상은 text-xl(20px) */
    text-lg sm:text-xl
    font-bold
    tracking-tight
    text-gray-800

    /* 여백: 좌우 여백은 부모(ViewContainer)가 담당하게 하고, 위아래 간격만 조정 */
    py-2

    /* 유연성: 제목이 길어질 경우 대비 */
    break-keep

    /* 추가 스타일 */
    ${className}
    `}>{children}</h2>
  );
}
