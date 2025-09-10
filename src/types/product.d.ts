export interface Product {
  id: number; // 상품 고유 ID (DB PK)
  sku: string; // SKU (상품 고유 코드)
  name: string; // 상품명
  description?: string; // 상품 설명 (선택)
  price: number; // 단가 (원 단위)
  currency?: string; // 통화 (예: 'KRW'), 기본값 'KRW'로 처리 가능
  stockQuantity?: number; // 재고 수량 (선택)
  isActive?: boolean; // 판매 중 여부 (선택)
  createdAt?: string; // 생성일 (ISO 문자열)
  updatedAt?: string; // 수정일 (ISO 문자열)
}

export type ProductFormInput = Omit<
  Product,
  "id",
  "sku",
  "currency",
  "isActive",
  "createdAt",
  "updatedAt"
>;
