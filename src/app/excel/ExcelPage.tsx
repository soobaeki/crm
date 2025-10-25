"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { RowData } from "@/types/excel";
import { IExcelSearchFilter } from "@/types/filter";
import ViewBody from "@/components/commons/ViewBody";
import ViewContainer from "@/components/commons/ViewContainer";
import ViewTitle from "@/components/commons/ViewTitle";
import ExcelSearchFilter from "@/components/excels/ExcelSearchFilter";
import {
  getSearchExcelListApi,
  postUploadExcelApi,
} from "@/lib/excel/excel.api";
import { downloadExcel } from "@/utils/excel";

// RowData 키 → 한글 레이블 매핑
const rowDataLabels: Record<keyof RowData, string> = {
  id: "순번",
  orderDate: "주문일자",
  item: "품목",
  weight: "무게",
  quantity: "수량",
  address: "주소",
  homePhone: "집전화",
  mobilePhone: "휴대전화",
  customerName: "주문자",
  paymentAmount: "입금액",
  paymentDate: "입금일",
  payer: "입금자",
  notes: "특이사항",
};

// 자동으로 columns 생성
export const columns: { key: keyof RowData; label: string }[] = (
  Object.keys(rowDataLabels) as (keyof RowData)[]
).map((key) => ({
  key,
  label: rowDataLabels[key],
}));

export default function ExcelPage() {
  const [data, setData] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState<IExcelSearchFilter>({
    startDate: "",
    endDate: "",
    searchText: "",
    item: "",
    weight: 0,
  });

  const mutation = useMutation({
    mutationFn: (rows: RowData[]) => postUploadExcelApi(rows),
    onSuccess: () => {
      alert("DB에 성공적으로 저장되었습니다!");
      setData([]);
    },
    onError: (error) => {
      console.error(error);
      alert("업로드 중 오류가 발생했습니다.");
    },
  });

  // 검색 핸들러
  const handleSearch = async () => {
    try {
      setLoading(true);
      const result = await getSearchExcelListApi(searchFilter); // POST로 서버 호출
      setData(result); // 결과를 테이블에 세팅
    } catch (err) {
      console.error(err);
      alert("검색 실패");
    } finally {
      setLoading(false);
    }
  };

  // 업로드 중 체크
  const uploading = mutation.status === "pending";

  const handleUpload = () => {
    if (data.length === 0) return alert("업로드할 데이터가 없습니다.");
    mutation.mutate(data); // mutation 호출
  };

  const handleDownload = () => {
    if (data.length === 0) return alert("다운로드할 데이터가 없습니다.");
    downloadExcel(data, rowDataLabels);
  };

  return (
    <ViewContainer>
      {/* 제목 */}
      <ViewTitle>Excel 관리</ViewTitle>

      {/* 본문 */}
      <ViewBody>
        {/* 조회 영역 */}
        <ExcelSearchFilter
          filters={searchFilter}
          onChange={setSearchFilter}
          onSearch={handleSearch}
          handleUpload={handleUpload}
          handleDownload={handleDownload}
          uploading={uploading}
          data={data}
        />

        {/* 리스트 영역 */}
        {loading ? (
          <p className="text-gray-500">데이터 불러오는 중...</p>
        ) : data.length > 0 ? (
          <div className="overflow-x-auto rounded border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-2 text-left text-sm font-medium text-gray-700"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-4 py-2 text-sm text-gray-700"
                      >
                        {row[col.key] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">데이터가 없습니다.</p>
        )}
      </ViewBody>
    </ViewContainer>
  );
}
