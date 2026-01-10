import { NextRequest, NextResponse } from "next/server";
import { getCustomers } from "@/lib/customer/customer.server";

// GET: 고객 목록 조회
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const customers = await getCustomers(startDate, endDate);
    return NextResponse.json(customers, { status: 200 });
  } catch (error) {
    console.log("error", error);
    return NextResponse.json({ error: "고객 목록 조회 실패" }, { status: 500 });
  }
}
