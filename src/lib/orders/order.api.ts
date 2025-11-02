import {
  Order,
  OrderFormInput,
  OrderItem,
  OrderItemFormInput,
  OrderWithItems,
} from "@/types/order";
import { callApi } from "../core";

export async function getOrders(): Promise<OrderWithItems[]> {
  const res = await callApi("api/order", "GET");

  if (!res.ok) throw new Error("주문 목록 조회 실패");
  return res.json();
}

export async function postOrder(
  orderData: OrderFormInput,
  itemsData: OrderItemFormInput,
): Promise<{ orderData: Order; itemsData: OrderItem[] }> {
  const res = await callApi("/api/order", "POST", {
    body: JSON.stringify({ orderData, itemsData }),
  });

  if (!res.ok) throw new Error("주문 등록 실패");
  return res.json();
}

export async function updateOrder(
  orderData: OrderFormInput,
  itemsData: OrderItemFormInput,
): Promise<{ orderData: Order; itemsData: OrderItem[] }> {
  const res = await callApi("api/order", "PUT", {
    body: JSON.stringify({ orderData, itemsData }),
  });

  if (!res.ok) throw new Error("주문 수정 실패");
  return res.json();
}

export async function deleteOrder(orderId: number) {
  const res = await callApi("api/order", "DELETE", orderId);

  if (!res.ok) throw new Error("주문 삭제 실패");
  return res.json();
}

export async function getTodaysOrdersCustomers() {
  const res = await callApi("api/order/actions/today", "GET");

  if (!res.ok) throw new Error("오늘자 주문고객 조회 실패");
  return res.json();
}
