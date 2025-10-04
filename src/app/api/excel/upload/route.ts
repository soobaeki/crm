import { NextResponse } from "next/server";
import { RowData } from "@/types/excel";
import { postUploadExcelServer } from "@/lib/excel/excel.server";

// POST: 엑셀 업로드
export async function POST(req: Request) {
  try {
    const rows: RowData[] = await req.json();
    await postUploadExcelServer(rows);
    return NextResponse.json(
      { success: true, message: "엑셀 업로드 성공" },
      { status: 201 },
    );
  } catch (error) {
    console.log("error", error);
    return NextResponse.json(
      { success: false, error: "엑셀 업로드 실패" },
      { status: 500 },
    );
  }
}
