import { Prisma, products } from "@prisma/client";
import { Product, ProductFormInput } from "@/types/product";
import { prisma } from "@/lib/prisma";
import { getCurrentTimestamp, getStockKeepingUnit } from "@/utils/generator";

export const Currency = {
  KRW: "KRW",
  USD: "USD",
};

// GET 메서드: 상품 목록 조회
export async function selectProducts(searchText?: string): Promise<Product[]> {
  const onlyNumberText = searchText?.replace(/[^0-9]/g, "");
  const isNumber = !!(onlyNumberText && onlyNumberText.length > 0);
  const numValue = isNumber ? Number(onlyNumberText) : null;
  const lowerSearch = searchText?.toLowerCase();

  // 2. 8자리 숫자(YYYYMMDD)를 날짜 범위로 변환
  let dateFilter = null;
  if (onlyNumberText?.length === 8) {
    const year = onlyNumberText.substring(0, 4);
    const month = onlyNumberText.substring(4, 6);
    const day = onlyNumberText.substring(6, 8);

    // 뒤에 'T00:00:00.000Z'를 직접 붙여서 UTC 0시임을 명시합니다.
    dateFilter = {
      gte: new Date(`${year}-${month}-${day}T00:00:00.000Z`),
      lte: new Date(`${year}-${month}-${day}T23:59:59.999Z`),
    };
  }

  const where: Prisma.productsWhereInput = {
    ...(searchText && {
      OR: [
        // 텍스트 기반 검색 (대소문자 무시) String 필드: mode: "insensitive" 사용 가능
        { name: { contains: searchText } },
        { sku: { contains: searchText } },
        { currency: { contains: searchText } },

        // 숫자 기반 검색 (값이 숫자일 때만 추가) 숫자 필드: mode를 빼고 값만
        ...(isNumber && numValue !== null
          ? [
              { id: numValue },
              { price: numValue },
              { weight: numValue },
              { stock_quantity: numValue },
              { sku: { contains: onlyNumberText } },
            ]
          : []),

        // 활성화 상태 검색 Boolean 필드: 역시 mode 사용 불가
        ...(lowerSearch === "true" || lowerSearch === "false"
          ? [{ is_active: lowerSearch === "true" }]
          : []),

        // 4. 날짜 검색 (YYYYMMDD 형태)
        ...(dateFilter
          ? [{ created_at: dateFilter }, { updated_at: dateFilter }]
          : []),
      ].filter(Boolean) as Prisma.productsWhereInput[],
    }),
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
export async function deleteProduct(sku: string) {
  await prisma.$transaction(async (tx) => {
    await tx.products.delete({ where: { sku } });
  });
}
