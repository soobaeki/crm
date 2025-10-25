import { NextRequest, NextResponse } from "next/server";
import { IExcelSearchFilter } from "@/types/filter";
import { getSearchExcelListServer } from "@/lib/excel/excel.server";

// GET: 엑셀 목록 조회
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const params: IExcelSearchFilter = {
      startDate: searchParams.get("startDate") || "",
      endDate: searchParams.get("endDate") || "",
      searchText: searchParams.get("searchText") || "",
      item: searchParams.get("item") || "",
      weight: Number(searchParams.get("weight") || 0),
    };

    const rows = await getSearchExcelListServer(params);
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("GET /api/excel/search error:", error);
    return NextResponse.json({ error: "엑셀 목록 조회 실패" }, { status: 500 });
  }
}
