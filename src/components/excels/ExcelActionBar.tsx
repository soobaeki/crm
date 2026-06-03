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
      setFileName(data.length === 0 ? "" : file.name);

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
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xls,.xlsx"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 파일 상태 */}
      <div className="text-muted-foreground text-sm">
        {fileName ? `선택된 파일: ${fileName}` : "엑셀 파일을 선택하세요"}
      </div>

      {/* 버튼 그룹 */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="btn-base btn-primary"
        >
          {loading ? "파일 읽는 중..." : "엑셀 업로드"}
        </button>

        <button
          onClick={onUpload}
          disabled={uploading || data.length === 0}
          className="btn-base btn-outline"
        >
          {uploading ? "업로드 중..." : "DB 저장"}
        </button>

        <button
          onClick={onDownload}
          disabled={data.length === 0}
          className="btn-base btn-outline"
        >
          다운로드
        </button>
      </div>
    </section>
  );
}
