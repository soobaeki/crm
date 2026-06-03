import { RowData, SkippedRow } from "@/types/excel";
import { IExcelSearchFilter } from "@/types/filter";
import { toQueryString } from "@/utils/url";
import { callApi } from "../core";

/**
 * 엑셀 업로드 등록
 *
 * @param rows 업로드할 데이터
 * @returns
 */
export async function postUploadExcelApi(rows: RowData[]): Promise<
  {
    total: number;
    successCount: number;
    skippedCount: number;
    skippedRows: SkippedRow[];
  }[]
> {
  const res = await callApi<
    RowData[],
    {
      total: number;
      successCount: number;
      skippedCount: number;
      skippedRows: SkippedRow[];
    }[]
  >("/api/excel/upload", "POST", rows);

  return res.data!;
}

/**
 * 업로드된 데이터 조회
 *
 * @param input 조건 데이터
 * @returns
 */
export async function getSearchExcelListApi(
  input: IExcelSearchFilter,
): Promise<RowData[]> {
  const qs = toQueryString(input);

  const res = await callApi<undefined, RowData[]>(
    `/api/excel/search?${qs}`,
    "GET",
  );

  return res.data!;
}

/**
 * 최신 도로명 주소 가져오기
 */
export async function convertToRoadAddress(
  rows: RowData[],
): Promise<RowData[]> {
  const res = await callApi<RowData[], RowData[]>(
    `/api/excel/clean-address`,
    "POST",
    rows,
  );

  return res.data!;
}
