"use client";

import { useMemo, useState } from "react";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

/**
 * Column 인터페이스
 * key: 데이터 객체의 키값
 * label: 헤더에 표시될 이름 (무조건 중앙 정렬)
 * align: 데이터(td)의 정렬 방향 (기본값: left)
 */
interface Column {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
}

interface IProps {
  columns: Column[];
  data: any[];
  isLoading?: boolean;
  initialPageSize?: number; // 초기 페이지당 로우 수
}

export default function ViewTable({
  columns,
  data = [],
  isLoading,
  initialPageSize = 10,
}: IProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // 1. TanStack Table용 컬럼 정의
  const tableColumns = useMemo<ColumnDef<any>[]>(
    () =>
      columns.map((col) => ({
        accessorKey: col.key,
        header: col.label,
        enableSorting: col.sortable !== false,
        cell: (info) => {
          const value = info.getValue();
          if (value === undefined || value === null) return "-";
          return typeof value === "number" ? value.toLocaleString() : value;
        },
        meta: { align: col.align || "center" },
      })),
    [columns],
  );

  const table = useReactTable({
    data: data || [],
    columns: tableColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: initialPageSize },
    },
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalCount = data?.length || 0;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white">
      {/* 가로 스크롤 컨테이너 */}
      <div className="flex-1 overflow-x-auto">
        <div className="inline-block h-full min-w-full align-middle">
          <thead className="border-b border-gray-100 bg-gray-50/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-4 py-3 text-center text-[13px] font-semibold whitespace-nowrap text-gray-500`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {/* 정렬 아이콘 */}
                      {header.column.getCanSort() && (
                        <span className="text-gray-400 group-hover:text-indigo-500">
                          {{
                            asc: <ChevronUpIcon className="h-4 w-4" />,
                            desc: <ChevronDownIcon className="h-4 w-4" />,
                          }[header.column.getIsSorted() as string] ?? (
                            <ChevronUpDownIcon className="h-4 w-4 opacity-40" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* 2. 본문 섹션 */}
          <tbody className="divide-y divide-gray-50 bg-white">
            {isLoading ? (
              <tr className="h-full min-h-[250px]">
                <td
                  colSpan={columns.length}
                  className="py-24 text-center align-middle text-base text-gray-400"
                >
                  데이터를 불러오는 중입니다...
                </td>
              </tr>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors hover:bg-gray-50/80"
                >
                  {row.getVisibleCells().map((cell) => {
                    const align = (cell.column.columnDef.meta as any)?.align;
                    return (
                      <td
                        key={cell.id}
                        className={`px-5 py-5 break-keep text-gray-700 ${
                          align === "center"
                            ? "text-center"
                            : align === "right"
                              ? "text-right"
                              : "text-left"
                        }`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr className="h-full min-h-[250px]">
                <td
                  colSpan={columns.length}
                  className="py-24 text-center align-middle text-base text-gray-400"
                >
                  데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </div>
      </div>

      {/* 3. 페이지네이션 (사용자 요청 스타일) */}
      {!isLoading && totalCount > 0 && (
        <div className="flex items-center justify-between border-t border-gray-100 bg-white px-6 py-4">
          <div className="hidden text-sm text-gray-500 sm:block">
            전체 <span className="font-bold text-gray-900">{totalCount}</span>개
            항목
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1">
              <button
                className="rounded-md p-1.5 hover:bg-gray-100 disabled:opacity-20"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronDoubleLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              <button
                className="rounded-md p-1.5 hover:bg-gray-100 disabled:opacity-20"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
              </button>

              <div className="flex items-center px-4 text-sm font-semibold text-gray-700">
                <span className="font-bold text-indigo-600">
                  {pageIndex + 1}
                </span>
                <span className="mx-1 text-gray-300">/</span>
                <span>{table.getPageCount()}</span>
              </div>

              <button
                className="rounded-md p-1.5 hover:bg-gray-100 disabled:opacity-20"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRightIcon className="h-5 w-5 text-gray-600" />
              </button>
              <button
                className="rounded-md p-1.5 hover:bg-gray-100 disabled:opacity-20"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronDoubleRightIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <select
              value={pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="rounded-md border-gray-200 px-1 py-1 text-sm outline-none focus:border-indigo-500 focus:ring-indigo-500"
            >
              {[10, 20, 30, 50].map((size) => (
                <option key={size} value={size}>
                  {size}개씩
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
