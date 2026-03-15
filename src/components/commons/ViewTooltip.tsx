"use client";

import { ReactNode, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface IProps {
  children: ReactNode;
  content: string;
}

export default function ViewTooltip({ children, content }: IProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (!containerRef.current) return;

    // 현재 요소의 위치 계산
    const rect = containerRef.current.getBoundingClientRect();

    // 요소의 중앙 하단에 위치하도록 설정 (스크롤 위치 포함)
    setCoords({
      x: rect.left + rect.width / 2 + window.scrollX,
      y: rect.bottom + window.scrollY + 8,
    });
    setVisible(true);
  };

  return (
    // prettier-ignore
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setVisible(false)}
      className="inline-block w-full" /* [이유] 텍스트 중간에서도 자연스럽게 배치되도록 설정 */
    >
      {children}

      {visible &&
        createPortal(
          <div
            className={`
              /* 1. 기본 스타일 및 테마 */
              fixed z-50              /* [이유] 레이어의 최상단에 위치시켜 다른 요소에 가려지지 않음 */
              pointer-events-none     /* [이유] 툴팁이 마우스 포인터를 방해하여 깜빡거리는 현상 방지 */
              bg-foreground           /* [이유] global.css의 메인 텍스트색을 배경으로 써서 반전 효과 부여 */
              text-background         /* [이유] 배경과 대비되는 글자색으로 가독성 확보 */
              
              /* 2. 레이아웃 및 여백 */
              w-max max-w-[300px]     /* [이유] 컨텐츠에 맞게 늘어나되 너무 커지지 않도록 한계 설정 */
              px-3 py-1.5             /* [이유] 내부 텍스트와 테두리 사이의 균형 잡힌 간격 */
              rounded-md              /* [이유] 딱딱하지 않게 모서리를 깎아 부드러운 UI 연출 */
              text-[12px] font-medium /* [이유] 부가 정보임을 나타내기 위해 본문보다 작고 명확한 폰트 적용 */
              
              /* 3. 위치 제어 및 애니메이션 */
              -translate-x-1/2        /* [이유] 계산된 X좌표의 중앙에 툴팁을 완벽하게 정렬 */
              mt-2                    /* [이유] 대상 요소와 툴팁 사이의 수직 미세 간격 */
              shadow-lg               /* [이유] 입체감을 주어 공중에 떠 있는 느낌 부여 */
              animate-fadeIn          /* [이유] global.css에 정의된 효과로 부드럽게 등장 */
              
              /* 4. 가독성 설정 */
              wrap-break-word               /* [이유] 긴 단어나 URL이 들어와도 영역을 벗어나지 않게 줄바꿈 */
              whitespace-normal       /* [이유] 여러 줄의 텍스트도 자연스럽게 수용 */
            `}
            style={{
              top: coords.y,
              left: coords.x,
            }}
          >
            {content}
            {/* [개선] 말꼬리 화살표: border-b가 아니라 border-bottom-color를 사용해야 함 */}
            <div 
              className={`
                absolute bottom-full left-1/2 -ml-1.5 
                border-[6px] border-transparent 
                border-b-foreground   /* [이유] 툴팁 본체와 같은 색상의 삼각형 화살표 생성 */
              `}
            />
          </div>,
          document.body /* [이유] overflow:hidden이 걸린 부모 아래에서도 툴팁이 잘리지 않게 강제 탈출 */
        )}
    </div>
  );
}
