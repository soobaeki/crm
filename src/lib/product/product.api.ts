import { Product, ProductFormInput } from "@/types/product";
import { toQueryString } from "@/utils/url";
import { callApi } from "../core";

/**
 * 상품 목록 조회
 *
 * @param startDate 조회 시작일(YYYY-MM-DD)
 * @param endDate   조회 종료일(YYYY-MM-DD)
 * @param searchText 조회 조건
 * @returns
 */
export async function getProducts(searchText?: string): Promise<Product[]> {
  const qs = toQueryString({ searchText });

  const res = await callApi<undefined, Product[]>(`/api/product?${qs}`, "GET");

  return res.data!;
}

/**
 * 상품 등록
 *
 * @param input 상품 등록 데이터
 * @returns
 */
export async function postProduct(input: ProductFormInput): Promise<Product> {
  const res = await callApi<ProductFormInput, Product>(
    "/api/product",
    "POST",
    input,
  );

  return res.data!;
}

/**
 * 상품 수정
 *
 * @param input 상품 수정 데이터
 * @returns
 */
export async function putProduct(input: ProductFormInput): Promise<Product> {
  const res = await callApi<ProductFormInput, Product>(
    "/api/product",
    "PUT",
    input,
  );

  return res.data!;
}

/**
 * 상품 삭제
 *
 * @param productId 상품 번호
 * @returns
 */
export async function deleteProduct(
  sku: string,
): Promise<{ productId: string }> {
  if (!sku) throw new Error("유효하지 않은 상품 ID 입니다.");

  const res = await callApi<{ sku: string }, undefined>(
    "/api/product",
    "DELETE",
    { sku },
  );

  return res.data!;
}
