"use client";

import { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ModalSize } from "@/types/modal";

interface IProps {
  isOpen: boolean;
  onClose: () => void; // 닫기 함수 (필수)
  title?: string;
  children: React.ReactNode;
  size?: ModalSize;
  onConfirm?: () => void; // 확인/저장 액션 (전달 시 버튼 나타남)
  confirmLabel?: string; // 확인/등록 버튼 텍스트
}

const SIZE_CLASSES: Record<string, string> = {
  sm: "max-w-md", // 단순 경고, 확인 창
  md: "max-w-xl", // 기본 입력 폼 (상품 등록 등)
  lg: "max-w-4xl", // 상세 정보 뷰
  xl: "max-w-7xl h-[90vh]", // 데이터 테이블, 히스토리 (화면 90% 차지)
  full: "max-w-full h-screen rounded-none", // 전체 화면 모달
};

export default function ViewPopUp({
  isOpen,
  onClose,
  title,
  children,
  size = "sm",
  onConfirm,
  confirmLabel = "확인",
}: IProps) {
  // 💡 [개선] 모달이 켜졌을 때 뒷배경(본문) 스크롤 방지 로직
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="bg-foreground/30 animate-fadeIn fixed inset-0 z-100 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        // 버블링 방지 (모달 내부 클릭 시 닫히지 않게)
        onClick={(e) => e.stopPropagation()}
        className={`${SIZE_CLASSES[size]} bg-background ring-border relative flex w-full translate-y-0 scale-100 transform flex-col overflow-hidden rounded-2xl ring-1 transition-all duration-200 duration-300`}
      >
        {/* 헤더 영역 (Header) */}
        <div className="bg-background flex items-center justify-between border-none px-4 py-4">
          <h2 className="text-foreground text-xl font-bold tracking-tight">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-muted-bg group cursor-pointer rounded-lg p-1.5 transition-colors"
            aria-label="Close popup"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        {/* 본문 영역 (Content) */}
        <div className="text-foreground flex-1 overflow-y-auto px-6 py-6 text-[17px] leading-relaxed">
          {children}
        </div>
        {/* 푸터 영역 (Footer) */}
        <div className="bg-background/50 border-t border-none px-4 py-4">
          <div className="flex items-center justify-end gap-2 text-[14px]">
            {/* 💡 [개선] 언제나 뒤로 가거나 끌 수 있는 차분한 '닫기' 버튼 배치 (밸런스 장착) */}
            <button onClick={onClose} className="btn-base btn-primary">
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
