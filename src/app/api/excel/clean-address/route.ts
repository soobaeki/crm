import { NextRequest, NextResponse } from "next/server";
import { RowData } from "@/types/excel";
import { ApiResponse } from "@/lib/core";
import { convertToRoadAddress } from "@/utils/formatters";

// 클린 주소 변환
export async function POST(request: NextRequest) {
  try {
    const rows: RowData[] = await request.json();

    if (!rows || !Array.isArray(rows)) {
      return NextResponse.json(
        { success: false, message: "올바른 배열 형식이 아닙니다.", data: null },
        { status: 400 },
      );
    }

    /* ================================================================= */
    /* 👑 [수정] 배열을 반복문 돌면서 server.ts의 단일 변환 함수를 호출합니다. */
    /* ================================================================= */
    const excelUpload: RowData[] = await Promise.all(
      rows.map(async (row) => {
        // 엑셀 행에 주소 값이 없으면 변환하지 않고 그대로 반환
        if (!row.address) return row;

        const result = await convertToRoadAddress(row.address);

        return {
          ...row,
          address: result?.roadAddress || row.address, // 👑 "서울시 서대문구 연희로25길 3 101호" 완성!
        };
      }),
    );

    // 최종 정제 완료된 배열(excelUpload)을 응답 데이터에 실어 보냅니다.
    const response: ApiResponse<RowData[]> = {
      success: true,
      message: "엑셀 주소 최신화에 성공했습니다.",
      data: excelUpload,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.log(`[POST] ${request.url} : `, error);

    const response: ApiResponse<null> = {
      success: false,
      message: "엑셀 주소 최신화에 실패했습니다.",
      data: null,
    };

    return NextResponse.json(response, { status: 500 });
  }
}
