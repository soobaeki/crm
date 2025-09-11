"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/types/product";
import { getProducts } from "@/lib/products/product.api";
import ProductModal from "./ProductModal";
import ProductsClient from "./ProductsClient";

export default function ProductsPage() {
  const { data: products = [], refetch } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  return (
    <div className="flex flex-col overflow-auto px-4 py-4 sm:px-6 lg:px-8">
      <h2 className="px-4 text-xl font-bold">상품리스트</h2>
      <ProductsClient
        products={products}
        onRegister={() => setIsRegisterModalOpen(true)}
        onSelectProduct={setSelectedProduct}
      />

      {/* 수정 모달 */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSave={async () => {
            await refetch();
            setSelectedProduct(null);
          }}
        />
      )}

      {/* 신규 등록 모달 */}
      {isRegisterModalOpen && (
        <ProductModal
          isNew={true}
          onClose={() => setIsRegisterModalOpen(false)}
          onSave={async () => {
            await refetch();
            setIsRegisterModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
