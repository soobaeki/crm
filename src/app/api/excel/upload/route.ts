import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { parseExcel } from "@/api/excel/upload/parser";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json(
      { success: false, message: "파일 없음" },
      { status: 400 },
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const rows = await parseExcel(arrayBuffer);

  for (const row of rows) {
    const customer = await prisma.customer.upsert({
      where: { mobile_phone: row.customer.mobilePhone },
      update: {},
      create: {
        customer_name: row.customer.name,
        nick_name: row.customer.nickName,
        address: row.customer.address,
        home_phone: row.customer.homePhone,
        mobile_phone: row.customer.mobilePhone,
      },
    });

    for (const [productName, qty] of Object.entries(row.items)) {
      await prisma.customer_order.create({
        data: {
          customer_id: customer.id,
          order_date: new Date(row.orderDate),
          item_name: productName,
          item_quantity: qty,
          total_amount: row.totalAmount, // 주문 단가를 넣는다면 별도 처리 필요
        },
      });
    }
  }

  return NextResponse.json({ success: true, inserted: rows.length });
}
