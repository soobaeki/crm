import {
  deleteOrderWithItems,
  getOrderWithItems,
  postOrderWithItems,
  updateOrderWithItems,
} from "@/lib/orders/order.server";
import { OrderFormInput, OrderItemFormInput } from "@/types/order";
import { NextResponse } from "next/server";

// GET: 주문 목록 조회
export async function GET(orderId?: number) {
  try {
    const orders = await getOrderWithItems(orderId);
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.log("error", error);
    return NextResponse.json({ error: "주문 목록 조회 실패" }, { status: 500 });
  }
}

// POST: 주문 등록
export async function POST(req: Request) {
  try {
    const { orderData, itemsData } = (await req.json()) as {
      orderData: OrderFormInput;
      itemsData: OrderItemFormInput[];
    };
    const result = await postOrderWithItems(orderData, itemsData);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.log("error", error);
    return NextResponse.json({ error: "상품 등록 실패" }, { status: 500 });
  }
}

// PUT: 주문 수정
export async function PUT(req: Request) {
  try {
    const { orderId, orderData, itemsData } = (await req.json()) as {
      orderId: number;
      orderData: OrderFormInput;
      itemsData: OrderItemFormInput[];
    };
    const result = await updateOrderWithItems(orderId, orderData, itemsData);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.log("error", error);
    return NextResponse.json({ error: "상품 수정 실패" }, { status: 500 });
  }
}

// DELETE: 주문 실패
export async function DELETE(req: Request) {
  try {
    const { orderId } = (await req.json()) as {
      orderId: number;
    };
    const result = await deleteOrderWithItems(orderId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.log("error", error);
    return NextResponse.json({ error: "상품 삭제 실패" }, { status: 500 });
  }
}
