import { NextRequest, NextResponse } from "next/server";
import { OrderFormInput, OrderItemFormInput } from "@/types/order";
import { ApiResponse } from "@/lib/core";
import {
  deleteOrderWithItems,
  getOrderWithItems,
  postOrderWithItems,
  updateOrderWithItems,
} from "@/lib/order/order.server";

/**
 * 주문 목록 조회
 *
 * @param orderId 주문번호
 * @param request Next.js Request 객체
 * @returns
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    const orders = await getOrderWithItems(
      orderId ? Number(orderId) : undefined,
    );

    const response: ApiResponse<typeof orders> = {
      success: true,
      message: "주문 목록 조회 성공했습니다.",
      data: orders,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.log(`[GET] ${request.url} : `, error);

    const response: ApiResponse<null> = {
      success: false,
      message: "주문 목록 조회 실패했습니다.",
      data: null,
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * 주문 등록
 *
 * @param request Next.js Request 객체
 * @returns
 */
export async function POST(request: NextRequest) {
  try {
    const { orderData, itemsData } = (await request.json()) as {
      orderData: OrderFormInput;
      itemsData: OrderItemFormInput[];
    };

    const postOrders = await postOrderWithItems(orderData, itemsData);

    const response: ApiResponse<typeof postOrders> = {
      success: true,
      message: "주문 등록 성공하였습니다.",
      data: postOrders,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.log(`[POST] ${request.url} : `, error);

    const response: ApiResponse<null> = {
      success: false,
      message: "주문 등록 실패하였습니다.",
      data: null,
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * 주문 수정
 *
 * @param request Next.js Request 객체
 * @returns
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderData, itemsData } = body;

    // 👑 [서버 터미널 확인용 로그] 도대체 프론트에서 뭐가 넘어오는지 범인을 잡습니다.
    console.log("====== 🔥 백엔드 API에 들어온 원본 데이터 🔥 ======");
    console.log("orderData전체:", orderData);
    console.log("프론트가 준 orderData.id:", orderData?.id);
    console.log("프론트가 준 orderData.customerId:", orderData?.customerId);
    console.log("==================================================");

    // 🚨 억까 방지용 강제 교통정리
    // 만약 프론트가 id를 0이나 이상한 값으로 줬거나, customerId와 똑같이 줬다면 진짜 데이터에서 추출 시도
    const realOrderId = Number(orderData.id);

    if (!realOrderId || realOrderId === Number(orderData.customerId)) {
      console.error(
        "❌ 치명적 오류: 프론트가 준 주문 ID가 없거나 고객 ID와 동일합니다!",
      );
    }

    // 배열 규격 강제 통일
    const formattedItems = Array.isArray(itemsData) ? itemsData : [itemsData];

    // 👑 확실하게 검증된 realOrderId를 넘깁니다.
    const result = await updateOrderWithItems(
      realOrderId,
      orderData,
      formattedItems,
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("PUT /api/order 에러 발생:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

/**
 * 주문 삭제
 *
 * @param request Next.js Request 객체
 * @returns
 */
export async function DELETE(request: NextRequest) {
  try {
    const { orderId } = (await request.json()) as {
      orderId: number;
    };

    const deleteOrders = await deleteOrderWithItems(orderId);

    const response: ApiResponse<typeof deleteOrders> = {
      success: true,
      message: "주문 삭제 성공했습니다.",
      data: deleteOrders,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.log(`[DELETE] ${request.url} : `, error);

    const response: ApiResponse<null> = {
      success: false,
      message: "주문 삭제 실패했습니다.",
      data: null,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
