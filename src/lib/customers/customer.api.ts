// [클라이언트 화면] <--> [lib/customer/api.client.ts (fetch 함수)] <--> [app/api/customer/route.ts (API 핸들러)] <--> [lib/customer/customer.server.ts (DB 함수)]
import { callApi } from "@/lib/core";
import { Customer, CustomerFormInput } from "@/types/customer";

export async function getCustomers(
  startDate?: string,
  endDate?: string,
): Promise<Customer[]> {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const url = `/api/customer?${params.toString()}`;
  const res = await callApi(url, "GET");

  if (!res.ok) throw new Error("고객 목록 조회 실패");
  return res.json();
}

export async function postCustomer(data: CustomerFormInput): Promise<Customer> {
  const res = await callApi("/api/customer", "POST", data);

  if (!res.ok) {
    throw new Error("고객 등록 실패");
  }
  return res.json(); // 생성된 고객 데이터 반환
}
