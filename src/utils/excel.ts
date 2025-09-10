import ExcelJS from "exceljs";
import Papa from "papaparse";
import { RowData } from "@/types/row-data";

/**
 * CSV 파일을 읽어서 JSON 배열로 변환
 */
function readCsvFile(file: File): Promise<RowData[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<RowData>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

/**
 * 엑셀(xls, xlsx) 파일을 읽어서 JSON 배열로 변환
 */
async function readExcelFile(file: File): Promise<RowData[]> {
  const workbook = new ExcelJS.Workbook();
  const arrayBuffer = await file.arrayBuffer();
  await workbook.xlsx.load(arrayBuffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw new Error("No worksheet found");

  const rows: RowData[] = [];
  const headers: string[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      row.eachCell((cell) => {
        headers.push(cell.text);
      });
    } else {
      const rowData: RowData = {};
      row.eachCell((cell, colNumber) => {
        // cell.value 타입이 여러가지이므로 string | number | null | undefined로 맞춰줌
        let value = cell.value;
        if (typeof value === "object" && value !== null && "text" in value) {
          // Hyperlink or rich text 일 때 .text로 변환
          value = value.text;
        }
        rowData[headers[colNumber - 1]] = value as
          | string
          | number
          | null
          | undefined;
      });
      rows.push(rowData);
    }
  });

  return rows;
}

/**
 * 파일 타입에 따라 csv / excel 분기해서 JSON 배열로 읽기
 */
export async function readFile(file: File): Promise<RowData[]> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "csv") {
    return readCsvFile(file);
  } else if (ext === "xls" || ext === "xlsx") {
    return readExcelFile(file);
  } else {
    throw new Error("Unsupported file format");
  }
}

/**
 * JSON 배열 데이터를 엑셀 파일로 다운로드
 */
export async function downloadExcelFile(
  data: RowData[],
  filename = "export.xlsx",
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");

  if (data.length === 0) {
    worksheet.addRow(["No Data"]);
  } else {
    worksheet.addRow(Object.keys(data[0]));
    data.forEach((item) => {
      worksheet.addRow(Object.values(item));
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}
