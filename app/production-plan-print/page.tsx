"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Header = {
  id: number;
  site_id: number;
  vendor_name: string;
  plan_name: string;
  start_date: string;
  end_date: string;
  writer: string;
};

type Detail = {
  id: number;
  line_name: string;
  item_no: string;
  item_name: string;
  customer_name: string;
  mon_qty: number;
  tue_qty: number;
  wed_qty: number;
  thu_qty: number;
  fri_qty: number;
  sat_qty: number;
  sun_qty: number;
  total_qty: number;
  memo: string;
};

export default function ProductionPlanPrintPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [header, setHeader] = useState<Header | null>(null);
  const [details, setDetails] = useState<Detail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/production-plans/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setHeader(data.header);
        setDetails(data.details || []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  function getDayLabel(dayIndex: number, label: string) {
    if (!header?.start_date) return label;

    const base = new Date(header.start_date);
    base.setDate(base.getDate() + dayIndex);

    const month = String(base.getMonth() + 1).padStart(2, "0");
    const day = String(base.getDate()).padStart(2, "0");

    return `${label}(${month}/${day})`;
  }

  function number(value: number) {
    return Number(value || 0).toLocaleString();
  }

  const grandTotal = useMemo(() => {
    return details.reduce((sum, row) => sum + Number(row.total_qty || 0), 0);
  }, [details]);

  if (!id) {
    return <div style={{ padding: 40 }}>생산계획 ID가 없습니다.</div>;
  }

  if (loading) {
    return <div style={{ padding: 40 }}>불러오는 중...</div>;
  }

  if (!header) {
    return <div style={{ padding: 40 }}>생산계획을 찾을 수 없습니다.</div>;
  }

  return (
    <main className="print-page">
      <style jsx>{`
        .print-page {
          width: 100%;
          min-height: 100vh;
          background: white;
          color: #111827;
          padding: 20px;
          font-family: Arial, "Malgun Gothic", sans-serif;
        }

         .toolbar {
          display: flex !important;
          justify-content: flex-end;
          gap: 8px;
          margin-bottom: 12px;
          position: relative;
          z-index: 9999;
        }

        button {
          border: none;
          border-radius: 8px;
          padding: 9px 14px;
          background: #111827;
          color: white;
          font-weight: 700;
          cursor: pointer;
        }

        .sheet {
          border: 2px solid #111827;
          padding: 12px;
        }

        .top {
          display: grid;
          grid-template-columns: 1fr 260px;
          border: 2px solid #111827;
          margin-bottom: 10px;
        }

        .title-box {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 95px;
          border-right: 2px solid #111827;
        }

        .title {
          font-size: 30px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .approval {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
        }

        .approval-cell {
          border-right: 1px solid #111827;
          display: grid;
          grid-template-rows: 30px 65px;
          text-align: center;
        }

        .approval-cell:last-child {
          border-right: none;
        }

        .approval-head {
          border-bottom: 1px solid #111827;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
        }

        .approval-body {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .info {
          display: grid;
          grid-template-columns: 1.2fr 1.2fr 1.6fr 1fr 1fr;
          border: 1px solid #111827;
          margin-bottom: 10px;
        }

        .info div {
          border-right: 1px solid #111827;
          padding: 8px;
          font-size: 13px;
        }

        .info div:last-child {
          border-right: none;
        }

        .info b {
          display: inline-block;
          min-width: 58px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }

        th {
          background: #111827;
          color: white;
          border: 1px solid #374151;
          padding: 7px 4px;
        }

        td {
          border: 1px solid #9ca3af;
          padding: 6px 4px;
          text-align: center;
          height: 28px;
        }

        .left {
          text-align: left;
        }

        .total {
          background: #fef3c7;
          font-weight: 900;
        }

        .summary-row td {
          font-weight: 900;
          background: #f9fafb;
        }

        .note-area {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 12px;
        }

        .note {
          border: 1px solid #111827;
          min-height: 75px;
          padding: 8px;
          font-size: 12px;
        }

        .note-title {
          font-weight: 900;
          margin-bottom: 6px;
        }

         @media print {
          @page {
            size: A4 landscape;
            margin: 8mm;
          }

          :global(body *) {
            visibility: hidden !important;
          }

          .print-page,
          .print-page * {
            visibility: visible !important;
          }

          .print-page {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            min-height: auto;
            padding: 0;
            background: white;
          }

          .toolbar {
            display: none !important;
          }

          .sheet {
            border: none;
            padding: 0;
          }

          th {
            background: #111827 !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .total {
            background: #fef3c7 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }

         .toolbar {
            display: none !important;
          }

          header,
          nav {
            display: none !important;
          }

          body > div > header,
          body > div > nav {
            display: none !important;
          }

          .print-page {
            padding: 0;
          }

          .sheet {
            border: none;
            padding: 0;
          }

          th {
            background: #111827 !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .total {
            background: #fef3c7 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      <div className="toolbar">
        <button onClick={() => window.print()}>인쇄</button>
        <button onClick={() => window.close()}>닫기</button>
      </div>

      <section className="sheet">
        <div className="top">
          <div className="title-box">
            <div className="title">주간 생산계획표</div>
          </div>

          <div className="approval">
            <div className="approval-cell">
              <div className="approval-head">작성</div>
              <div className="approval-body"></div>
            </div>
            <div className="approval-cell">
              <div className="approval-head">검토</div>
              <div className="approval-body"></div>
            </div>
            <div className="approval-cell">
              <div className="approval-head">승인</div>
              <div className="approval-body"></div>
            </div>
          </div>
        </div>

        <div className="info">
          <div>
            <b>업체명</b>
            {header.vendor_name || "-"}
          </div>
          <div>
            <b>계획명</b>
            {header.plan_name || "-"}
          </div>
          <div>
            <b>기간</b>
            {header.start_date || "-"} ~ {header.end_date || "-"}
          </div>
          <div>
            <b>작성자</b>
            {header.writer || "-"}
          </div>
          <div>
            <b>총수량</b>
            {number(grandTotal)} EA
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style={{ width: "8%" }}>라인</th>
              <th style={{ width: "10%" }}>품번</th>
              <th style={{ width: "13%" }}>품명</th>
              <th style={{ width: "11%" }}>거래처</th>
              <th>{getDayLabel(0, "월")}</th>
              <th>{getDayLabel(1, "화")}</th>
              <th>{getDayLabel(2, "수")}</th>
              <th>{getDayLabel(3, "목")}</th>
              <th>{getDayLabel(4, "금")}</th>
              <th>{getDayLabel(5, "토")}</th>
              <th>{getDayLabel(6, "일")}</th>
              <th style={{ width: "8%" }}>합계</th>
              <th style={{ width: "10%" }}>비고</th>
            </tr>
          </thead>
          <tbody>
            {details.map((row) => (
              <tr key={row.id}>
                <td>{row.line_name}</td>
                <td>{row.item_no}</td>
                <td className="left">{row.item_name}</td>
                <td>{row.customer_name}</td>
                <td>{number(row.mon_qty)}</td>
                <td>{number(row.tue_qty)}</td>
                <td>{number(row.wed_qty)}</td>
                <td>{number(row.thu_qty)}</td>
                <td>{number(row.fri_qty)}</td>
                <td>{number(row.sat_qty)}</td>
                <td>{number(row.sun_qty)}</td>
                <td className="total">{number(row.total_qty)}</td>
                <td>{row.memo}</td>
              </tr>
            ))}

            <tr className="summary-row">
              <td colSpan={11} style={{ textAlign: "right" }}>
                전체 합계
              </td>
              <td className="total">{number(grandTotal)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <div className="note-area">
          <div className="note">
            <div className="note-title">특이사항</div>
            <div>작업 전 품번, 금형, 소재, 생산수량 확인 후 생산 진행</div>
          </div>

          <div className="note">
            <div className="note-title">현장 확인사항</div>
            <div>계획 변경 시 관리자 승인 후 수정 기록</div>
          </div>
        </div>
      </section>
    </main>
  );
}