import React from "react";
import { downloadExcelFile } from "@/utils/excel";
import { RowData } from "@/types/row-data";

interface Props {
  data: RowData[];
}

export default function ExcelDownload({ data }: Props) {
  const handleDownload = async () => {
    if (data.length === 0) {
      alert("다운로드할 데이터가 없습니다.");
      return;
    }
    await downloadExcelFile(data);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={data.length === 0}
      className="rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
    >
      엑셀 다운로드
    </button>
  );
}
