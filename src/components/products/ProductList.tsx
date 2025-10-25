import { Product } from "@/types/product";
import { formatNumber } from "@/utils/formatters";

interface IProps {
  products: Product[];
  onSelectProduct: (products: Product) => void;
}

// 한글 컬럼명 매핑
const columnLabels: Record<keyof Product, string> = {
  id: "상품 ID",
  sku: "SKU",
  name: "상품명",
  weight: "무게",
  price: "가격",
  currency: "통화",
  stockQuantity: "재고수량",
  isActive: "활성여부",
  createdAt: "등록일",
  updatedAt: "수정일",
};

export default function ProductList({ products, onSelectProduct }: IProps) {
  // column 순서 고정
  const columns = Object.keys(columnLabels) as (keyof Product)[];

  return (
    <div className="overflow-x-auto rounded border">
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        {/* ✅ 테이블 헤더 */}
        <thead className="bg-gray-100">
          <tr>
            {columns.map((key) => (
              <th
                key={String(key)}
                className="border px-3 py-2 text-sm font-semibold whitespace-nowrap text-gray-700"
              >
                {columnLabels[key]}
              </th>
            ))}
          </tr>
        </thead>

        {/* ✅ 테이블 바디 */}
        <tbody>
          {products.length > 0 ? (
            products.map((product, rowIndex) => (
              <tr
                key={product.id ?? rowIndex}
                className="cursor-pointer hover:bg-gray-50"
              >
                {columns.map((key) => {
                  const value = product[key];
                  let displayValue: string | number | boolean = "";

                  // ✅ 표시값 포맷 정의
                  switch (key) {
                    case "isActive":
                      displayValue = value ? "Y" : "N";
                      break;
                    case "price":
                      displayValue =
                        typeof value === "number"
                          ? formatNumber(value) + "원"
                          : "-";
                      break;
                    case "weight":
                      displayValue =
                        typeof value === "number"
                          ? formatNumber(value) + "kg"
                          : "-";
                      break;
                    case "stockQuantity":
                      displayValue =
                        typeof value === "number" ? formatNumber(value) : "-";
                      break;
                    case "isActive":
                      displayValue =
                        typeof value === "boolean" ? (value ? "Y" : "N") : "-";
                      break;
                    case "createdAt":
                    case "updatedAt":
                      displayValue = value ? value : "-";
                      break;
                    default:
                      displayValue = value ?? "-";
                      break;
                  }

                  // ✅ 정렬 방식 지정
                  const alignment = [
                    "price",
                    "weight",
                    "stockQuantity",
                  ].includes(key) // 숫자형은 우측정렬
                    ? "text-right"
                    : key === "name"
                      ? "text-left"
                      : "text-center";

                  return (
                    <td
                      key={String(key)}
                      className={`border px-3 py-1 text-sm whitespace-nowrap text-gray-700 ${alignment}`}
                      onClick={() => onSelectProduct(product)}
                    >
                      {displayValue}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td
                className="border px-4 py-4 text-center text-gray-500"
                colSpan={columns.length}
              >
                상품 데이터가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
