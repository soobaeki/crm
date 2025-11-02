import { NextResponse } from "next/server";
import { getCustomerStats } from "@/lib/customers/customer.server";

// GET: 총 고객 수, 30일 이내 고객 수 조회
export async function GET() {
  try {
    const result = await getCustomerStats();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.log("error", error);
    return NextResponse.json({ error: "고객 수 조회 실패" }, { status: 500 });
  }
}
