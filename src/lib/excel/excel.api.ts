import { RowData } from "@/types/excel";
import { IExcelSearchFilter } from "@/types/filter";
import { callApi } from "../core";

export async function postUploadExcelApi(rows: RowData[]): Promise<RowData[]> {
  // route.ts 호출
  const res = await callApi("/api/excel/upload", "POST", rows);

  if (!res.ok) {
    throw new Error("엑셀 등록 실패");
  }
  return res.json(); // 생성된 데이터 반환
}

export async function getSearchExcelListApi(
  req: IExcelSearchFilter,
): Promise<RowData[]> {
  const params = new URLSearchParams();
  if (req.startDate) params.append("startDate", req.startDate);
  if (req.endDate) params.append("endDate", req.endDate);
  if (req.searchText) params.append("searchText", req.searchText);
  if (req.item) params.append("item", req.item);
  if (req.weight) params.append("weight", req.weight.toString());

  // route.ts 호출
  const url = `/api/excel/search?${params.toString()}`;
  const res = await callApi(url, "GET");

  if (!res.ok) {
    throw new Error("엑셀 목록 조회 실패");
  }
  return res.json(); // 생성된 데이터 반환
}
