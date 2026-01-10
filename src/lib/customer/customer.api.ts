// [클라이언트 화면] <--> [lib/customer/api.ts (fetch 함수)] <--> [app/api/customer/route.ts (API 핸들러)] <--> [lib/customer/customer.server.ts (DB 함수)]
import {
  Customer,
  CustomerFormInput,
  CustomerIssue,
  CustomerStats,
  RegionCustomerCount,
} from "@/types/customer";
import { callApi } from "@/lib/core";
import { toQueryString } from "@/utils/url";

/**
 * 고객 목록 조회
 *
 * @param startDate 조회 시작일(YYYY-MM-DD)
 * @param endDate   조회 종료일(YYYY-MM-DD)
 * @returns
 */
export async function getCustomers(
  startDate?: string,
  endDate?: string,
): Promise<Customer[]> {
  const qs = toQueryString({ startDate, endDate });

  // callApi가 ApiResponse<Customer[]> 반환함
  const res = await callApi<undefined, Customer[]>(
    `/api/customer?${qs}`,
    "GET",
  );

  return res.data!;
}

/**
 * 고객 등록
 *
 * @param input 고객 생성에 필요한 폼 데이터
 * @returns
 */
export async function createCustomer(
  input: CustomerFormInput,
): Promise<Customer> {
  const res = await callApi<CustomerFormInput, Customer>(
    "/api/customer",
    "POST",
    input,
  );

  return res.data!;
}

/**
 * 총 고객 수, 30일 이내 가입자 수 조회
 *
 * @returns
 */
export async function getCustomerStats(): Promise<CustomerStats> {
  const res = await callApi<undefined, CustomerStats>(
    "/api/customer/actions/stats",
    "GET",
  );

  return res.data!;
}

/**
 * 고객 기준, 주소별 고객 수 조회
 *
 * @returns
 */
export async function getRegionCustomerCounts(): Promise<
  RegionCustomerCount[]
> {
  const res = await callApi<undefined, RegionCustomerCount[]>(
    "/api/customer/actions/region-count",
    "GET",
  );

  return res.data!;
}

/**
 * 고객 문의사항 조회
 *
 * @returns
 */
export async function getCustomerIssues(): Promise<CustomerIssue[]> {
  const res = await callApi<undefined, CustomerIssue[]>(
    "/api/customer/actions/issue",
    "GET",
  );

  return res.data!;
}
