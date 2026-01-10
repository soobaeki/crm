import { NextRequest, NextResponse } from "next/server";
import { IExcelSearchFilter } from "@/types/filter";
import { ApiResponse } from "@/lib/core";
import { getSearchExcelListServer } from "@/lib/excel/excel.server";

/**
 * 엑셀 목록 조회
 *
 * @param request Next.js Request 객체
 * @returns
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params: IExcelSearchFilter = {
      startDate: searchParams.get("startDate") || "",
      endDate: searchParams.get("endDate") || "",
      searchText: searchParams.get("searchText") || "",
      item: searchParams.get("item") || "",
      weight: Number(searchParams.get("weight") || 0),
    };

    const excelList = await getSearchExcelListServer(params);

    const response: ApiResponse<typeof excelList> = {
      success: true,
      message: "엑셀 목록 조회 성공했습니다.",
      data: excelList,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(`[GET] ${request.url} : `, error);

    const response: ApiResponse<null> = {
      success: false,
      message: "엑셀 목록 조회 실패했습니다.",
      data: null,
    };

    return NextResponse.json(response, { status: 500 });
  }
}
