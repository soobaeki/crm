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
import { Column } from "@/types/table";
import ViewTooltip from "./ViewTooltip";

interface IProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  initialPageSize?: number;
  onRowClick?: (row: T) => void; // + 추가: 행 클릭 이벤트 핸들러
}

export default function ViewTable<T extends object>({
  columns,
  data,
  isLoading,
  initialPageSize = 10,
  onRowClick,
}: IProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const tableColumns = useMemo<ColumnDef<T>[]>(
    () =>
      columns
        .filter((col) => !col.hide)
        .map((col) => ({
          accessorKey: col.key as string,
          header: col.label,
          enableSorting: col.sortable !== false,
          cell: (info) => {
            const row = info.row.original;
            if (col.render) return col.render(row);
            const value = info.getValue();
            if (value === undefined || value === null) return "-";
            if (typeof value === "number") return value.toLocaleString();
            return String(value);
          },
          meta: { align: col.align ?? "center", width: col.width ?? "auto" },
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
  const totalCount = data.length || 0;

  const sizeOptions = useMemo(
    () =>
      Array.from(new Set([initialPageSize, 10, 20, 30, 50])).sort(
        (a, b) => a - b,
      ),
    [initialPageSize],
  );

  return (
    <div className="flex w-full flex-col overflow-hidden">
      <div className="min-w-0 flex-1 overflow-x-auto">
        {/* table-fixed가 있어야 너비 고정이 먹힙니다 */}
        <table className="w-full table-fixed border-separate border-spacing-0">
          <colgroup>
            {table.getVisibleFlatColumns().map((column) => {
              const meta = column.columnDef.meta as { width?: string };
              return (
                <col key={column.id} style={{ width: meta?.width || "auto" }} />
              );
            })}
          </colgroup>
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as {
                    width?: string;
                  };
                  const isCustomerName = header.column.id === "customerName";

                  return (
                    <th
                      key={header.id}
                      style={{
                        // width가 "auto"라면 "100%"를 주어 남은 공간을 다 먹게 합니다.
                        width: meta?.width === "auto" ? "100%" : meta?.width,
                        // [핵심] "auto"일 때는 maxWidth를 해제해야 꽉 찹니다.
                        // 고정 너비(px)일 때만 말줄임을 위해 maxWidth를 제한합니다.
                        maxWidth: meta?.width === "auto" ? "none" : meta?.width,
                      }}
                      className={`table-header-cell ${isCustomerName ? "bg-table-header-bg border-border sticky left-0 z-20 border-r" : ""}`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getCanSort() && (
                          <span className="text-table-header-text">
                            {{
                              asc: (
                                <ChevronUpIcon className="text-primary h-4 w-4" />
                              ),
                              desc: (
                                <ChevronDownIcon className="text-primary h-4 w-4" />
                              ),
                            }[header.column.getIsSorted() as string] ?? (
                              <ChevronUpDownIcon className="h-4 w-4 opacity-30" />
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

          <tbody className="divide-y">
            {isLoading ? (
              <LoadingSkeleton colSpan={columns.length} />
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="table-body-row"
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as {
                      align?: "left" | "center" | "right";
                      width?: string;
                    };
                    const isCustomerName = cell.column.id === "customerName";

                    return (
                      <td
                        key={cell.id}
                        style={{
                          // 1. th와 똑같이 "남는 공간 다 내꺼" 선언
                          width: meta?.width === "auto" ? "100%" : meta?.width,
                          // 2. auto일 때는 한계를 두지 말아야 꽉 찹니다.
                          // 반대로 px 값이 있을 때는 그 너비만큼만 딱 고정해야 말줄임이 예쁘게 먹힙니다.
                          maxWidth:
                            meta?.width === "auto" ? "none" : meta?.width,
                          overflow: "hidden", // 넘치는 내용 숨김
                          textOverflow: "ellipsis", // [핵심] 말줄임표 활성화
                          whiteSpace: "nowrap", // [핵심] 줄바꿈 방지
                        }}
                        className={`table-body-cell overflow-hidden ${
                          isCustomerName
                            ? "bg-background border-border hover:bg-table-hover sticky left-0 z-10 border-r"
                            : ""
                        } ${
                          meta.align === "center"
                            ? "text-center"
                            : meta.align === "right"
                              ? "text-right"
                              : "text-left"
                        }`}
                      >
                        <ViewTooltip content={String(cell.getValue() ?? "-")}>
                          {/* [핵심 2] w-full, truncate, block을 사용하여 말줄임 강제 적용 */}
                          <div className="block w-full cursor-pointer truncate">
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

      {/* 페이지네이션 (코드 동일) */}
      {!isLoading && totalCount > 0 && (
        <div className="border-border bg-background flex flex-col gap-3 border-t pt-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="text-foreground/60 text-sm">
            전체 <span className="text-foreground font-bold">{totalCount}</span>{" "}
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
                            `relative cursor-pointer py-2 pr-4 pl-10 transition-colors select-none ${active ? "bg-muted text-primary" : "text-foreground"} ${selected ? "font-bold" : "font-normal"}`
                          }
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={`block truncate ${selected ? "text-primary" : ""}`}
                              >
                                {size}개씩
                              </span>
                              {selected && (
                                <span className="text-primary absolute inset-y-0 left-0 flex items-center pl-3">
                                  <CheckIcon
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                  />
                                </span>
                              )}
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
      className="hover:bg-muted text-foreground/60 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-transform active:scale-90 disabled:cursor-not-allowed disabled:opacity-20"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
