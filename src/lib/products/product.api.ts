import { Product, ProductFormInput } from "@/types/product";
import { callApi } from "../core";

export async function getProducts(): Promise<Product[]> {
  const res = await callApi("/api/product", "GET");

  if (!res.ok) throw new Error("상품 목록 조회 실패");
  return res.json();
}

export async function postProduct(data: ProductFormInput): Promise<Product> {
  const res = await callApi("/api/product", "POST", data);

  if (!res.ok) throw new Error("고객 등록 실패");
  return res.json();
}
