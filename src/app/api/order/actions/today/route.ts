import { NextResponse } from "next/server";
import { getTodaysOrdersCustomers } from "@/lib/orders/order.server";

// 오늘 주문한 고객
export async function GET() {
  try {
    const result = await getTodaysOrdersCustomers();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.log("error", error);
    return NextResponse.json(
      { error: "오늘자 주문 고객 조회 실패" },
      { status: 500 },
    );
  }
}
