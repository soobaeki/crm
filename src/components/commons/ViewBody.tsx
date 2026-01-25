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
    flex flex-col
    w-full
    
    /* 간격: 모바일에서는 좁게(4), 태블릿 이상에선 넓게(6) */ 
    gap-4 sm:gap-6
    
    /* 유연성: 자식들이 넘칠 때 대비 */
    flex-1

    /* 추가 스타일 */
    ${className}
    `}>{children}</div>
  );
}
