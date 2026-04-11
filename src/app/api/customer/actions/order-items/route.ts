import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/core";
import { getCustomerOrderHistory } from "@/lib/customer/customer.server";

/**
 * 고객의 주문 목록 조회
 *
 * @param request Next.js Request 객체
 * @returns
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    // 1. 일단 문자열로 받습니다.
    const customerIdParam = searchParams.get("customerId");

    // 2. 숫자로 변환하고 유효성을 체크합니다.
    const customerId = customerIdParam
      ? parseInt(customerIdParam, 10)
      : undefined;

    // 3. 만약 ID가 필수라면 에러 처리를 추가하는 것이 좋습니다.
    if (!customerId || isNaN(customerId)) {
      return NextResponse.json(
        {
          success: false,
          message: "유효한 고객 ID가 필요합니다.",
        },
        { status: 400 },
      );
    }

    const customerOrders = await getCustomerOrderHistory(customerId);

    const response: ApiResponse<typeof customerOrders> = {
      success: true,
      message: "고객의 주문 목록 조회 성공했습니다.",
      data: customerOrders,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(`[GET] ${request.url} : `, error);

    const response: ApiResponse<null> = {
      success: false,
      message: "고객의 주문 목록 조회 실패했습니다.",
      data: null,
    };

    return NextResponse.json(response, { status: 500 });
  }
}
