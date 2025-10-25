"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/types/product";
import ViewBody from "@/components/commons/ViewBody";
import ViewContainer from "@/components/commons/ViewContainer";
import ViewTitle from "@/components/commons/ViewTitle";
import ProductForm from "@/components/products/ProductForm";
import ProductList from "@/components/products/ProductList";
import {
  deleteProduct,
  getProducts,
  postProduct,
  putProduct,
} from "@/lib/products/product.api";
import ProductModal from "./ProductModal";

export default function ProductsPage() {
  const [filters, setFilters] = useState({
    startDate: "",
    // startDate: dayjs().format("YYYY-MM-DD"),
    endDate: "",
    searchText: "",
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: products = [], refetch } = useQuery<Product[]>({
    queryKey: [
      "products",
      filters.startDate,
      filters.endDate,
      filters.searchText,
    ],
    queryFn: () =>
      getProducts(filters.startDate, filters.endDate, filters.searchText),
  });

  // 페이지에서 필터 변경 시
  const handleSearchFilter = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleOpenModal = (product?: Product) => {
    setSelectedProduct(product ?? null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      await deleteProduct(id);
      handleCloseModal();
      await refetch();
    }
  };

  const handleConfirmProduct = async (data: Product, isNew: boolean) => {
    isNew ? await postProduct(data) : await putProduct(data);
    await refetch();
    handleCloseModal();
  };

  return (
    <ViewContainer>
      {/* 제목 */}
      <ViewTitle>상품리스트</ViewTitle>

      {/* 본문 */}
      <ViewBody>
        <ProductForm
          onSearchFilter={handleSearchFilter}
          onOpenModal={handleOpenModal}
        />
        <ProductList products={products} onSelectProduct={handleOpenModal} />
      </ViewBody>

      {/* ✅ 모달은 상태 기반으로 제어 */}
      {isModalOpen && (
        <ProductModal
          product={selectedProduct ?? undefined} // 존재하면 수정, 없으면 신규
          onClose={handleCloseModal}
          onDelete={handleDeleteProduct}
          onConfirm={handleConfirmProduct}
        />
      )}
    </ViewContainer>
  );
}
