"use client";

//////////////////////
// import
//////////////////////
import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Customer } from "@/types/customer";
import {
  default as ViewBody,
  default as ViewContainer,
} from "@/components/commons/ViewContainer";
import ViewTitle from "@/components/commons/ViewTitle";
import CustomerForm from "@/components/customers/CustomerForm";
import CustomerList from "@/components/customers/CustomerList";
import { getCustomers } from "@/lib/customer/customer.api";
import CustomerModal from "./CustomerModel";

//////////////////////
// component start
//////////////////////
export default function CustomerPage() {
  //////////////////////
  // state & router & query
  //////////////////////
  const [filters, setFilters] = useState({
    startDate: "",
    // startDate: dayjs().format("YYYY-MM-DD"),
    endDate: "",
    searchText: "",
  });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const { data: customers = [], refetch } = useQuery<Customer[]>({
    queryKey: ["customers", filters.startDate, filters.endDate],
    queryFn: () => getCustomers(filters.startDate, filters.endDate),
  });

  //////////////////////
  // derived data (useMemo)
  //////////////////////
  const filteredCustomers = useMemo(() => {
    const searchText = filters.searchText?.replace(/\s/g, "").toLowerCase();
    if (!searchText) return customers;

    return customers.filter((c) =>
      [c.customerName, c.nickName, c.mobilePhone, c.homePhone, c.address].some(
        (field) => field?.toLowerCase().includes(searchText),
      ),
    );
  }, [customers, filters.searchText]);

  //////////////////////
  // handlers (useCallback)
  //////////////////////
  const handleSearchFilter = useCallback(
    async (newFilters: Partial<typeof filters>) => {
      const updatedFilters = { ...filters, ...newFilters };

      setFilters(updatedFilters);

      // 기간 필터가 바뀌면 서버에서 새로 조회
      if (
        newFilters.startDate !== undefined ||
        newFilters.endDate !== undefined
      ) {
        await refetch();
      }
    },
    [filters, refetch],
  );

  //////////////////////
  // render (JSX)
  //////////////////////
  return (
    <ViewContainer>
      {/* 제목 */}
      <ViewTitle>가입고객리스트</ViewTitle>

      {/* 본문 */}
      <ViewBody>
        <CustomerForm onSearchFilter={handleSearchFilter} />
        <CustomerList
          customers={filteredCustomers}
          onSelectCustomer={setSelectedCustomer}
        />
      </ViewBody>

      {/* 모달은 selectedCustomer 존재 여부로 열림/닫힘 결정 */}
      <CustomerModal
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </ViewContainer>
  );
}
