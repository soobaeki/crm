import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/core";
import { getRegionCustomerCounts } from "@/lib/customer/customer.server";

/**
 * 지역별 고객 수 조회 API
 *
 * @param request Next.js Request 객체
 * @returns
 */
export async function GET(request: NextRequest) {
  try {
    const regionCustomerCounts = await getRegionCustomerCounts();

    const response: ApiResponse<typeof regionCustomerCounts> = {
      success: true,
      message: "지역별 고객 수 조회 성공했습니다.",
      data: regionCustomerCounts,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(`[GET] ${request.url} : `, error);

    const response: ApiResponse<null> = {
      success: false,
      message: "지역별 고객 수 조회 실패했습니다.",
      data: null,
    };

    return NextResponse.json(response, { status: 500 });
  }
}
