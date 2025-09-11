import ExcelJS from "exceljs";
import { PRODUCT_COLUMNS, ParsedOrderRow } from "@/types/excel";

export async function parseExcel(
  buffer: ArrayBuffer,
): Promise<ParsedOrderRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];

  const parsed: ParsedOrderRow[] = [];

  sheet.eachRow((row, rowIndex) => {
    console.log("row 1 raw values", sheet.getRow(1).values);
    if (rowIndex === 1) return; // 헤더 스킵

    const orderDate = row.getCell(2).value?.toString().trim() || "";
    //  const item = row.getCell(3).value?.toString().trim() || "";
    //  const quantity = parseInt(
    //    row.getCell(4).value?.toString().trim() || "0",
    //    10,
    //  );
    const address = row.getCell(5).value?.toString().trim() || "";
    const homePhone = row.getCell(6).value?.toString().trim() || "";
    const mobilePhone = row.getCell(7).value?.toString().trim() || "";
    const customerName = row.getCell(8).value?.toString().trim() || "";
    //  const depositAmount = parseInt(
    //    row.getCell(9).value?.toString().trim() || "0",
    //    10,
    //  );
    //  const depositDate = row.getCell(10).value?.toString().trim() || "";
    const depositor = row.getCell(11).value?.toString().trim() || "";
    const memo = row.getCell(12).value?.toString().trim() || "";
    if (!customerName || !mobilePhone) return;

    parsed.push({
      orderDate,
      // items,
      customer: {
        name: customerName,
        // nickName,
        address,
        homePhone,
        mobilePhone,
      },
      depositor,
      totalAmount,
      memo,
    });
  });

  return parsed;
}
