"use client";

//////////////////////
// import
//////////////////////
import { useState } from "react";
import SearchFilter from "../commons/SearchFilter";

//////////////////////
// types / interfaces
//////////////////////
interface IProps {
  onSearchFilter: (filter: {
    startDate: string;
    endDate: string;
    searchText: string;
  }) => void;
  onOpenModal: () => void;
}

//////////////////////
// component start
//////////////////////
export default function ProductForm({ onSearchFilter, onOpenModal }: IProps) {
  //////////////////////
  // data
  //////////////////////
  const [changeFilters, setChangeFilters] = useState({
    startDate: "",
    endDate: "",
    searchText: "",
  });

  //////////////////////
  // render (JSX)
  //////////////////////
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
