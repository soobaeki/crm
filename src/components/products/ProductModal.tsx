"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Product, ProductFormInput } from "@/types/product";
import ViewModal from "@/components/commons/ViewModal";
import {
  deleteProduct,
  postProduct,
  putProduct,
} from "@/lib/product/product.api";

interface IProps {
  mode: "create" | "update";
  product?: Product;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const emptyProduct: Partial<Product> = {
  name: "",
  weight: 0,
  price: 0,
  currency: "",
  stockQuantity: 0,
  isActive: false,
};

export default function ProductModal({
  mode,
  product,
  isOpen,
  onClose,
  onRefresh,
}: IProps) {
  const [formData, setFormData] = useState<Partial<Product>>(
    mode === "create" ? emptyProduct : { ...product },
  );

  const queryClient = useQueryClient();

  // 상품 등록
  const { mutate: handleCreate } = useMutation({
    mutationFn: (data: Partial<ProductFormInput>) =>
      postProduct(data as ProductFormInput),
    onSuccess: () => {
      alert("등록되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["product"] });
      onClose();
      onRefresh();
    },
  });

  // 상품 수정
  const { mutate: handleUpdate } = useMutation<
    Product,
    Error,
    Partial<Product>
  >({
    mutationFn: () => putProduct(formData),
    onSuccess: (data) => {
      alert("수정되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["product"] });
      onClose();
      onRefresh();
    },
  });

  // 상품 삭제
  const { mutate: handleDelete } = useMutation({
    mutationFn: () => deleteProduct(formData.sku as string),
    onSuccess: () => {
      alert("삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["product"] });
      onClose();
      onRefresh();
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === "weight" || name === "price" || name === "stockQuantity") {
      finalValue = value.replace(/[^0-9]/g, "");
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  // 실제 확인 버튼 클릭 시 실행할 함수
  const onConfirmAction = () => {
    if (mode === "update") {
      handleUpdate(formData);
    } else {
      handleCreate(formData as ProductFormInput);
    }
  };

  const fields = [
    { label: "순번", name: "id", value: formData.id },
    {
      label: "상품번호",
      name: "sku",
      value: formData.sku,
    },
    {
      label: "상품명",
      name: "name",
      value: formData.name,
      readOnly: mode === "update",
    },
    { label: "무게", name: "weight", value: formData.weight },
    {
      label: "가격",
      name: "price",
      value: formData.price || 0,
      fullWidth: true,
    },
    {
      label: "통화",
      name: "currency",
      value: formData.currency || 0,
      fullWidth: true,
    },
    {
      label: "수량",
      name: "stockQuantity",
      value: formData.stockQuantity || 0,
      fullWidth: true,
    },
    {
      label: "활성화여부",
      name: "isActive",
      type: "checkbox",
      value: formData.isActive || false,
      fullWidth: true,
    },
    ...(mode === "update"
      ? [
          {
            label: "가입일",
            name: "createdAt",
            value: formData.createdAt
              ? new Date(formData.createdAt).toLocaleDateString()
              : "-",
            readOnly: true,
          },
        ]
      : []),
  ];

  return (
    <ViewModal
      isOpen={isOpen}
      onClose={onClose}
      onDelete={mode === "create" ? undefined : handleDelete}
      onConfirm={onConfirmAction}
      title={
        mode === "create" ? "신규 상품 등록" : `${formData.name} 정보 수정`
      }
      size={mode === "create" ? "md" : "xl"}
      confirmLabel={mode === "create" ? "등록" : "수정"}
      deleteLabel={mode === "create" ? undefined : "삭제"}
    >
      <div className="flex h-full flex-col gap-8">
        {/* 기본 정보 섹션 */}
        <section>
          <h4 className="text-primary/80 mb-5 text-sm font-bold tracking-wider uppercase">
            기본 정보
          </h4>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
            {fields.map((field) => (
              <div
                key={field.label}
                className={`form-field ${field.fullWidth ? "col-span-2" : ""}`}
              >
                <dt className="form-label">{field.label}</dt>
                {field.readOnly ? (
                  <dd className="form-display">{field.value}</dd>
                ) : field.type === "checkbox" ? (
                  <input
                    type="checkbox"
                    name={field.name}
                    checked={!!formData[field.name as keyof Product]}
                    onChange={handleChange}
                    className="form-input w-full"
                  />
                ) : (
                  <input
                    type="text"
                    name={field.name}
                    value={
                      (formData[field.name as keyof Product] as
                        | string
                        | number) ?? ""
                    }
                    onChange={handleChange}
                    className="form-input w-full"
                  />
                )}
              </div>
            ))}
          </dl>
        </section>
      </div>
    </ViewModal>
  );
}
