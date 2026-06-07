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
import { getProducts } from "@/lib/product/product.api";
import { formatNumber } from "@/utils/formatters";
import ProductModal from "../../components/products/ProductModal";

const productColumns = [
  {
    key: "id",
    label: "순번",
    width: "70px",
  },
  {
    key: "sku",
    label: "SKU",
    width: "200px",
    align: "left" as const,
  },
  {
    key: "name",
    label: "상품명",
  },
  {
    key: "weight",
    label: "무게",
    align: "right",
    width: "80px",
    render: (row: Product) =>
      row.weight ? formatNumber(row.weight) + "kg" : "-",
  },
  {
    key: "price",
    label: "가격",
    align: "right",
    width: "120px",
    render: (row: Product) =>
      row.price ? formatNumber(row.price) + "원" : "-",
  },
  {
    key: "currency",
    label: "통화",
    width: "70px",
  },
  {
    key: "stockQuantity",
    label: "재고수량",
    align: "right",
    width: "100px",
    render: (row: Product) =>
      row.stockQuantity ? formatNumber(row.stockQuantity) + "개" : "-",
  },
  {
    key: "isActive",
    label: "활성여부",
    width: "100px",
    render: (row: Product) => (row.isActive ? "Y" : "N"),
  },
  {
    key: "createdAt",
    label: "등록일",
    width: "120px",
  },
  {
    key: "updatedAt",
    label: "수정일",
    width: "120px",
  },
] satisfies Column<Product>[];

export default function ProductPage() {
  /* -------------------------------------------------------------------------- */
  /* 1. State & Queries                                                         */
  /* ------------------------------------------------------------------------- */
  const [filters, setFilters] = useState({
    searchText: "",
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 상품 리스트 조회
  const { data: products = [], refetch } = useQuery<Product[]>({
    queryKey: ["products", filters.searchText],
    queryFn: () => getProducts(filters.searchText),
    enabled: true,
  });

  /* -------------------------------------------------------------------------- */
  /* 3. Event Handlers (Business Logic)                                         */
  /* -------------------------------------------------------------------------- */
  const handleSearchFilter = useCallback(
    (newFilters: Partial<typeof filters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    },
    [],
  );

  const handleSearch = useCallback(async () => {
    await refetch();
  }, [refetch, filters.searchText]);

  const handleOpenDetail = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, []);

  const handleOpenRegister = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  /* -------------------------------------------------------------------------- */
  /* 5. Render                                                                  */
  /* -------------------------------------------------------------------------- */
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
            onRegister={handleOpenRegister}
            registerLabel="상품 추가"
          />

          {/* 테이블 카드 영역 */}
          <ViewCard className="hover:border-border! transition-none! hover:translate-y-0! hover:shadow-none! active:scale-100!">
            <ViewTable
              columns={productColumns}
              data={products}
              initialPageSize={10}
              onRowClick={handleOpenDetail}
            />
          </ViewCard>
        </ViewCol>
      </ViewBody>

      {/* 모달 영역 수정 */}
      {selectedProduct && (
        <ProductModal
          mode="update"
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onRefresh={refetch}
        />
      )}

      {/* 모달 영역 등록 */}
      {isCreateModalOpen && (
        <ProductModal
          mode="create"
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onRefresh={refetch}
        />
      )}
    </ViewContainer>
  );
}
