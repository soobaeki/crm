import { OrderFormInput, OrderItemFormInput } from "@/types/order";
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
    // 총 금액은 itemsData에서 계산
    const totalAmount = itemsData.reduce(
      (sum, item) => sum + item.line_total,
      0,
    );

    const order = await tx.orders.create({
      data: {
        customer_id: orderData.customerId,
        order_date: orderData.orderDate,
        orderer_name: orderData.ordererName,
        total_amount: totalAmount,
        status: orderData.status ?? OrderStatus.PENDING,
      },
    });

    await tx.order_items.createMany({
      data: itemsData.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name_snapshot: item.productNameSnapshot,
        unit_price_snapshot: item.unitPriceSnapshot,
        quantity: item.quantity,
        line_total: item.lineTotal,
        discount: item.discount ?? 0,
        tax: item.tax ?? 0,
      })),
    });
  });
}

// PUT 메서드: 주문 상품 수정
export async function updateOrderWithItems(
  orderId: number,
  orderData: OrderFormInput,
  itemsData: OrderItemFormInput[],
) {
  return await prisma.$transaction(async (tx) => {
    // 주문 총 금액 계산
    const totalAmount = itemsData.reduce(
      (sum, item) => sum + item.lineTotal,
      0,
    );

    // 주문 정보 업데이트
    const order = await tx.orders.update({
      where: { id: orderId },
      data: {
        customer_id: orderData.customerId,
        order_date: orderData.orderDate,
        orderer_name: orderData.ordererName,
        total_amount: totalAmount,
        status: orderData.status,
        updated_at: new Date(),
      },
    });

    // 기존 주문 아이템 삭제
    await tx.order_items.deleteMany({
      where: { order_id: orderId },
    });

    // 새로운 주문 아이템 삽입
    await tx.order_items.createMany({
      data: itemsData.map((item) => ({
        order_id: orderId,
        product_id: item.productId,
        product_name_snapshot: item.productNameSnapshot,
        unit_price_snapshot: item.unitPriceSnapshot,
        quantity: item.quantity,
        line_total: item.lineTotal,
        discount: item.discount ?? 0,
        tax: item.tax ?? 0,
      })),
    });

    return order;
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

  const result = orders.flatMap((order) =>
    order.order_items.map((item) => ({
      customerName: order.customer.customer_name,
      address: order.customer.address,
      orderDate: order.order_date?.toLocaleDateString("ko-KR"),
      productName: item.product_name_snapshot,
      quantity: item.quantity,
      totalPrice: item.quantity * item.unit_price_snapshot,
    })),
  );

  return result;
}
