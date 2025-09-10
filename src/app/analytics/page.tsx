"use client";

import { ParsedOrderRow } from "@/types/excel";
import ExcelUpload from "../commons/ExcelUpload";
import CustomerForm from "@/components/customers/CustomerForm";
import CustomerList from "@/components/customers/CustomerList";

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
