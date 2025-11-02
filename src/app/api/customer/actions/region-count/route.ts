import { NextResponse } from "next/server";
import { getRegionCustomerCounts } from "@/lib/customers/customer.server";

// GET: 지역별 고객 수
export async function GET() {
  try {
    const result = await getRegionCustomerCounts();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.log("error", error);
    return NextResponse.json(
      { error: "지역별 고객 수 조회 실패" },
      { status: 500 },
    );
  }
}
