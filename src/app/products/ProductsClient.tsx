"use client";

import React, { useState } from "react";
import { Product } from "@/types/product";

interface IProps {
  products: Product[];
  onSelectProduct: (p: Product) => void;
  onRegister: () => void;
}

export default function ProductsClient({
  products,
  onSelectProduct,
  onRegister,
}: IProps) {
  const [searchFilters, setSearchFilters] = useState({
    startDate: "",
    endDate: "",
  });

  const onChangeFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 py-4">
      {/* 검색 필터 */}
      <section className="mb-4 flex flex-col gap-2 rounded-lg border p-4 md:flex-row md:items-center md:gap-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <label className="min-w-[70px] text-sm">기간검색</label>
          <div className="flex min-w-0 flex-1 gap-2">
            <input
              className="max-w-full min-w-[120px] flex-1 rounded border px-2 py-1 text-sm"
              name="startDate"
              type="date"
              value={searchFilters.startDate}
              onChange={onChangeFilter}
            />
            <span className="self-center whitespace-nowrap">~</span>
            <input
              className="max-w-full min-w-[120px] flex-1 rounded border px-2 py-1 text-sm"
              name="endDate"
              type="date"
              value={searchFilters.endDate}
              onChange={onChangeFilter}
            />
          </div>
        </div>

        <div className="flex flex-1 justify-end">
          <button
            className="rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
            onClick={onRegister}
          >
            상품 등록
          </button>
        </div>
      </section>

      {/* 상품 리스트 */}
      <div className="flex flex-col gap-2">
        {products.map((product) => (
          <div
            key={product.id}
            className="cursor-pointer rounded border p-2 hover:bg-gray-100"
            onClick={() => onSelectProduct(product)}
          >
            {product.name}
          </div>
        ))}
      </div>
    </div>
  );
}
