"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RowData } from "@/types/excel";
import ViewBody from "@/components/commons/ViewBody";
import ViewContainer from "@/components/commons/ViewContainer";
import ViewTitle from "@/components/commons/ViewTitle";
import { postUploadExcelApi } from "@/lib/excel/excel.api";
import { readFile } from "@/utils/excel";

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

  const queryClient = useQueryClient();

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

  // 업로드 중 체크
  const uploading = mutation.status === "pending";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];

    setLoading(true);
    try {
      const result = await readFile(file);
      setData(result);
    } catch (err) {
      console.error(err);
      alert("파일 읽기 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = () => {
    if (data.length === 0) return alert("업로드할 데이터가 없습니다.");
    mutation.mutate(data); // mutation 호출
  };

  return (
    <ViewContainer>
      <ViewTitle>Excel 관리</ViewTitle>

      {/* 파일 업로드 */}
      <div>
        <input
          type="file"
          accept=".csv,.xls,.xlsx"
          onChange={handleFileChange}
          className="border p-2 rounded"
        />
        {/* DB 업로드 버튼 */}
        <button
          onClick={handleUpload}
          disabled={data.length === 0 || uploading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {uploading ? "업로드 중..." : "DB에 업로드"}
        </button>
      </div>

      {/* 로딩 표시 */}
      {loading && <p className="text-gray-500">파일을 읽는 중입니다...</p>}
      <ViewBody>
        {/* 데이터 테이블 */}
        {data.length > 0 ? (
          <div className="overflow-x-auto border rounded">
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
          !loading && (
            <p className="text-gray-500">업로드된 데이터가 없습니다.</p>
          )
        )}
      </ViewBody>
    </ViewContainer>
  );
}
