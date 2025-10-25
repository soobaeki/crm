import { Prisma, products } from "@prisma/client";
import { Product, ProductFormInput } from "@/types/product";
import { prisma } from "@/lib/prisma";
import { getCurrentTimestamp, getStockKeepingUnit } from "@/utils/generator";

export const Currency = {
  KRW: "KRW",
  USD: "USD",
};

// GET 메서드: 상품 목록 조회
export async function selectProducts(
  startDate?: string,
  endDate?: string,
  searchText?: string,
): Promise<Product[]> {
  const where: Prisma.productsWhereInput = {
    AND: [
      // 1️⃣ 날짜 조건
      {
        created_at: {
          ...(startDate ? { gte: new Date(startDate) } : {}),
          ...(endDate ? { lte: new Date(endDate) } : {}),
        },
      },
      // 2️⃣ searchText 조건
      ...(searchText
        ? [
            {
              OR: [
                !isNaN(Number(searchText))
                  ? { id: { equals: Number(searchText) } }
                  : undefined,
                { name: { contains: searchText, mode: "insensitive" } },
                !isNaN(Number(searchText))
                  ? { weight: { equals: Number(searchText) } }
                  : undefined,
                !isNaN(Number(searchText))
                  ? { price: { equals: Number(searchText) } }
                  : undefined,
                { currency: { contains: searchText, mode: "insensitive" } },
                !isNaN(Number(searchText))
                  ? { stock_quantity: { equals: Number(searchText) } }
                  : undefined,
                searchText.toLowerCase() === "true"
                  ? { is_active: { equals: true } }
                  : searchText.toLowerCase() === "false"
                    ? { is_active: { equals: false } }
                    : undefined,
              ].filter(Boolean) as Prisma.productsWhereInput[],
            },
          ]
        : []),
    ],
  };

  const products: products[] = await prisma.products.findMany({ where });

  // snake_case → camelCase 변환
  return products.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    weight: p.weight,
    price: p.price,
    currency: p.currency ?? "KRW",
    stockQuantity: p.stock_quantity ?? 0,
    isActive: Boolean(p.is_active),
    createdAt: p.created_at?.toISOString().split("T")[0] ?? "",
    updatedAt: p.updated_at?.toISOString().split("T")[0] ?? "",
  }));
}

// POST 메서드: 상품 등록
export async function createProduct(data: ProductFormInput) {
  const { name, weight, price, stockQuantity } = data;
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
  const { sku, name, weight, price, currency, stockQuantity, isActive } = data;
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

// DELETE 메서드: 상품 삭제
export async function deleteProduct(id: number) {
  await prisma.$transaction(async (tx) => {
    await tx.products.delete({ where: { id } });
  });
}
