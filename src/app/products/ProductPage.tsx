"use client";

//////////////////////
// import
//////////////////////
import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/types/product";
import { Column } from "@/types/table";
import ViewBody from "@/components/commons/ViewBody";
import ViewCard from "@/components/commons/ViewCard";
import ViewCol from "@/components/commons/ViewCol";
import ViewContainer from "@/components/commons/ViewContainer";
import ViewSearchFilter from "@/components/commons/ViewSearchFilter";
import ViewTable from "@/components/commons/ViewTable";
import ViewTitle from "@/components/commons/ViewTitle";
import {
  deleteProduct,
  getProducts,
  postProduct,
  putProduct,
} from "@/lib/product/product.api";
import { formatNumber } from "@/utils/formatters";
import ProductModal from "./ProductModal";

const productColumns = [
  {
    key: "id",
    label: "상품 ID",
    width: "80px",
  },
  {
    key: "sku",
    label: "SKU",
  },
  {
    key: "name",
    label: "상품명",
    align: "left",
  },
  {
    key: "weight",
    label: "무게",
    align: "right",
    render: (row: Product) =>
      row.weight ? formatNumber(row.weight) + "kg" : "-",
  },
  {
    key: "price",
    label: "가격",
    align: "right",
    render: (row: Product) =>
      row.price ? formatNumber(row.price) + "원" : "-",
  },
  {
    key: "currency",
    label: "통화",
  },
  {
    key: "stockQuantity",
    label: "재고수량",
    align: "right",
    render: (row: Product) =>
      row.stockQuantity ? formatNumber(row.stockQuantity) : "-",
  },
  {
    key: "isActive",
    label: "활성여부",
    render: (row: Product) => (row.isActive ? "Y" : "N"),
  },
  {
    key: "createdAt",
    label: "등록일",
  },
  {
    key: "updatedAt",
    label: "수정일",
  },
] satisfies Column<Product>[];

//////////////////////
// component start
//////////////////////
export default function ProductPage() {
  //////////////////////
  // state & router & query
  //////////////////////
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

  //////////////////////
  // handlers (useCallback)
  //////////////////////
  const handleSearchFilter = useCallback(
    (newFilters: Partial<typeof filters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    },
    [filters],
  );

  // 조회 버튼 클릭 시 실행될 함수
  const handleSearch = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleOpenModal = useCallback((product?: Product) => {
    setSelectedProduct(product ?? null);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  }, []);

  const handleDeleteProduct = useCallback(
    async (id: number) => {
      if (confirm("정말 삭제하시겠습니까?")) {
        await deleteProduct(id);
        handleCloseModal();
        await refetch();
      }
    },
    [handleCloseModal, refetch],
  );

  const handleConfirmProduct = useCallback(
    async (data: Product, isNew: boolean) => {
      isNew ? await postProduct(data) : await putProduct(data);
      handleCloseModal();
      await refetch();
    },
    [handleCloseModal, refetch],
  );

  //////////////////////
  // render (JSX)
  //////////////////////
  return (
    <ViewContainer>
      {/* 제목 */}
      <ViewTitle>상품리스트</ViewTitle>

      {/* 본문 */}
      <ViewBody>
        <ViewCol>
          <ViewSearchFilter
            searchLabel="검색"
            filters={filters}
            onChange={handleSearchFilter}
            onSearch={handleSearch}
            onRegister={handleOpenModal}
            registerLabel="상품 추가"
          />
          <ViewCard>
            <ViewTable columns={productColumns} data={products} />
          </ViewCard>
        </ViewCol>
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
