// [클라이언트 화면] <--> [lib/customer/api.ts (fetch 함수)] <--> [app/api/customer/route.ts (API 핸들러)] <--> [lib/customer/customer.server.ts (DB 함수)]
import { Customer, CustomerFormInput } from "@/types/customer";
import { callApi } from "@/lib/core";

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

  if (!res.ok) throw new Error("고객 등록 실패");
  return res.json();
}

export async function getCustomerStats() {
  const res = await callApi("/api/customer/actions/stats", "GET");

  if (!res.ok) throw new Error("고객 수 조회 실패");
  return res.json();
}

export async function getRegionCustomerCounts() {
  const res = await callApi("/api/customer/actions/region-count", "GET");

  if (!res.ok) throw new Error("지역별 고객 수 조회 실패");
  return res.json();
}

export async function getCustomerIssues() {
  const res = await callApi("/api/customer/actions/issue", "GET");

  if (!res.ok) throw new Error("고객 주의사항 조회 실패");
  return res.json();
}
