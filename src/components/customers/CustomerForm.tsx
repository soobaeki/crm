"use client";

import { useState } from "react";
import SearchFilter from "../commons/SearchFilter";

interface ILocalFilters {
  startDate: string;
  endDate: string;
  searchText: string;
}

interface IProps {
  onChangeFilter: (filter: ILocalFilters) => void;
}

export default function CustomerForm({ onChangeFilter }: IProps) {
  const [localFilters, setLocalFilters] = useState<ILocalFilters>({
    startDate: "",
    endDate: "",
    searchText: "",
  });

  return (
    <SearchFilter
      filters={localFilters}
      onChange={setLocalFilters}
      onSearch={() => onChangeFilter(localFilters)}
    />
  );
}
