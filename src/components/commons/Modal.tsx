"use client";

import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  console.log("isOpen", isOpen);
  if (!isOpen) return null;

  return (
    <div className="bg-opacity-0.5 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="flex h-full w-full max-w-7xl flex-col rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-gray-200">
        {/* 상단 제목 */}
        {title && (
          <h2 className="mb-6 border-b border-gray-200 pb-3 text-2xl font-semibold text-gray-800">
            {title}
          </h2>
        )}

        {/* 내용 */}
        <div className="flex-1 overflow-auto">{children}</div>

        {/* 하단 버튼 */}
        <div className="mt-6 flex justify-end">
          <button
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow transition hover:bg-blue-700"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
