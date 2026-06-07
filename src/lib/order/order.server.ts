import { cookies } from "next/headers";
import * as jose from "jose";
import { OrderFormInput, OrderItemFormInput } from "@/types/order";
import { safeDecryptGCM } from "@/utils/crypto";
import { maskAddress, maskCreateAt, maskName } from "@/utils/masking";
import { encryptGCM } from "../crypto/crypto";
import { prisma } from "../prisma";

const OrderStatus = {
  PENDING: "PENDING",
};

// GET 메서드: 주문 상품 조회
export async function getOrderWithItems(orderId?: number) {
  if (orderId) {
    return await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        order_items: true, // 연관된 order_items까지 같이 가져오기
      },
    });
  } else {
    return await prisma.orders.findMany({
      include: {
        order_items: true,
      },
    });
  }
}

// POST 메서드: 주문 상품 등록
export async function postOrderWithItems(
  orderData: OrderFormInput,
  itemsData: OrderItemFormInput[],
) {
  return await prisma.$transaction(async (tx) => {
    // 👑 1. itemsData에 lineTotal이 없으므로, (단가 * 수량)으로 안전하게 총 금액을 계산합니다.
    const totalAmount = itemsData.reduce(
      (sum, item) => sum + item.unitPriceSnapshot * item.quantity,
      0,
    );

    // 2️⃣ 날짜 형식 안전 처리 (프론트에서 string이나 다양한 형태로 올 때를 대비)
    const safeOrderDate = orderData.orderDate
      ? new Date(orderData.orderDate)
      : new Date();

    // 3️⃣ 주문 마스터 생성
    const order = await tx.orders.create({
      data: {
        customer_id: orderData.customerId,
        order_date: safeOrderDate,
        orderer_name: orderData.ordererName,
        total_amount: totalAmount,
        status: orderData.status ?? "PENDING", // 상태값 기본값 처리
      },
    });

    // 4️⃣ 주문 아이템들 생성
    await tx.order_items.createMany({
      data: itemsData.map((item) => {
        // 👑 2. 각 아이템별 line_total도 서버단에서 직접 계산해서 DB 규격에 맞춰 넣어줍니다.
        const currentLineTotal = item.unitPriceSnapshot * item.quantity;

        return {
          order_id: order.id, // TiDB가 방금 채번한 따끈따끈한 주문 고유 ID 주입
          product_id: item.productId,
          product_name_snapshot: item.productNameSnapshot,
          unit_price_snapshot: item.unitPriceSnapshot,
          quantity: item.quantity,
          line_total: currentLineTotal, // 💡 직접 계산한 값 주입!
          discount: item.discount ?? 0,
          tax: item.tax ?? 0,
        };
      }),
    });

    return order;
  });
}

// PUT 메서드: 주문 상품 수정
export async function updateOrderWithItems(
  orderId: number,
  orderData: OrderFormInput,
  itemsData: OrderItemFormInput[],
) {
  return await prisma.$transaction(async (tx) => {
    // 1. 기존 아이템 조회
    const existingItems = await tx.order_items.findMany({
      where: { order_id: orderId },
    });

    // 2. 주문 마스터 업데이트 (먼저 실행하여 레코드 존재 확인)
    const order = await tx.orders.update({
      where: { id: orderId },
      data: {
        customer_id: orderData.customerId,
        order_date: orderData.orderDate
          ? new Date(orderData.orderDate)
          : undefined,
        orderer_name: encryptGCM(orderData.ordererName || ""),
        status: orderData.status,
      },
    });

    // 3. 아이템 업데이트 (id 유지 전략: 기존 id가 있으면 update, 없으면 create)
    for (const item of itemsData) {
      const existing = existingItems.find(
        (i) => i.product_id === item.productId,
      );

      if (existing) {
        await tx.order_items.update({
          where: { id: existing.id }, // 기존 ID 유지
          data: {
            product_name_snapshot: item.productNameSnapshot,
            unit_price_snapshot: item.unitPriceSnapshot,
            quantity: item.quantity,
            line_total: item.unitPriceSnapshot * item.quantity,
          },
        });
      } else {
        await tx.order_items.create({
          data: {
            order_id: orderId,
            product_id: item.productId,
            product_name_snapshot: item.productNameSnapshot,
            unit_price_snapshot: item.unitPriceSnapshot,
            quantity: item.quantity,
            line_total: item.unitPriceSnapshot * item.quantity,
          },
        });
      }
    }

    // 4. 전체 총액 재계산 및 업데이트
    const updatedItems = await tx.order_items.findMany({
      where: { order_id: orderId },
    });
    const totalAmount = updatedItems.reduce(
      (sum, item) => sum + item.line_total,
      0,
    );

    await tx.orders.update({
      where: { id: orderId },
      data: { total_amount: totalAmount },
    });

    return { order, items: updatedItems };
  });
}

// DELETE 메서드: 주문 상품 삭제
export async function deleteOrderWithItems(orderId: number) {
  return await prisma.$transaction(async (tx) => {
    // order_items 먼저 삭제 (FK: CASCADE도 가능하지만 명시적으로 처리)
    await tx.order_items.deleteMany({
      where: { order_id: orderId },
    });

    // orders 삭제
    const deletedOrder = await tx.orders.delete({
      where: { id: orderId },
    });

    return deletedOrder;
  });
}

// GET: 오늘 주문한 고객
export async function getTodaysOrdersCustomers() {
  const now = new Date();

  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  );
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );

  const orders = await prisma.orders.findMany({
    where: {
      order_date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      customer: true,
      order_items: {
        select: {
          product_name_snapshot: true,
          unit_price_snapshot: true,
          quantity: true,
          line_total: true,
        },
      },
    },
  });

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let userRole = "guest";

  if (token) {
    try {
      const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, secretKey);

      if (payload && typeof payload.role === "string") {
        userRole = payload.role;
      }
    } catch (error) {
      console.log("만로되었거나 유효하지 않은 JWT 토큰입니다.");
    }
  }

  // =================================================================
  // 👑 [핵심 수정] 복호화(decryptGCM) 후 마스킹 처리 진행
  // =================================================================
  const result = orders.flatMap((order) => {
    let plainName = "알 수 없음";
    let plainAddress = "";

    try {
      // 🔓 DB에서 꺼내온 암호화된 고객 정보 복호화
      plainName = order.customer.customer_name
        ? (safeDecryptGCM(order.customer.customer_name) as string)
        : "이름 없음";
      plainAddress = order.customer.address
        ? (safeDecryptGCM(order.customer.address) as string)
        : "";
    } catch (cryptoError) {
      console.error("오늘 주문 고객 데이터 복호화 중 실패:", cryptoError);
    }

    return order.order_items.map((item) => ({
      // 🧼 이제 깨끗하게 복호화된 평문(plain) 데이터를 마스킹 엔진에 태웁니다!
      customerName: maskName(plainName, userRole),
      address: maskAddress(plainAddress, userRole),
      orderDate: maskCreateAt(
        order.order_date?.toLocaleDateString("ko-KR") || "",
        userRole,
      ),
      productName: item.product_name_snapshot,
      quantity: item.quantity,
      totalPrice: item.quantity * item.unit_price_snapshot,
    }));
  });

  return result;
}
