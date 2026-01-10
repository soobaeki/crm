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
    const { orderId, orderData, itemsData } = (await request.json()) as {
      orderId: number;
      orderData: OrderFormInput;
      itemsData: OrderItemFormInput[];
    };

    const updateOrders = await updateOrderWithItems(
      orderId,
      orderData,
      itemsData,
    );

    const response: ApiResponse<typeof updateOrders> = {
      success: true,
      message: "주문 수정 성공했습니다.",
      data: updateOrders,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.log(`[PUT] ${request.url} : `, error);

    const response: ApiResponse<null> = {
      success: false,
      message: "주문 수정 실패했습니다.",
      data: null,
    };

    return NextResponse.json(response, { status: 500 });
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
