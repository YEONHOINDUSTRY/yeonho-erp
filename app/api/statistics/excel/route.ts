import { NextRequest } from "next/server";
import ExcelJS from "exceljs";
import { db } from "@/lib/db";
type ProductionRow = {
  production_date?: string;
  work_date?: string;
  date?: string;
  item_name?: string;
  customer_name?: string;
  line_name?: string;
  qty?: number;
  quantity?: number;
  total_qty?: number;
};

function getQty(row:SS ProductionRow) {
  return Number(row.qty ?? row.quantity ?? row.total_qty ?? 0);
}

function getDate(row: ProductionRow) {
  return row.production_date ?? row.work_date ?? row.date ?? "-";
}

function groupBy(rows: ProductionRow[], key: keyof ProductionRow) {
  const map = new Map<string, number>();

  rows.forEach((row) => {
    const name = String(row[key] ?? "미지정");
    map.set(name, (map.get(name) || 0) + getQty(row));
  });

  return Array.from(map.entries())
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty);
}

function groupByDate(rows: ProductionRow[]) {
  const map = new Map<string, number>();

  rows.forEach((row) => {
    const date = getDate(row);
    map.set(date, (map.get(date) || 0) + getQty(row));
  });

  return Array.from(map.entries())
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function dbAll(sql: string, params: any[] = []): Promise<ProductionRow[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err: Error | null, rows: ProductionRow[]) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function setupSheet(sheet: ExcelJS.Worksheet, title: string, month: string) {
  sheet.mergeCells("A1:D1");
  sheet.getCell("A1").value = `연호산업 생산통계 - ${title}`;
  sheet.getCell("A1").font = { size: 18, bold: true };
  sheet.getCell("A1").alignment = { horizontal: "center" };

  sheet.mergeCells("A2:D2");
  sheet.getCell("A2").value = `조회월: ${month}`;
  sheet.getCell("A2").alignment = { horizontal: "center" };

  sheet.columns = [
    { key: "name", width: 35 },
    { key: "qty", width: 18 },
    { key: "rate", width: 15 },
    { key: "note", width: 20 },
  ];

  sheet.getRow(4).values = ["구분", "생산수량", "비율", "비고"];
  sheet.getRow(4).font = { bold: true };
  sheet.getRow(4).alignment = { horizontal: "center" };

  sheet.getRow(4).eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE5E7EB" },
    };
    cell.border = borderStyle;
  });
}

function addRows(
  sheet: ExcelJS.Worksheet,
  rows: { name: string; qty: number }[],
  totalQty: number
) {
  rows.forEach((row) => {
    const rate = totalQty > 0 ? row.qty / totalQty : 0;

    sheet.addRow({
      name: row.name,
      qty: row.qty,
      rate,
      note: "",
    });
  });

  const totalRow = sheet.addRow({
    name: "합계",
    qty: totalQty,
    rate: 1,
    note: "",
  });

  totalRow.font = { bold: true };

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber >= 4) {
      row.eachCell((cell) => {
        cell.border = borderStyle;
        cell.alignment = { vertical: "middle" };
      });
    }
  });

  sheet.getColumn("qty").numFmt = "#,##0";
  sheet.getColumn("rate").numFmt = "0.0%";
}

const borderStyle: Partial<ExcelJS.Borders> = {
  top: { style: "thin" },
  left: { style: "thin" },
  bottom: { style: "thin" },
  right: { style: "thin" },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") || "";

  if (!month) {
    return new Response("month 값이 필요합니다.", { status: 400 });
  }

  const rows = await dbAll(
    `
    SELECT 
      production_date,
      work_date,
      date,
      item_name,
      customer_name,
      line_name,
      qty,
      quantity,
      total_qty
    FROM productions
    WHERE 
      production_date LIKE ?
      OR work_date LIKE ?
      OR date LIKE ?
    ORDER BY 
      production_date DESC,
      work_date DESC,
      date DESC
    `,
    [`${month}%`, `${month}%`, `${month}%`]
  );

  const totalQty = rows.reduce((sum, row) => sum + getQty(row), 0);

  const itemStats = groupBy(rows, "item_name");
  const customerStats = groupBy(rows, "customer_name");
  const lineStats = groupBy(rows, "line_name");
  const dailyStats = groupByDate(rows);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Yeonho ERP";
  workbook.created = new Date();

  const itemSheet = workbook.addWorksheet("품목별 생산현황");
  setupSheet(itemSheet, "품목별 생산현황", month);
  addRows(itemSheet, itemStats, totalQty);

  const customerSheet = workbook.addWorksheet("거래처별 생산현황");
  setupSheet(customerSheet, "거래처별 생산현황", month);
  addRows(customerSheet, customerStats, totalQty);

  const lineSheet = workbook.addWorksheet("라인별 생산현황");
  setupSheet(lineSheet, "라인별 생산현황", month);
  addRows(lineSheet, lineStats, totalQty);

  const dailySheet = workbook.addWorksheet("일자별 생산현황");
  setupSheet(dailySheet, "일자별 생산현황", month);
  addRows(dailySheet, dailyStats, totalQty);

  const buffer = await workbook.xlsx.writeBuffer();

  const fileName = encodeURIComponent(`연호산업_생산통계_${month}.xlsx`);

  return new Response(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename*=UTF-8''${fileName}`,
    },
  });
}