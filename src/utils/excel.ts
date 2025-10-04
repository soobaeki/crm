import ExcelJS from "exceljs";
import Papa from "papaparse";
import { RowData } from "@/types/excel";

// 헤더 → RowData 키 매핑
const headerMap: Record<string, keyof RowData> = {
  순번: "id",
  주문일자: "orderDate",
  품목: "item",
  무게: "weight",
  수량: "quantity",
  주소: "address",
  집전화: "homePhone",
  휴대전화: "mobilePhone",
  주문자: "customerName",
  입금액: "paymentAmount",
  입금일: "paymentDate",
  입금자: "payer",
  특이사항: "notes",
};

// 숫자 변환이 필요한 필드
const numberFields: (keyof RowData)[] = [
  "id",
  "weight",
  "quantity",
  "paymentAmount",
];

/**
 * CSV 파일 읽기
 */
export async function readCsvFile(file: File): Promise<RowData[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const mapped = results.data.map((row) => {
          const rowData: Partial<RowData> = {};

          for (const [header, value] of Object.entries(row)) {
            const key = headerMap[header];
            if (key) {
              if (numberFields.includes(key)) {
                (rowData as any)[key] = value ? Number(value) : null;
              } else {
                (rowData as any)[key] = value || null;
              }
            }
          }

          return rowData as RowData;
        });

        resolve(mapped);
      },
      error: (error) => reject(error),
    });
  });
}

/**
 * Excel 파일 읽기
 */
export async function readExcelFile(file: File): Promise<RowData[]> {
  const workbook = new ExcelJS.Workbook();
  const arrayBuffer = await file.arrayBuffer();
  await workbook.xlsx.load(arrayBuffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw new Error("No worksheet found");

  const rows: RowData[] = [];
  let headers: string[] = [];

  worksheet.eachRow((row, rowNumber) => {
    const valuesArray = Array.isArray(row.values) ? row.values : [];

    if (rowNumber === 1) {
      headers = valuesArray
        .slice(1)
        .map((v, idx) =>
          v !== undefined && v !== null ? String(v) : `column${idx + 1}`,
        );
    } else {
      const rowData: Partial<RowData> = {};

      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        let value: string | number | null = null;

        if (cell.value === null || cell.value === undefined) {
          value = null;
        } else if (typeof cell.value === "string") {
          value = cell.value;
        } else if (typeof cell.value === "number") {
          value = cell.value;
        } else if (cell.value instanceof Date) {
          value = cell.value.toISOString().split("T")[0];
        } else if (
          typeof cell.value === "object" &&
          "text" in cell.value &&
          typeof (cell.value as { text: string }).text === "string"
        ) {
          value = (cell.value as { text: string }).text;
        }

        const header = headers[colNumber - 1] ?? `column${colNumber}`;
        const key = headerMap[header];
        if (key) {
          if (numberFields.includes(key)) {
            (rowData as any)[key] = value ? Number(value) : null;
          } else {
            (rowData as any)[key] = value || null;
          }
        }
      });

      rows.push(rowData as RowData);
    }
  });

  return rows;
}

/**
 * 파일 타입에 따라 CSV/Excel을 구분해서 읽기
 */
export async function readFile(file: File): Promise<RowData[]> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "csv") return readCsvFile(file);
  if (ext === "xls" || ext === "xlsx") return readExcelFile(file);

  throw new Error("Unsupported file format");
}
