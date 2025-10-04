import type { products } from "@prisma/client";
import { ProductFormInput } from "@/types/product";
import { prisma } from "@/lib/prisma";
import { getCurrentTimestamp, getStockKeepingUnit } from "@/utils/generator";

export const Currency = {
  KRW: "KRW",
  USD: "USD",
};

// GET 메서드: 상품 목록 조회
export async function getProducts() {
  const products: products[] = await prisma.products.findMany();
  return products;
}

// POST 메서드: 상품 등록
export async function postProduct(data: ProductFormInput) {
  const { name, description, price, stockQuantity } = data;
  return await prisma.products.create({
    data: {
      sku: getStockKeepingUnit(),
      name,
      weight,
      price,
      currency: Currency.KRW,
      stock_quantity: stockQuantity,
      is_active: true,
      updated_at: getCurrentTimestamp(),
    },
  });
}

// PUT 메서드: 상품 수정
export async function updateProduct(data: ProductFormInput) {
  const { sku, name, description, price, currency, stockQuantity, isActive } =
    data;
  return await prisma.products.update({
    where: { sku: sku },
    data: {
      name,
      weight,
      price,
      currency,
      stock_quantity: stockQuantity,
      is_active: isActive,
      updated_at: getCurrentTimestamp(),
    },
  });
}
