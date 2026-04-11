import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/core";
import {
  getCustomers,
  postCustomer,
  updateCustomer,
} from "@/lib/customer/customer.server";

/**
 * 고객 목록 조회
 *
 * @param request Next.js Request 객체
 * @returns
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const customers = await getCustomers(startDate, endDate);

    const response: ApiResponse<typeof customers> = {
      success: true,
      message: "고객 목록 조회 성공했습니다.",
      data: customers,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(`[GET] ${request.url} : `, error);

    const response: ApiResponse<null> = {
      success: false,
      message: "고객 목록 조회 실패했습니다.",
      data: null,
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * 고객 등록
 *
 * @param request Next.js Request 객체
 * @returns
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const customer = await postCustomer(data);

    const response: ApiResponse<typeof customer> = {
      success: true,
      message: "고객 등록 성공했습니다.",
      data: customer,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error(`[POST] ${request.url} : `, error);

    const response: ApiResponse<null> = {
      success: false,
      message: "고객 등록 실패했습니다.",
      data: null,
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * 고객 수정
 *
 * @param request Next.js Request 객체
 * @returns
 */
export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const customer = await updateCustomer(data);

    const response: ApiResponse<typeof customer> = {
      success: true,
      message: "고객 수정 성공했습니다.",
      data: customer,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(`[PATCH] ${request.url} : `, error);

    const response: ApiResponse<null> = {
      success: false,
      message: "고객 수정 실패했습니다.",
      data: null,
    };

    return NextResponse.json(response, { status: 500 });
  }
}
