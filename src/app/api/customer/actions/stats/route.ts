import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/core";
import { getCustomerStats } from "@/lib/customer/customer.server";

/**
 * 총 고객 수, 30일 이내 고객 수 조회
 *
 * @param request Next.js Request 객체
 * @returns
 */
export async function GET(request: NextRequest) {
  try {
    const customerStats = await getCustomerStats();

    const response: ApiResponse<typeof customerStats> = {
      success: true,
      message: "고객 수 조회 성공했습니다.",
      data: customerStats,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(`[GET] ${request.url} : `, error);

    const response: ApiResponse<null> = {
      success: false,
      message: "고객 수 조회 실패했습니다.",
      data: null,
    };

    return NextResponse.json(response, { status: 500 });
  }
}
