import { Product, ProductFormInput } from "@/types/product";
import { callApi } from "../core";

export async function getProducts(
  startDate?: string,
  endDate?: string,
  searchText?: string,
): Promise<Product[]> {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (searchText) params.append("searchText", searchText);

  const url = `/api/product?${params.toString()}`;
  const res = await callApi(url, "GET");

  if (!res.ok) throw new Error("상품 목록 조회 실패");
  return res.json();
}

export async function postProduct(data: ProductFormInput): Promise<Product> {
  const res = await callApi("/api/product", "POST", data);

  if (!res.ok) throw new Error("상품 등록 실패");
  return res.json();
}

export async function putProduct(data: ProductFormInput): Promise<Product> {
  const res = await callApi("/api/product", "PUT", data);

  if (!res.ok) throw new Error("상품 수정 실패");
  return res.json();
}

export async function deleteProduct(data: number): Promise<void> {
  if (isNaN(data)) return alert("유효하지 않은 상품 ID 입니다.");

  const res = await callApi("/api/product", "DELETE", data);

  if (!res.ok) throw new Error("상품 삭제 실패");
}
