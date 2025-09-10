import {
  getProducts,
  postProduct,
  updateProduct,
} from "@/lib/products/product.server";
import { NextResponse } from "next/server";

// GET: 상품 목록 조회
export async function GET() {
  try {
    const products = await getProducts();
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
    const result = await postProduct(data);
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
