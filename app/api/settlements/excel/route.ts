import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

export async function POST(request: Request) {
  const body = await request.json();

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("정산서");

  sheet.columns = [
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
  ];

  sheet.mergeCells("A1:D1");
  sheet.getCell("A1").value = "연호산업 월 정산서";
  sheet.getCell("A1").font = { size: 20, bold: true };
  sheet.getCell("A1").alignment = { horizontal: "center" };

  sheet.getCell("A3").value = "정산월";
  sheet.getCell("B3").value = body.settlementMonth;

  sheet.addRow([]);

  sheet.addRow(["구분", "수량", "단가", "금액"]);
  sheet.addRow(["총 생산수량", body.totalQty, "", body.productionAmount]);
  sheet.addRow(["관리자 비가동", body.managerStopHours, "14,960원/hr", body.managerStopAmount]);
  sheet.addRow(["작업자 비가동", body.workerStopHours, "13,050원/hr", body.workerStopAmount]);
  sheet.addRow(["교통비", "", "", body.transportCost]);
  sheet.addRow(["최종 정산금액", "", "", body.finalAmount]);

  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });
  });

  sheet.getRow(5).font = { bold: true };
  sheet.getRow(10).font = { bold: true, size: 14 };

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=yeonho_settlement_${body.settlementMonth}.xlsx`,
    },
  });
}