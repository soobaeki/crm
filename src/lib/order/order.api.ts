import {
  Order,
  OrderFormInput,
  OrderItem,
  OrderItemFormInput,
  OrderWithItems,
  TodaysOrdersCustomers,
} from "@/types/order";
import { callApi } from "../core";

/**
 * 주문 조회
 *
 * @returns
 */
export async function getOrders(): Promise<OrderWithItems[]> {
  const res = await callApi<undefined, OrderWithItems[]>("api/order", "GET");

  return res.data!;
}

/**
 * 주문 등록
 *
 * @param orderData 주문 입력 데이터
 * @param itemsData 상품 입력 데이터
 * @returns
 */
export async function postOrder(
  orderData: OrderFormInput,
  itemsData: OrderItemFormInput,
): Promise<{ orderData: Order; itemsData: OrderItem[] }> {
  const res = await callApi<
    { orderData: OrderFormInput; itemsData: OrderItemFormInput },
    { orderData: Order; itemsData: OrderItem[] }
  >("/api/order", "POST", {
    orderData,
    itemsData,
  });

  return res.data!;
}

/**
 * 주문 수정
 *
 * @param orderData 주문 입력 데이터
 * @param itemsData 상품 입력 데이터
 * @returns
 */
export async function updateOrder(
  orderData: OrderFormInput,
  itemsData: OrderItemFormInput,
): Promise<{ orderData: Order; itemsData: OrderItem[] }> {
  const res = await callApi<
    { orderData: OrderFormInput; itemsData: OrderItemFormInput },
    { orderData: Order; itemsData: OrderItem[] }
  >("api/order", "PUT", {
    orderData,
    itemsData,
  });

  return res.data!;
}

/**
 * 주문 삭제
 *
 * @param orderId 주문 번호
 * @returns
 */
export async function deleteOrder(
  orderId: number,
): Promise<{ orderId: number }> {
  const res = await callApi<{ orderId: number }, { orderId: number }>(
    "api/order",
    "DELETE",
    { orderId },
  );

  return res.data!;
}

/**
 * 당일 주문 고객 조회
 *
 * @returns
 */
export async function getTodaysOrdersCustomers(): Promise<TodaysOrdersCustomers> {
  const res = await callApi<undefined, TodaysOrdersCustomers>(
    "api/order/actions/today",
    "GET",
  );

  return res.data!;
}
