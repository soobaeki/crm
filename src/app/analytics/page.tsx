"use client";

import { ParsedOrderRow } from "@/types/excel";
import CustomerForm from "@/components/customers/CustomerForm";
import CustomerList from "@/components/customers/CustomerList";
import ExcelUpload from "../commons/ExcelUpload";

export default function AnalyticsPage() {
  const handleExcelData = (result: ParsedOrderRow) => {
    console.log("result", result);
  };

  return (
    <div>
      <ExcelUpload onDataLoaded={handleExcelData} />
      <CustomerForm />
      <CustomerList />
    </div>
  );
}
