"use client";

import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "@/lib/customers/customer.api";
import { Customer } from "@/types/customer";

export default function CustomerList() {
  const {
    data: customers,
    error,
    isLoading,
    isFetching,
  } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });

  // 최초 로딩 (데이터 전혀 없음)
  if (isLoading) return <div>불러오는 중...</div>;

  // API 호출 에러
  if (error) return <div>에러 발생: {(error as Error).message}</div>;

  // 데이터 없음
  if (!customers || customers.length === 0) return <div>고객이 없습니다.</div>;

  return (
    <div>
      <h3 className="mb-4 text-xl font-semibold">고객 목록</h3>

      {/* 백그라운드 리패치 상태 */}
      {isFetching && (
        <div className="text-sm text-gray-500">업데이트 중...</div>
      )}

      <ul className="space-y-2">
        {customers.map((c) => (
          <li key={c.id} className="rounded border p-2 shadow-sm">
            <div className="font-medium">{c.customerName}</div>
            <div className="text-sm text-gray-600">{c.mobilePhone}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
