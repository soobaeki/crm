"use client";

import { Fragment, useMemo, useState } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import {
  CheckIcon,
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
import ViewTooltip from "./ViewTooltip";

interface Column {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  width?: string;
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
        meta: { align: col.align || "center", width: col.width || "auto" },
      })),
    [columns],
  );

  const table = useReactTable({
    data,
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

  // 옵션 배열을 변수로 만들어서 initialPageSize가 목록에 없으면 추가해주는 방식
  const sizeOptions = useMemo(
    () =>
      Array.from(new Set([initialPageSize, 10, 20, 30, 50])).sort(
        (a, b) => a - b,
      ),
    [initialPageSize],
  );

  return (
    <div className="bg-background animate-fadeIn flex h-full w-full flex-col overflow-hidden">
      {/* 1. 테이블 섹션 */}
      <div className="flex-1 overflow-x-auto">
        <div className="inline-block h-full min-w-full align-middle">
          <table className="min-w-full table-fixed border-separate border-spacing-0">
            <thead className="border-border bg-muted/50 sticky top-0 z-10 border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const width = (header.column.columnDef.meta as any)?.width;
                    return (
                      <th
                        key={header.id}
                        style={{ width }}
                        className={`cursor-pointer px-4 py-3 text-center text-[13px] font-semibold whitespace-nowrap text-gray-500 transition-colors`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {/* 정렬 아이콘 */}
                          {header.column.getCanSort() && (
                            <span className="text-gray-400">
                              {{
                                asc: (
                                  <ChevronUpIcon className="text-primary h-4 w-4" />
                                ),
                                desc: (
                                  <ChevronDownIcon className="text-primary h-4 w-4" />
                                ),
                              }[header.column.getIsSorted() as string] ?? (
                                <ChevronUpDownIcon className="h-4 w-4 opacity-30 transition-opacity group-hover:opacity-100" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            {/* 2. 본문 섹션 */}
            <tbody className="divide-border divide-y">
              {isLoading ? (
                <LoadingSkeleton colSpan={columns.length} />
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta as any;
                      return (
                        <td
                          key={cell.id}
                          style={{
                            // 1. 전달받은 width를 그대로 적용 (px 혹은 auto)
                            width: meta.width,
                            // 2. auto일 때 무한정 늘어나는 것을 방지하기 위한 안전장치
                            maxWidth:
                              meta.width === "auto" ? "250px" : meta.width,
                          }}
                          className={`group relative px-5 py-5 text-gray-700 ${
                            meta.align === "center"
                              ? "text-center"
                              : meta.align === "right"
                                ? "text-right"
                                : "text-left"
                          }`}
                        >
                          <ViewTooltip content={String(cell.getValue() ?? "-")}>
                            <div className="cursor-pointer truncate transition-colors">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </div>
                          </ViewTooltip>
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <EmptyState colSpan={columns.length} />
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. 페이지네이션 섹션 */}
      {!isLoading && totalCount > 0 && (
        <div className="border-border bg-background flex items-center justify-between border-t pt-4 shadow-sm">
          <div className="text-foreground/60 text-sm">
            전체 <span className="text-foreground font-bold">{totalCount}</span>
            개 항목
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-1">
              <PaginationBtn
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronDoubleLeftIcon className="h-4 w-4" />
              </PaginationBtn>

              <PaginationBtn
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </PaginationBtn>

              <div className="flex items-center px-4 text-sm font-medium">
                <span className="text-primary font-bold">{pageIndex + 1}</span>
                <span className="text-foreground/20 mx-1.5">/</span>
                <span className="text-foreground/60">
                  {table.getPageCount()}
                </span>
              </div>

              <PaginationBtn
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </PaginationBtn>
              <PaginationBtn
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronDoubleRightIcon className="h-4 w-4" />
              </PaginationBtn>
            </div>
            {/* 개선된 Listbox 기반의 페이지 사이즈 선택기 */}
            <div className="w-32">
              <Listbox
                value={pageSize}
                onChange={(val) => table.setPageSize(val)}
              >
                <div className="relative mt-1">
                  <ListboxButton className="border-border relative w-full cursor-pointer rounded-md border bg-transparent py-1.5 pl-3 text-left text-sm font-medium transition-all outline-none">
                    <span className="block truncate">{pageSize}개씩</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronDownIcon
                        className="text-foreground/40 h-4 w-4"
                        aria-hidden="true"
                      />
                    </span>
                  </ListboxButton>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <ListboxOptions className="bg-background border-border absolute bottom-full mb-2 max-h-60 w-full overflow-auto rounded-md border py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none">
                      {sizeOptions.map((size) => (
                        <ListboxOption
                          key={size}
                          value={size}
                          className={({ active, selected }) =>
                            `relative cursor-pointer py-2 pr-4 pl-10 transition-colors select-none ${
                              active
                                ? "bg-muted text-primary"
                                : "text-foreground"
                            } ${selected ? "font-bold" : "font-normal"}`
                          }
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={`block truncate ${selected ? "text-primary" : ""}`}
                              >
                                {size}개씩
                              </span>
                              {selected ? (
                                <span className="text-primary absolute inset-y-0 left-0 flex items-center pl-3">
                                  <CheckIcon
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                  />
                                </span>
                              ) : null}
                            </>
                          )}
                        </ListboxOption>
                      ))}
                    </ListboxOptions>
                  </Transition>
                </div>
              </Listbox>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 가독성을 위한 서브 컴포넌트
function LoadingSkeleton({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-24 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="border-muted border-t-primary h-8 w-8 animate-spin rounded-full border-2" />
          <p className="text-foreground/40 animate-pulse text-sm">
            데이터를 불러오는 중입니다...
          </p>
        </div>
      </td>
    </tr>
  );
}

function EmptyState({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="text-foreground/40 py-24 text-center text-sm"
      >
        검색 결과가 없습니다.
      </td>
    </tr>
  );
}

// 내부용 페이지네이션 버튼 컴포넌트 (중복 제거)
function PaginationBtn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      className="hover:bg-muted text-foreground/60 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-all active:scale-90 disabled:cursor-not-allowed disabled:opacity-20"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
