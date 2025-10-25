"use client";

import React from "react";

interface Irops {
  type: "product" | "customer";
  isOpen: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void; // 공통 닫기
  onDelete?: () => void; // 공통 삭제
  onCancel?: () => void; // 취소 버튼 선택 시
  onConfirm?: () => void; // 확인/등록 버튼 선택 시
  cancelLabel?: string; // 취소 버튼 텍스트
  deleteLabel?: string; // 삭제 버튼 텍스트
  confirmLabel?: string; // 확인/등록 버튼 텍스트
}

export default function Modal({
  type,
  isOpen,
  title,
  children,
  onClose,
  onDelete,
  onCancel,
  onConfirm,
  cancelLabel,
  deleteLabel,
  confirmLabel,
}: Irops) {
  if (!isOpen) return null;

  const MODAL_CONTAINER_CLASSES: Record<"product" | "customer", string> = {
    customer: "h-full max-w-7xl",
    product: "max-w-lg",
  };

  return (
    <div className="bg-opacity-0.5 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div
        className={`${MODAL_CONTAINER_CLASSES[type]} flex w-full flex-col rounded-xl bg-white p-6 shadow-xl ring-1 ring-gray-200`}
      >
        {/* 상단 제목 */}
        {title && (
          <h2 className="mb-6 border-b border-gray-200 pb-3 text-2xl font-semibold text-gray-800">
            {title}
          </h2>
        )}

        {/* 내용 */}
        <div className="flex-1 overflow-auto">{children}</div>

        {/* 하단 버튼 */}
        <div className="modal-actions mt-4 flex justify-end gap-2">
          <button
            className="rounded border px-3 py-1"
            onClick={onCancel ?? onClose}
          >
            {onCancel ? (cancelLabel ?? "취소") : "닫기"}
          </button>
          {onDelete && (
            <button
              className="rounded bg-blue-500 px-3 py-1 text-white"
              onClick={onDelete}
            >
              {deleteLabel || "삭제"}
            </button>
          )}
          {onConfirm && (
            <button
              className="rounded bg-blue-500 px-3 py-1 text-white"
              onClick={onConfirm}
            >
              {confirmLabel || "확인"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
