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
import { getCustomers } from "@/lib/customer/customer.api";
import CustomerModal from "../../components/customers/CustomerModel";

//////////////////////
// component start
//////////////////////
export default function Page() {
  //////////////////////
  // state & query
  //////////////////////
  const [filters, setFilters] = useState({
    startDate: "",
    // startDate: dayjs().format("YYYY-MM-DD"),
    endDate: "",
    searchText: "",
  });

  // 모달 제어를 위한 상태
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: customers = [], refetch } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: () => getCustomers(filters.startDate, filters.endDate),
    enabled: false,
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
    },
    [filters, refetch],
  );

  // 조회 버튼 클릭 시 실행될 함수
  const handleSearch = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const customerColumns = [
    { key: "id", label: "순번", width: "70px" },
    { key: "customerName", label: "고객명", width: "70px" },
    { key: "nickName", label: "닉네임", width: "70px" },
    {
      key: "homePhone",
      label: "집전화",
      align: "center" as const,
      width: "100px",
    },
    {
      key: "mobilePhone",
      label: "휴대전화",
      align: "center" as const,
      width: "110px",
    },
    { key: "address", label: "주소", width: "200px" },
    { key: "createdAt", label: "생성일시" },
  ] satisfies Column<Customer>[];

  //////////////////////
  // render (JSX)
  //////////////////////
  return (
    <ViewContainer>
      {/* 제목 */}
      <ViewTitle>가입고객리스트</ViewTitle>

      {/* 본문 */}
      <ViewBody>
        <ViewCol>
          <ViewSearchFilter
            dateLabel="조회기간"
            searchLabel="검색"
            filters={filters}
            onChange={handleSearchFilter}
            onSearch={handleSearch}
            onRegister={() => setIsModalOpen(true)}
            registerLabel="고객 추가"
          />
          <ViewCard className="hover:border-border! transition-none! hover:translate-y-0! hover:shadow-none! active:scale-100!">
            <ViewTable
              columns={customerColumns}
              data={filteredCustomers}
              initialPageSize={14}
            />
          </ViewCard>
        </ViewCol>
      </ViewBody>

      {/* 모달은 selectedCustomer 존재 여부로 열림/닫힘 결정 */}
      <CustomerModal
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </ViewContainer>
  );
}
