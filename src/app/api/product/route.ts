import { NextRequest, NextResponse } from "next/server";
import {
  createProduct,
  deleteProduct,
  selectProducts,
  updateProduct,
} from "@/lib/products/product.server";

// GET: 상품 목록 조회
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const searchText = searchParams.get("searchText") || undefined;

    const products = await selectProducts(startDate, endDate, searchText);
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.log("error", error);
    return NextResponse.json({ error: "상품 목록 조회 실패" }, { status: 500 });
  }
}

// POST: 상품 등록
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await createProduct(data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.log("error", error);
    return NextResponse.json({ error: "상품 등록 실패" }, { status: 500 });
  }
}

// PUT: 상품 수정
export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const result = await updateProduct(data);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.log("error", error);
    return NextResponse.json({ error: "상품 수정 실패" }, { status: 500 });
  }
}

// DELETE: 상품 삭제
export async function DELETE(req: Request) {
  try {
    const data: number = await req.json();
    await deleteProduct(data);
    return NextResponse.json({ message: "상품 삭제 성공" }, { status: 200 });
  } catch (error) {
    console.log("error", error);
    return NextResponse.json({ error: "상품 삭제 실패" }, { status: 500 });
  }
}
