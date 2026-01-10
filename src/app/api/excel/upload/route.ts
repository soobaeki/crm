import { NextRequest, NextResponse } from "next/server";
import { RowData } from "@/types/excel";
import { ApiResponse } from "@/lib/core";
import { postUploadExcelServer } from "@/lib/excel/excel.server";

/**
 * 엑셀 업로드
 *
 * @param request Next.js Request 객체
 * @returns
 */
export async function POST(request: NextRequest) {
  try {
    const rows: RowData[] = await request.json();
    const excelUpload = await postUploadExcelServer(rows);

    const response: ApiResponse<typeof excelUpload> = {
      success: true,
      message: "엑셀 업로드에 성공했습니다.",
      data: excelUpload,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.log(`[POST] ${request.url} : `, error);

    const response: ApiResponse<null> = {
      success: false,
      message: "엑셀 업로드에 실패했습니다.",
      data: null,
    };

    return NextResponse.json(response, { status: 500 });
  }
}
