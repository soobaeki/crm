"use client";

import { useState } from "react";
import SearchFilter from "../commons/SearchFilter";

interface IProps {
  onSearchFilter: (filter: {
    startDate: string;
    endDate: string;
    searchText: string;
  }) => void;
  onOpenModal: () => void;
}

export default function ProductForm({ onSearchFilter, onOpenModal }: IProps) {
  const [changeFilters, setChangeFilters] = useState({
    startDate: "",
    endDate: "",
    searchText: "",
  });

  return (
    <SearchFilter
      type="product"
      filters={changeFilters}
      onChange={setChangeFilters}
      onSearch={() => onSearchFilter(changeFilters)}
      onRegister={onOpenModal}
    />
  );
}
