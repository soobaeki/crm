"use client";

import { Customer } from "@/types/customer";
import { formatPhone } from "@/utils/formatters";

interface IProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
}

export default function CustomerList({ customers, onSelectCustomer }: IProps) {
  return (
    <>
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
    </>
  );
}
