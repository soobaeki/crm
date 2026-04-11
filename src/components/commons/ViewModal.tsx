"use client";

//////////////////////
// import
//////////////////////
import React, { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ModalSize } from "@/types/modal";

//////////////////////
// types / interfaces
//////////////////////
interface Irops {
  isOpen: boolean;
  onClose: () => void; // 닫기 함수 (필수)
  title?: string;
  children: React.ReactNode;
  size?: ModalSize;

  // 버튼 액션 관련
  onDelete?: () => void; // 삭제 액션 (전달 시 버튼 나타남)
  onCancel?: () => void; // 취소 액션 (미전달 시 onClose 실행)
  onConfirm?: () => void; // 확인/저장 액션 (전달 시 버튼 나타남)

  // 버튼 라벨 커스텀
  cancelLabel?: string; // 취소 버튼 텍스트
  deleteLabel?: string; // 삭제 버튼 텍스트
  confirmLabel?: string; // 확인/등록 버튼 텍스트

  // 완전 커스텀 푸터가 필요할 경우
  footer?: React.ReactNode;
}

export default function ViewModal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  onDelete,
  onCancel,
  onConfirm,
  cancelLabel = "취소",
  deleteLabel = "삭제",
  confirmLabel = "확인",
  footer,
}: Irops) {
  // 1. [실무 포인트] 모달 오픈 시 배경 스크롤 방지 로직
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // 열려있지 않으면 아무것도 렌더링하지 않음
  if (!isOpen) return null;

  // 2. [실무 포인트] 디자인 시스템 규격에 맞춘 사이즈 분기
  const SIZE_CLASSES: Record<string, string> = {
    sm: "max-w-md", // 단순 경고, 확인 창
    md: "max-w-xl", // 기본 입력 폼 (상품 등록 등)
    lg: "max-w-4xl", // 상세 정보 뷰
    xl: "max-w-7xl h-[90vh]", // 데이터 테이블, 히스토리 (화면 90% 차지)
    full: "max-w-full h-screen rounded-none", // 전체 화면 모달
  };

  //////////////////////
  // render (JSX)
  //////////////////////
  return (
    // 배경 레이어 (Backdrop) - global.css의 animate-fadeIn 사용
    <div
      className="bg-foreground/30 animate-fadeIn fixed inset-0 z-100 flex items-center justify-center p-4 backdrop-blur-xs"
      onClick={onClose} // 배경 클릭 시 닫기
    >
      <div
        // 버블링 방지 (모달 내부 클릭 시 닫히지 않게)
        onClick={(e) => e.stopPropagation()}
        className={`${SIZE_CLASSES[size]} bg-background ring-border relative flex w-full flex-col overflow-hidden rounded-2xl shadow-2xl ring-1 transition-all duration-200`}
      >
        {/* 헤더 영역 (Header) */}
        <div className="border-border bg-background flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-foreground text-xl font-bold tracking-tight">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-muted-bg group rounded-lg p-1.5 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="text-muted-foreground group-hover:text-foreground h-6 w-6" />
          </button>
        </div>

        {/* 본문 영역 (Content) - flex-1과 overflow-y-auto로 긴 내용 대응 */}
        <div className="text-foreground scrollbar-thin scrollbar-thumb-border flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* 푸터 영역 (Footer) */}
        <div className="border-border bg-table-header-bg border-t px-6 py-4">
          {footer ? (
            // 커스텀 푸터가 있으면 우선 출력
            footer
          ) : (
            // 없으면 기본 액션 버튼들 출력
            <div className="flex items-center justify-end gap-2">
              {/* [실무 팁] 삭제 버튼은 왼쪽 끝에 배치(mr-auto)하여 실수 방지 */}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="btn-base bg-danger mr-auto text-white shadow-sm"
                >
                  {deleteLabel}
                </button>
              )}

              {/* 취소 버튼 */}
              <button
                onClick={onCancel || onClose}
                className="btn-base btn-muted"
              >
                {onCancel ? cancelLabel : "닫기"}
              </button>

              {/* 확인/등록 버튼 */}
              {onConfirm && (
                <button
                  onClick={onConfirm}
                  className="btn-base btn-primary shadow-md"
                >
                  {confirmLabel}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
