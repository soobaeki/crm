"use client";

import { useState } from "react";
import { Product } from "@/types/product";
import Modal from "@/components/commons/Modal";

interface IProps {
  product?: Product;
  onClose: () => void;
  onDelete: (id: number) => void;
  onConfirm: (data: Product, isNew: boolean) => void;
}

export default function ProductModal({
  product,
  onClose,
  onDelete,
  onConfirm,
}: IProps) {
  const isNew = !product?.id;

  const [form, setForm] = useState<Product>({
    id: product?.id || 0,
    sku: product?.sku || "",
    name: product?.name || "",
    weight: product?.weight || 0,
    price: product?.price || 0,
    currency: product?.currency || "KRW",
    stockQuantity: product?.stockQuantity || 0,
    isActive: product?.isActive ?? true,
    createdAt: product?.createdAt,
    updatedAt: product?.updatedAt,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, type, value, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? Number(value)
            : value,
    }));
  };

  const handleConfirm = () => {
    if (!form.name.trim()) {
      alert("상품명을 입력해주세요.");
      return;
    }

    if (form.price <= 0) {
      alert("가격은 0보다 커야 합니다.");
      return;
    }

    onConfirm(form, isNew);
  };

  return (
    <Modal
      type="product"
      isOpen={true}
      title={isNew ? "상품 등록" : "상품 수정"}
      onClose={onClose}
      onDelete={() => onDelete(form.id)}
      onConfirm={handleConfirm}
      deleteLabel="삭제"
      confirmLabel={isNew ? "등록" : "수정"}
    >
      {/* flex-col gap-4로 전체 간격 확대, p-4로 모달 내부 패딩 추가 */}
      <div className="flex flex-col gap-4 p-4">
        {/* 상품명 필드 그룹 */}
        <div className="flex flex-col">
          <label
            htmlFor="name"
            className="mb-1 text-sm font-medium text-gray-700"
          >
            상품명
          </label>
          <input
            id="name" // label의 htmlFor와 연결하기 위해 id 추가
            name="name"
            value={form.name}
            onChange={handleChange}
            type="text"
            // 기본 폼 스타일: border, rounded, padding, focus 시 스타일
            className="rounded-md border border-gray-300 p-2 transition duration-150 ease-in-out focus:border-blue-500 focus:ring-blue-500"
            placeholder="상품명을 입력하세요"
          />
        </div>

        {/* 가격 필드 그룹 */}
        <div className="flex flex-col">
          <label
            htmlFor="price"
            className="mb-1 text-sm font-medium text-gray-700"
          >
            가격
          </label>
          <input
            id="price"
            name="price"
            value={form.price}
            onChange={handleChange}
            type="number"
            className="rounded-md border border-gray-300 p-2 transition duration-150 ease-in-out focus:border-blue-500 focus:placeholder-transparent focus:ring-blue-500"
            // placeholder="0"
            // min="0"
          />
        </div>

        {/* 재고 수량 필드 그룹 */}
        <div className="flex flex-col">
          <label
            htmlFor="stockQuantity"
            className="mb-1 text-sm font-medium text-gray-700"
          >
            재고 수량
          </label>
          <input
            id="stockQuantity"
            name="stockQuantity"
            value={form.stockQuantity}
            onChange={handleChange}
            type="number"
            className="rounded-md border border-gray-300 p-2 transition duration-150 ease-in-out focus:border-blue-500 focus:ring-blue-500"
            // placeholder="0"
            // min="0"
          />
        </div>

        {/* 판매 중 여부 체크박스 그룹 */}
        <div className="flex items-center pt-2">
          <label
            htmlFor="isActive"
            className="flex cursor-pointer items-center"
          >
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={handleChange}
              // 기본 appearance를 숨기고 custom 스타일링을 위해 w-4 h-4 rounded-sm border-gray-300 적용
              className="form-checkbox mr-2 h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            <span className="text-base text-gray-700 select-none">
              판매 중 여부
            </span>
          </label>
        </div>
      </div>
    </Modal>
  );
}
