import { NextResponse } from "next/server";
import { getCustomerIssues } from "@/lib/customers/customer.server";

// 고객 주의사항
export async function GET() {
  try {
    const result = await getCustomerIssues();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.log("error", error);
    return NextResponse.json(
      { error: "고객 주의사항 조회 실패" },
      { status: 500 },
    );
  }
}
