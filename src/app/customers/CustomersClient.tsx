"use client";

import { useState } from "react";
import { Customer } from "@/types/customer";
import { formatPhone } from "@/utils/formatters";

interface IFilters {
  startDate: string;
  endDate: string;
  searchText: string;
}

interface IProps {
  customers: Customer[];
  filters: IFilters;
  onSelectCustomer: (customer: Customer) => void;
  onChangeFilter: (filters: IFilters) => void;
}

export default function CustomersClient({
  customers,
  filters,
  onSelectCustomer,
  onChangeFilter,
}: IProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    onChangeFilter(localFilters); // 페이지에 전달
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 py-4">
      {/* 검색 필터 */}
      <section className="mb-4 flex flex-col gap-2 rounded-lg border p-4 md:flex-row md:items-center md:gap-3">
        {/* 기간 검색 */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <label className="min-w-[70px] text-sm">기간검색</label>
          <div className="flex min-w-0 flex-1 gap-2">
            <input
              className="max-w-full min-w-[120px] flex-1 rounded border px-2 py-1 text-sm"
              name="startDate"
              type="date"
              value={localFilters.startDate || ""}
              onChange={handleInputChange}
            />
            <span className="self-center whitespace-nowrap">~</span>
            <input
              className="max-w-full min-w-[120px] flex-1 rounded border px-2 py-1 text-sm"
              name="endDate"
              type="date"
              value={localFilters.endDate || ""}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* 조건검색 */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <label className="min-w-[70px] text-sm">조건검색</label>
          <input
            className="w-full rounded border px-2 py-1 text-sm md:w-auto"
            name="searchText"
            placeholder="검색어를 입력해주세요"
            type="text"
            value={localFilters.searchText || ""}
            onChange={handleInputChange}
          />
        </div>

        {/* 조회 버튼 */}
        <div className="flex justify-end md:ml-auto">
          <button
            className="cursor-pointer rounded bg-blue-600 px-4 py-1 text-sm text-white"
            onClick={handleSearch}
          >
            조회
          </button>
        </div>
      </section>

      {/* 결과 테이블 */}
      <div className="flex-1 overflow-auto">
        <div className="h-full w-full min-w-[900px]">
          <table
            className={`w-full table-auto border-collapse border border-gray-300 ${
              customers.length === 0 ? "min-h-full" : ""
            }`}
          >
            <thead className="bg-gray-100">
              <tr>
                {["순번", "고객명", "집전화", "휴대전화", "주소"].map(
                  (h, i) => {
                    const widths = [
                      "min-w-[50px] md:min-w-[70px]", // 순번
                      "min-w-[70px] md:min-w-[90px]", // 고객명
                      "min-w-[100px] md:min-w-[120px]", // 집전화
                      "min-w-[110px] md:min-w-[130px]", // 휴대전화
                      "min-w-[200px] md:min-w-[280px]", // 주소
                    ];
                    return (
                      <th
                        key={h}
                        className={`border px-2 py-1 text-center whitespace-nowrap ${widths[i]}`}
                      >
                        {h}
                      </th>
                    );
                  },
                )}
              </tr>
            </thead>
            <tbody>
              {customers.length > 0 ? (
                customers.map((c, idx) => {
                  const alignments = [
                    "text-center", // 순번
                    "text-center", // 고객명
                    "text-center", // 휴대전화
                    "text-center", // 집전화
                    "text-left", // 주소
                  ];

                  const rowData = [
                    idx + 1,
                    c.customerName ? c.customerName : (c.nickName ?? ""),
                    formatPhone(c.mobilePhone || ""),
                    formatPhone(c.homePhone || ""),
                    c.address,
                  ];

                  return (
                    <tr
                      key={c.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => onSelectCustomer(c)}
                    >
                      {rowData.map((data, i) => (
                        <td
                          key={i}
                          className={`border px-2 py-1 whitespace-nowrap ${alignments[i]}`}
                        >
                          {data}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    className="px-4 py-4 text-center text-gray-500"
                    colSpan={14}
                  >
                    데이터가 없습니다.
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

// {[
//                   "순번",
//                   "주문일자",
//                   "품목",
//                   "수량",
//                   "주소",
//                   "집전화",
//                   "휴대전화",
//                   "주문자",
//                   "입금액",
//                   "입금일",
//                   "입금자",
//                   "특이사항",
//                 ].map((h, i) => {
//                   const widths = [
//                     "min-w-[50px] md:min-w-[70px]", // 순번
//                     "min-w-[70px] md:min-w-[90px]", // 주문일자
//                     "min-w-[70px] md:min-w-[90px]", // 품목
//                     "min-w-[70px] md:min-w-[90px]", // 수량
//                     "min-w-[200px] md:min-w-[280px]", // 주소
//                     "min-w-[100px] md:min-w-[120px]", // 집전화
//                     "min-w-[110px] md:min-w-[130px]", // 휴대전화
//                     "min-w-[70px] md:min-w-[90px]", // 주문자
//                     "min-w-[70px] md:min-w-[90px]", // 입금액
//                     "min-w-[70px] md:min-w-[90px]", // 입금일
//                     "min-w-[70px] md:min-w-[90px]", // 입금자
//                     "min-w-[80px] md:min-w-[100px]", // 특이사항
//                   ];
