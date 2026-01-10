import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/core";
import {
  createProduct,
  deleteProduct,
  selectProducts,
  updateProduct,
} from "@/lib/product/product.server";

/**
 * 상품 목록 조회
 *
 * @param request Next.js Request 객체
 * @returns
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const searchText = searchParams.get("searchText") || undefined;

    const products = await selectProducts(startDate, endDate, searchText);

    const response: ApiResponse<typeof products> = {
      success: true,
      message: "상품 목록 조회 성공했습니다.",
      data: products,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.log(`[GET] ${request.url} : `, error);

    const resposne: ApiResponse<null> = {
      success: false,
      message: "상품 목록 조회 실패했습니다.",
      data: null,
    };

    return NextResponse.json(resposne, { status: 500 });
  }
}

/**
 * 상품 등록
 *
 * @param request Next.js Request 객체
 * @returns
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const postCustomer = await createProduct(data);

    const response: ApiResponse<typeof postCustomer> = {
      success: true,
      message: "상품 등록 성공했습니다.",
      data: postCustomer,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.log(`[POST] ${request.url} : `, error);

    const response: ApiResponse<null> = {
      success: false,
      message: "상품 등록 실패했습니다.",
      data: null,
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * 상품 수정
 *
 * @param request Next.js Request 객체
 * @returns
 */
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const putProduct = await updateProduct(data);

    const response: ApiResponse<typeof putProduct> = {
      success: true,
      message: "상품 수정 성공했습니다.",
      data: putProduct,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.log(`[PUT] ${request.url} : `, error);

    const response: ApiResponse<null> = {
      success: false,
      message: "상품 수정 실패했습니다.",
      data: null,
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * 상품 삭제
 *
 * @param request Next.js Request 객체
 * @returns
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const product = await deleteProduct(body);

    const response: ApiResponse<typeof product> = {
      success: true,
      message: "상품 삭제 성공했습니다.",
      data: product,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.log(`[DELETE] ${request.url} : `, error);

    const response: ApiResponse<null> = {
      success: false,
      message: (error as Error).message || "상품 삭제 실패했습니다.",
      data: null,
    };

    return NextResponse.json(response, { status: 500 });
  }
}
