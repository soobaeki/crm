"use client";

//////////////////////
// import
//////////////////////
import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Customer } from "@/types/customer";
import { Column } from "@/types/table";
import ViewBody from "@/components/commons/ViewBody";
import ViewCard from "@/components/commons/ViewCard";
import ViewCol from "@/components/commons/ViewCol";
import { default as ViewContainer } from "@/components/commons/ViewContainer";
import ViewSearchFilter from "@/components/commons/ViewSearchFilter";
import ViewTable from "@/components/commons/ViewTable";
import ViewTitle from "@/components/commons/ViewTitle";
import CustomerModal from "@/components/customers/CustomerModel";
import { getCustomers } from "@/lib/customer/customer.api";

const customerColumns = [
  { key: "index", label: "순번", width: "70px" },
  { key: "id", label: "순번", width: "70px", hide: true },
  { key: "customerName", label: "고객명", width: "100px" },
  { key: "nickName", label: "닉네임", width: "100px" },
  {
    key: "homePhone",
    label: "집전화",
    width: "200px",
  },
  {
    key: "mobilePhone",
    label: "휴대전화",
    width: "200px",
  },
  { key: "address", label: "주소", align: "left" as const },
  { key: "createdAt", label: "생성일시", width: "120px" },
] satisfies Column<Customer>[];

export default function Page() {
  /* -------------------------------------------------------------------------- */
  /* 1. State & Queries                                                         */
  /* -------------------------------------------------------------------------- */
  const [filters, setFilters] = useState({
    startDate: "",
    // startDate: dayjs().format("YYYY-MM-DD"),
    endDate: "",
    searchText: "",
  });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  // 고객 리스트 조회 (enabled: false로 초기 로딩 제어 가능)
  const {
    data: customers = [],
    refetch,
    isFetching,
  } = useQuery<Customer[]>({
    queryKey: ["customers", filters.startDate, filters.endDate],
    queryFn: () => getCustomers(filters.startDate, filters.endDate),
    enabled: false,
  });

  /* -------------------------------------------------------------------------- */
  /* 2. Memoized Data (Search)                                                  */
  /* -------------------------------------------------------------------------- */
  const filteredCustomers = useMemo(() => {
    const term = filters.searchText?.replace(/\s/g, "").toLowerCase();
    if (!term) return customers;

    return customers.filter((c) =>
      [c.customerName, c.nickName, c.mobilePhone, c.homePhone, c.address].some(
        (field) => field?.toLowerCase().includes(term),
      ),
    );
  }, [customers, filters.searchText]);

  /* -------------------------------------------------------------------------- */
  /* 3. Event Handlers (Business Logic)                                         */
  /* -------------------------------------------------------------------------- */
  const handleUpdateFilters = useCallback(
    (newFilters: Partial<typeof filters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    },
    [],
  );

  const handleSearch = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleOpenDetail = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedCustomer(null);
  }, []);

  /* -------------------------------------------------------------------------- */
  /* 5. Render                                                                  */
  /* -------------------------------------------------------------------------- */
  return (
    <ViewContainer>
      {/* 제목 */}
      <ViewTitle>가입고객리스트</ViewTitle>

      {/* 본문 */}
      <ViewBody>
        <ViewCol>
          {/* 상단 필터 영역 */}
          <ViewSearchFilter
            dateLabel="조회기간"
            searchLabel="검색"
            filters={filters}
            onChange={handleUpdateFilters}
            onSearch={handleSearch}
            onRegister={() => alert("등록 기능 개발 예정")}
            registerLabel="고객 추가"
          />

          {/* 테이블 카드 영역 */}
          <ViewCard className="hover:border-border! transition-none! hover:translate-y-0! hover:shadow-none! active:scale-100!">
            <ViewTable
              columns={customerColumns}
              data={filteredCustomers}
              initialPageSize={10}
              onRowClick={handleOpenDetail}
            />
          </ViewCard>
        </ViewCol>
      </ViewBody>

      {/* 모달 영역 */}
      {selectedCustomer && (
        <CustomerModal
          customer={selectedCustomer}
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onRefresh={refetch}
        />
      )}
    </ViewContainer>
  );
}
