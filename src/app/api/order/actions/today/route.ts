import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/core";
import { getTodaysOrdersCustomers } from "@/lib/order/order.server";

/**
 * 오늘 주문한 고객 목록 조회
 *
 * @param request
 * @returns
 */
export async function GET(request: NextRequest) {
  try {
    const todayOrderCustomers = await getTodaysOrdersCustomers();

    const response: ApiResponse<typeof todayOrderCustomers> = {
      success: true,
      message: "오늘 주문한 고객 목록 조회 성공했습니다.",
      data: todayOrderCustomers,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.log(`[GET] ${request.url} : `, error);

    const response: ApiResponse<null> = {
      success: false,
      message: "오늘 주문한 고객 목록 조회 실패했습니다.",
      data: null,
    };

    return NextResponse.json(response, { status: 500 });
  }
}
