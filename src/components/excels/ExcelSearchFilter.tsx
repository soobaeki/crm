"use client";

import React, { ChangeEvent } from "react";
import { RowData } from "@/types/excel";
import { IExcelSearchFilter } from "@/types/filter";

interface Props {
  filters: IExcelSearchFilter;
  onChange: (filters: IExcelSearchFilter) => void;
  onSearch: () => void;
  handleUpload: () => void;
  handleDownload: () => void;
  uploading: boolean;
  data: RowData[];
}

export default function ExcelSearchFilter({
  filters,
  onChange,
  onSearch,
  handleUpload,
  handleDownload,
  uploading,
  data,
}: Props) {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value });
  };

  return (
    <section className="mb-4 flex flex-col gap-2 rounded-lg border p-4 md:flex-row md:items-center md:gap-3">
      {/* 기간 검색 */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <label className="min-w-[70px] text-sm">기간검색</label>
        <div className="flex min-w-0 flex-1 gap-2">
          <input
            className="max-w-full min-w-[120px] flex-1 rounded border px-2 py-1 text-sm"
            name="startDate"
            type="date"
            value={filters.startDate}
            onChange={handleInputChange}
          />
          <span className="self-center whitespace-nowrap">~</span>
          <input
            className="max-w-full min-w-[120px] flex-1 rounded border px-2 py-1 text-sm"
            name="endDate"
            type="date"
            value={filters.endDate}
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* 조건검색 */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <label className="min-w-[70px] text-sm">조건검색</label>
        <input
          className="w-full rounded border px-2 py-1 text-sm md:w-auto"
          name="searchText"
          placeholder="검색어를 입력해주세요"
          type="text"
          value={filters.searchText}
          onChange={handleInputChange}
        />
      </div>

      {/* 조회 버튼 */}
      <div className="flex justify-end md:ml-auto">
        <button
          className="cursor-pointer rounded bg-blue-600 px-4 py-1 text-sm text-white"
          onClick={onSearch}
        >
          조회
        </button>

        {/* 업로드 버튼 */}
        <button
          onClick={handleUpload}
          className="rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
        >
          {uploading ? "업로드 중..." : "업로드"}
        </button>

        {/* 다운로드 버튼 */}
        <button
          onClick={handleDownload}
          disabled={data.length === 0}
          className="rounded bg-green-500 px-4 py-2 text-white disabled:opacity-50"
        >
          다운로드
        </button>
      </div>
    </section>
  );
}
