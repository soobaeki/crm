"use client";

import { useState } from "react";
import { postProduct } from "@/lib/products/product.api";
import { Product } from "@/types/product";

const FIELD_KEYS = {
  productName: "name",
  productDescription: "description",
  productPrice: "price",
  productCurrency: "currency",
  productStockQuantity: "stockQuantity",
  productIsActive: "isActive",
} as const;

const FIELD_LABELS = {
  [FIELD_KEYS.productName]: "상품명",
  [FIELD_KEYS.productDescription]: "설명",
  [FIELD_KEYS.productPrice]: "가격",
  [FIELD_KEYS.productCurrency]: "통화",
  [FIELD_KEYS.productStockQuantity]: "수량",
  [FIELD_KEYS.productIsActive]: "판매 중 여부",
};

const FIELD_TYPES = {
  [FIELD_KEYS.productName]: "text",
  [FIELD_KEYS.productDescription]: "textarea",
  [FIELD_KEYS.productPrice]: "number",
  [FIELD_KEYS.productCurrency]: "text",
  [FIELD_KEYS.productStockQuantity]: "number",
  [FIELD_KEYS.productIsActive]: "checkbox",
};

interface IProps {
  product?: Product;
  isNew?: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function ProductModal({
  product,
  isNew = false,
  onClose,
  onSave,
}: IProps) {
  // 초기값 없으면 기본값 세팅 (빈 문자열 또는 false 등)
  const initialProduct: Product = {
    id: product?.id || 0,
    sku: product?.sku || "",
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    currency: product?.currency || "KRW",
    stockQuantity: product?.stockQuantity || 0,
    isActive: product?.isActive ?? true,
    createdAt: product?.createdAt,
    updatedAt: product?.updatedAt,
  };

  const [newProduct, setNewProduct] = useState<Product>(initialProduct);

  // 필드별 onChange 핸들러 (checkbox는 checked 사용)
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const target = e.target;

    if (target instanceof HTMLInputElement) {
      const { name, type, value, checked } = target;
      setNewProduct((prev) => ({
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : type === "number"
              ? Number(value)
              : value,
      }));
    } else if (
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement
    ) {
      const { name, value } = target;
      setNewProduct((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (isNew) {
        await postProduct(newProduct);
      } else {
        // updateProduct 같은 함수 호출 필요 (구현 별도)
        // await updateProduct(newProduct.id, newProduct);
      }
      onSave();
    } catch (error) {
      console.log("error", error);
      alert("저장 실패");
    }
  };

  // fields 배열 생성
  const fields = Object.values(FIELD_KEYS).map((name) => ({
    name,
    label: FIELD_LABELS[name],
    type: FIELD_TYPES[name],
  }));

  return (
    <div className="modal">
      <h2>{isNew ? "상품 등록" : "상품 수정"}</h2>

      {fields.map(({ name, label, type }) => {
        if (type === "textarea") {
          return (
            <div key={name}>
              <label>{label}</label>
              <textarea
                name={name}
                placeholder={label}
                value={(newProduct[name] as string) || ""}
                onChange={handleChange}
              />
            </div>
          );
        }
        if (type === "checkbox") {
          return (
            <div key={name}>
              <label>
                <input
                  checked={Boolean(newProduct[name])}
                  name={name}
                  type="checkbox"
                  onChange={handleChange}
                />
                {label}
              </label>
            </div>
          );
        }
        return (
          <div key={name}>
            <label>{label}</label>
            <input
              name={name}
              placeholder={label}
              type={type}
              value={(newProduct[name] as string) ?? ""}
              onChange={handleChange}
            />
          </div>
        );
      })}

      <div className="modal-actions">
        <button onClick={onClose}>취소</button>
        <button onClick={handleSubmit}>{isNew ? "등록" : "저장"}</button>
      </div>
    </div>
  );
}
