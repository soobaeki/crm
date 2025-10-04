import { RowData } from "@/types/excel";
import { callApi } from "../core";

export async function postUploadExcelApi(rows: RowData[]): Promise<RowData[]> {
  // route.ts 호출
  const res = await callApi("/api/excel/upload", "POST", rows);

  if (!res.ok) {
    throw new Error("엑셀 등록 실패");
  }
  return res.json(); // 생성된 데이터 반환
}
