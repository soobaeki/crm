"use client";

import { useRef, useState } from "react";
import { RowData } from "@/types/excel";
import { readFile } from "@/utils/excel";

interface Props {
  data: RowData[];
  uploading: boolean;
  onParsed: (rows: RowData[]) => void;
  onUpload: () => void;
  onDownload: () => void;
}

export default function ExcelActionBar({
  data,
  uploading,
  onParsed,
  onUpload,
  onDownload,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xls", "xlsx"].includes(ext ?? "")) {
      alert("csv, xls, xlsx 파일만 업로드 가능합니다.");
      return;
    }

    try {
      setLoading(true);
      setFileName(file.name);

      const rows = await readFile(file);
      onParsed(rows);
    } catch (error) {
      console.error(error);
      alert("파일을 읽는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <section className="mb-4 flex items-center gap-3 rounded border p-4">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xls,.xlsx"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {loading ? "파일 읽는 중..." : "엑셀 업로드"}
      </button>

      <button
        onClick={onUpload}
        disabled={uploading || data.length === 0}
        className="rounded bg-blue-500 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {uploading ? "업로드 중..." : "DB 저장"}
      </button>

      <button
        onClick={onDownload}
        disabled={data.length === 0}
        className="rounded bg-green-500 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        다운로드
      </button>

      {fileName && <span className="text-sm text-gray-600">{fileName}</span>}
    </section>
  );
}
