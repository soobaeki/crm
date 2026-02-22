"use client";

//////////////////////
// import
//////////////////////
import { ChangeEvent, KeyboardEvent } from "react";
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";

//////////////////////
// types / interfaces
//////////////////////
interface IFilterValues {
  startDate?: string;
  endDate?: string;
  searchText?: string;
}

interface IProps {
  // 1. 설정 및 라벨 (라벨이 있으면 해당 섹션이 활성화됨)
  dateLabel?: string; // 예: "가입일자" (전달 안 하면 기간검색 숨김)
  searchLabel?: string; // 예: "고객검색" (전달 안 하면 조건검색 숨김)
  searchPlaceholder?: string;

  // 2. 데이터 및 핸들러
  filters: IFilterValues;
  onChange: (filters: IFilterValues) => void;
  onSearch: () => void;

  // 3. 등록 버튼 (onRegister가 있으면 버튼이 나타남)
  onRegister?: () => void; // 함수가 있으면 등록 버튼이 나타납니다.
  registerLabel?: string; // 버튼 이름 (기본값: 등록)
}

//////////////////////
// component start
//////////////////////
export default function ViewSearchFilter({
  dateLabel,
  searchLabel,
  searchPlaceholder = "검색어를 입력하세요",
  filters,
  onChange,
  onSearch,
  onRegister,
  registerLabel = "등록",
}: IProps) {
  //////////////////////
  // handlers
  //////////////////////
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value });
  };

  // 엔터키 검색 지원
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSearch();
  };

  //////////////////////
  // render (JSX)
  //////////////////////
  return (
    // prettier-ignore
    <section className={`
      min-w-0                 /* 내부 요소 overflow 방지 */

      flex flex-col           /* 모바일 기본: 세로 정렬 */
      gap-4                   /* 섹션 내부 요소 간 기본 간격 */

      rounded-2xl             /* 카드 UI 형태 */
      border border-border    /* design token 기반 */
      bg-background           /* white 직접 쓰지 않음 */
      p-5                     /* 내부 여백 */
      shadow-sm               /* 카드 느낌 */
      transition-all          /* 상태 변화 대비 */

      md:flex-row             /* 데스크탑: 가로 정렬 */
      md:items-end            /* 필터와 버튼 하단 정렬 */
      md:justify-between      /* 좌우 분리 배치 */
  `}>
      <div className={`
        min-w-0                /* overflow 방지 */

        flex flex-col          /* 모바일 기본: 세로 정렬 */
        gap-4                  /* 모바일 기본 간격 */

        md:flex-row            /* 데스크탑에서 가로 정렬 */
        md:items-center        /* 데스크탑에서 수직 중앙 정렬 */
        md:gap-8               /* 데스크탑에서 간격 확대 */
      `}>
        {/* 1. 기간 검색 섹션 (dateLabel이 있을 때만) */}
        {dateLabel && (
          <div className="form-field">
            <label className="form-label">{dateLabel}</label>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <input
                name="startDate"
                type="date"
                value={filters.startDate || ""}
                onChange={handleInputChange}
                className="form-input w-full md:w-40"
              />
              <span className="text-foreground/50 hidden md:inline">~</span>
              <input
                name="endDate"
                type="date"
                value={filters.endDate || ""}
                onChange={handleInputChange}
                className="form-input w-full md:w-40"
              />
            </div>
          </div>
        )}

        {/* 2. 조건 검색 섹션 (searchLabel이 있을 때만) */}
        {searchLabel && (
          <div className="form-field">
            <label className="form-label">{searchLabel}</label>
            <div className="relative">
              <MagnifyingGlassIcon className="text-foreground/40 pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                name="searchText"
                type="text"
                placeholder={searchPlaceholder}
                value={filters.searchText || ""}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="form-input w-full pl-10 md:w-64"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. 버튼 영역 */}
      <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
        <button onClick={onSearch} className="btn-base btn-primary">
          조회
        </button>

        {onRegister && (
          <button onClick={onRegister} className="btn-base btn-outline">
            <PlusIcon className="h-4 w-4" />
            <span>{registerLabel}</span>
          </button>
        )}
      </div>
    </section>
  );
}
