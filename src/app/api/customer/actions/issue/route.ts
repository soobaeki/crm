import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/core";
import { getCustomerIssues } from "@/lib/customer/customer.server";

export const dynamic = "force-dynamic"; // 추가
/**
 * 고객 주의사항 조회 API
 *
 * @param request Next.js Request 객체
 * @returns
 */
export async function GET(request: NextRequest) {
  try {
    const issues = await getCustomerIssues();

    const response: ApiResponse<typeof issues> = {
      success: true,
      message: "고객 주의사항 조회 성공했습니다.",
      data: issues,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(`[GET] ${request.url} : `, error);

    const response: ApiResponse<null> = {
      success: false,
      message: "고객 주의사항 조회 실패했습니다.",
      data: null,
    };

    return NextResponse.json(response, { status: 500 });
  }
}
