"use client";

//////////////////////
// import
//////////////////////
import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RowData } from "@/types/excel";
import { Column } from "@/types/table";
import ViewBody from "@/components/commons/ViewBody";
import ViewCard from "@/components/commons/ViewCard";
import ViewCol from "@/components/commons/ViewCol";
import { default as ViewContainer } from "@/components/commons/ViewContainer";
import ViewSearchFilter from "@/components/commons/ViewSearchFilter";
import ViewTable from "@/components/commons/ViewTable";
import ViewTitle from "@/components/commons/ViewTitle";
import ExcelActionBar from "@/components/excels/ExcelActionBar";
import {
  convertToRoadAddress,
  getSearchExcelListApi,
  postUploadExcelApi,
} from "@/lib/excel/excel.api";
import { downloadExcel } from "@/utils/excel";

const rowDataColumns = [
  { key: "id", label: "순번", width: "70px" },
  { key: "orderDate", label: "주문일자", width: "120px" },
  { key: "item", label: "품목", width: "100px" },
  { key: "weight", label: "무게", align: "right" as const, width: "70px" },
  { key: "quantity", label: "수량", align: "right" as const, width: "70px" },
  { key: "address", label: "주소", align: "left" as const, width: "500px" },
  { key: "homePhone", label: "집전화", width: "200px" },
  { key: "mobilePhone", label: "휴대전화", width: "200px" },
  { key: "customerName", label: "주문자", width: "100px" },
  {
    key: "paymentAmount",
    label: "입금액",
    align: "right" as const,
    width: "120px",
  },
  {
    key: "paymentDate",
    label: "입금일",
    align: "right" as const,
    width: "120px",
  },
  { key: "payer", label: "입금자", width: "80px" },
  {
    key: "notes",
    label: "특이사항",
    align: "left" as const,
    width: "300px",
  },
] satisfies Column<RowData>[];

export default function page() {
  const [filters, setFilters] = useState({
    startDate: "",
    // startDate: dayjs().format("YYYY-MM-DD"),
    endDate: "",
    searchText: "",
    item: "",
    weight: 0,
  });
  const [_, setIsModalOpen] = useState(false);
  const [data, setData] = useState<RowData[]>([]);

  const queryClient = useQueryClient();

  // useQuery
  const { data: rowData = [], refetch } = useQuery<RowData[]>({
    queryKey: ["excelList", filters],
    queryFn: () => getSearchExcelListApi(filters),
    enabled: false,
  });

  const addressCleanMutation = useMutation({
    mutationFn: async (rows: RowData[]) => convertToRoadAddress(rows),
    onSuccess: (data) => {
      setData(data);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // useMemo
  const filteredRowData = useMemo(() => {
    const searchText = filters.searchText?.trim().toLowerCase();

    const targetData = data.length > 0 ? data : rowData;

    return targetData.filter((row) => {
      // searchText 필터
      if (searchText) {
        const matchesText = Object.values(row)
          .filter(Boolean) // null/undefined 제외
          .some((value) => String(value).toLowerCase().includes(searchText));
        if (!matchesText) return false;
      }

      // item 필터
      if (filters.item && row.item !== filters.item) return false;

      // weight 필터
      if (filters.weight && row.weight !== filters.weight) return false;

      // 통과
      return true;
    });
  }, [rowData, data, filters]);

  // useMutation
  const mutation = useMutation({
    mutationFn: (rows: RowData[]) => postUploadExcelApi(rows),
    onSuccess: () => {
      alert("DB에 성공적으로 저장되었습니다!");
      setData([]);
      queryClient.invalidateQueries({ queryKey: ["excelList"] });
    },
    onError: (error) => {
      console.error(error);
      alert("업로드 중 오류가 발생했습니다.");
    },
  });

  // 조회 조건 필터
  const handleSearchFilter = useCallback(
    async (newFilters: Partial<typeof filters>) => {
      const updatedFilters = { ...filters, ...newFilters };

      setFilters(updatedFilters);
    },
    [filters, refetch],
  );

  // 조회 버튼 클릭 시 실행될 함수
  const handleSearch = useCallback(async () => {
    setData([]);
    await refetch();
  }, [refetch]);

  // 업로드
  const handleUpload = () => {
    if (data.length === 0) return alert("업로드할 데이터가 없습니다.");
    mutation.mutate(data); // mutation 호출
  };

  // 다운로드
  const handleDownload = () => {
    if (data.length === 0) return alert("다운로드할 데이터가 없습니다.");
    downloadExcel(data, rowDataColumns);
  };

  // render (JSX)
  return (
    <ViewContainer>
      {/* 제목 */}
      <ViewTitle>고객 관리</ViewTitle>

      {/* 본문 */}
      <ViewBody>
        <ViewCol>
          <ViewSearchFilter
            dateLabel="조회기간"
            searchLabel="검색"
            filters={filters}
            onChange={handleSearchFilter}
            onSearch={handleSearch}
          />

          {/* 업로드 / 다운로드 */}
          <ExcelActionBar
            data={data}
            uploading={
              mutation.status === "pending" ||
              addressCleanMutation.status === "pending"
            }
            onUpload={handleUpload}
            onDownload={handleDownload}
            onParsed={(rows) => addressCleanMutation.mutate(rows)}
          />

          <ViewCard className="hover:border-border! transition-none! hover:translate-y-0! hover:shadow-none! active:scale-100!">
            <ViewTable columns={rowDataColumns} data={filteredRowData} />
          </ViewCard>
        </ViewCol>
      </ViewBody>
    </ViewContainer>
  );
}
