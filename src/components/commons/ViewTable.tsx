"use client";

/**
 * Column 인터페이스
 * key: 데이터 객체의 키값
 * label: 헤더에 표시될 이름 (무조건 중앙 정렬)
 * align: 데이터(td)의 정렬 방향 (기본값: left)
 */
interface Column {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
}

interface IProps {
  columns: Column[];
  data: any[];
  isLoading?: boolean;
}

export default function ViewTable({ columns, data, isLoading }: IProps) {
  return (
    <div className="flex h-full w-full flex-col">
      {/* 가로 스크롤 컨테이너 */}
      <div className="flex-1 overflow-x-auto">
        <div className="inline-block h-full min-w-full align-middle">
          <table className="h-full min-w-full border-collapse divide-y divide-gray-100 text-base">
            {/* 1. 헤더 섹션: 무조건 중앙(text-center) 정렬 */}
            <thead className="border-b border-gray-100 bg-gray-50/50">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={col.key}
                    className={`/* 헤더는 무조건 중앙 정렬 */ px-4 py-3 text-center text-[13px] font-semibold whitespace-nowrap text-gray-500`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            {/* 2. 본문 섹션: 데이터 성격에 따라 개별 정렬 */}
            <tbody className="divide-y divide-gray-50 bg-white">
              {data.length > 0 ? (
                data.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="transition-colors hover:bg-gray-50/80"
                  >
                    {columns.map((col, colIdx) => (
                      <td
                        key={col.key}
                        className={`px-5 py-5 break-keep text-gray-700 ${
                          col.align === "center"
                            ? "text-center"
                            : col.align === "right"
                              ? "text-right"
                              : "text-left"
                        } `}
                      >
                        {/* 숫자 데이터 콤마 처리 및 빈 값 하이픈 처리 */}
                        {row[col.key] !== undefined && row[col.key] !== null
                          ? typeof row[col.key] === "number"
                            ? row[col.key].toLocaleString()
                            : row[col.key]
                          : "-"}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                /* 데이터가 없을 때 Flex하게 바닥까지 늘리기 */
                <tr className="h-full min-h-[250px]">
                  <td
                    colSpan={columns.length}
                    className="py-24 text-center align-middle text-base text-gray-400"
                  >
                    {isLoading
                      ? "데이터를 불러오는 중입니다..."
                      : "데이터가 없습니다."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
