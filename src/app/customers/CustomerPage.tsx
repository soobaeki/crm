"use client";

import React, { useState } from "react";
import { Customer } from "@/types/customer";
import CustomerModal from "./CustomerModel";
import CustomersClient from "./CustomersClient";
import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "@/lib/customers/customer.api";

export default function CustomerPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [filters, setFilters] = useState({
    startDate: "",
    // startDate: dayjs().format("YYYY-MM-DD"),
    endDate: "",
    searchText: "",
  });

  const { data: customers = [], refetch } = useQuery<Customer[]>({
    queryKey: ["customers", filters.startDate, filters.endDate],
    queryFn: () => getCustomers(filters.startDate, filters.endDate),
  });

  // 클라이언트 필터링
  const filteredCustomers = customers.filter((c) => {
    const searchText = filters.searchText?.replace(/\s/g, "").toLowerCase();
    if (!searchText) return true; // 검색어 없으면 모두 통과

    return [
      c.customerName,
      c.nickName,
      c.mobilePhone,
      c.homePhone,
      c.address,
    ].some((field) => field?.toLowerCase().includes(searchText));
  });

  // 페이지에서 필터 변경 시
  const handleFilterChange = async (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters };

    setFilters(updatedFilters);

    // 기간 필터가 바뀌면 서버에서 새로 조회
    if (
      newFilters.startDate !== undefined ||
      newFilters.endDate !== undefined
    ) {
      await refetch();
    }
  };

  return (
    <div className="flex w-full flex-col overflow-auto px-4 py-4 sm:px-6 lg:px-8">
      <h2 className="px-4 text-xl font-bold">가입고객리스트</h2>
      <CustomersClient
        customers={filteredCustomers}
        filters={filters} // 현재 필터 상태 전달
        onChangeFilter={handleFilterChange} // 필터 변경 콜백
        onSelectCustomer={setSelectedCustomer}
      />
      {selectedCustomer && (
        <CustomerModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}
