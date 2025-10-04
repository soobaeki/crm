"use client";

import React, { ChangeEvent } from "react";

interface FilterValues {
  startDate: string;
  endDate: string;
  searchText: string;
}

interface Props {
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
  onSearch: () => void;
}

export default function SearchFilter({ filters, onChange, onSearch }: Props) {
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
      </div>
    </section>
  );
}
