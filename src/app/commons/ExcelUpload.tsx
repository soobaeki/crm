"use client";

import React, { useState } from "react";
import { ParsedOrderRow } from "@/types/excel";

interface ExcelUploadProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDataLoaded: (result: ParsedOrderRow) => void;
}

export default function ExcelUpload({ onDataLoaded }: ExcelUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("파일을 선택하세요");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/excel/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      onDataLoaded(data);
    } catch (error) {
      alert("업로드 실패");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "업로드 중..." : "업로드"}
      </button>
    </div>
  );
}
