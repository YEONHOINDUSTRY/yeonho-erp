"use client";

import { useEffect, useState } from "react";

const MANAGER_STOP_RATE = 14960;
const WORKER_STOP_RATE = 13050;

export default function SettlementPage() {
  const [settlementMonth, setSettlementMonth] = useState("2026-06");
  const [totalQty, setTotalQty] = useState(0);
  const [managerStopHours, setManagerStopHours] = useState(0);
  const [workerStopHours, setWorkerStopHours] = useState(0);
  const [transportCost, setTransportCost] = useState(0);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    loadHistory();
  }, [settlementMonth]);

  async function loadData() {
    const response = await fetch(`/api/productions?month=${settlementMonth}`);
    const data = await response.json();

    const qty = data.reduce(
      (sum: number, row: any) => sum + Number(row.quantity || 0),
      0
    );

    setTotalQty(qty);
  }

  async function loadHistory() {
    const response = await fetch("/api/settlements");
    const data = await response.json();
    setHistory(data);
  }

  function calculateRows(qty: number) {
    if (qty >= 90000) {
      return [
        {
          name: "90,000EA 이상 생산",
          qty,
          price: 155,
          amount: qty * 155,
        },
      ];
    }

    if (qty > 40000) {
      return [
        {
          name: "기준 생산",
          qty: 40000,
          price: 215,
          amount: 40000 * 215,
        },
        {
          name: "초과 수량",
          qty: qty - 40000,
          price: 140,
          amount: (qty - 40000) * 140,
        },
      ];
    }

    return [
      {
        name: "기준 생산",
        qty,
        price: 215,
        amount: qty * 215,
      },
    ];
  }

  const productionRows = calculateRows(totalQty);

  const productionAmount = productionRows.reduce(
    (sum, row) => sum + row.amount,
    0
  );

  const managerStopAmount = managerStopHours * MANAGER_STOP_RATE;
  const workerStopAmount = workerStopHours * WORKER_STOP_RATE;

  const finalAmount =
    productionAmount + managerStopAmount + workerStopAmount + transportCost;

  async function saveSettlement() {
    const response = await fetch("/api/settlements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        settlementMonth,
        totalQty,
        productionAmount,
        managerStopHours,
        managerStopAmount,
        workerStopHours,
        workerStopAmount,
        transportCost,
        finalAmount,
      }),
    });

    const result = await response.json();

    if (result.success) {
      alert("정산이 저장되었습니다.");
      loadHistory();
    } else if (result.duplicate) {
      alert(
        "이미 해당 월 정산이 존재합니다. 수정하려면 기존 정산을 삭제 후 다시 확정하세요."
      );
    } else {
      alert("저장 실패");
    }
  }

  async function deleteSettlement(id: number) {
    const ok = confirm("정말 삭제하시겠습니까?");

    if (!ok) return;

    const response = await fetch("/api/settlements", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    const result = await response.json();

    if (result.success) {
      alert("삭제되었습니다.");
      loadHistory();
    }
  }

  async function downloadExcel() {
    const response = await fetch("/api/settlements/excel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        settlementMonth,
        totalQty,
        productionAmount,
        managerStopHours,
        managerStopAmount,
        workerStopHours,
        workerStopAmount,
        transportCost,
        finalAmount,
      }),
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `연호산업_정산서_${settlementMonth}.xlsx`;
    a.click();

    window.URL.revokeObjectURL(url);
  }

  return (
    <main style={{ padding: "30px" }}>
      <h1 style={{ fontSize: "32px", fontWeight: "bold" }}>정산관리</h1>

      <div style={boxStyle}>
        <h2 style={titleStyle}>정산 조건 입력</h2>

        <label style={labelStyle}>정산월</label>
        <input
          type="month"
          value={settlementMonth}
          onChange={(e) => setSettlementMonth(e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>관리자 비가동 시간</label>
        <input
          type="number"
          value={managerStopHours}
          onChange={(e) => setManagerStopHours(Number(e.target.value))}
          style={inputStyle}
        />

        <label style={labelStyle}>작업자 비가동 시간</label>
        <input
          type="number"
          value={workerStopHours}
          onChange={(e) => setWorkerStopHours(Number(e.target.value))}
          style={inputStyle}
        />

        <label style={labelStyle}>교통비</label>
        <input
          type="number"
          value={transportCost}
          onChange={(e) => setTransportCost(Number(e.target.value))}
          style={inputStyle}
        />
      </div>

      <div style={boxStyle}>
        <h2 style={titleStyle}>수량 정산 상세</h2>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>구분</th>
              <th style={thStyle}>수량</th>
              <th style={thStyle}>단가</th>
              <th style={thStyle}>금액</th>
            </tr>
          </thead>

          <tbody>
            {productionRows.map((row, index) => (
              <tr key={index}>
                <td style={tdStyle}>{row.name}</td>
                <td style={tdRightStyle}>{row.qty.toLocaleString()} EA</td>
                <td style={tdRightStyle}>{row.price.toLocaleString()} 원</td>
                <td style={tdRightStyle}>{row.amount.toLocaleString()} 원</td>
              </tr>
            ))}

            <tr>
              <td style={totalTdStyle}>합계</td>
              <td style={totalRightStyle}>{totalQty.toLocaleString()} EA</td>
              <td style={totalRightStyle}></td>
              <td style={totalRightStyle}>
                {productionAmount.toLocaleString()} 원
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={boxStyle}>
        <h2 style={titleStyle}>월 정산 요약</h2>

        <p>정산월 : {settlementMonth}</p>
        <p>총 생산수량 : {totalQty.toLocaleString()} EA</p>
        <p>수량 도급비 : {productionAmount.toLocaleString()} 원</p>
        <p>
          관리자 비가동비 : {managerStopAmount.toLocaleString()} 원 (
          {MANAGER_STOP_RATE.toLocaleString()}원/hr)
        </p>
        <p>
          작업자 비가동비 : {workerStopAmount.toLocaleString()} 원 (
          {WORKER_STOP_RATE.toLocaleString()}원/hr)
        </p>
        <p>교통비 : {transportCost.toLocaleString()} 원</p>

        <hr style={{ margin: "20px 0" }} />

        <h2 style={titleStyle}>최종 정산금액</h2>

        <div style={totalStyle}>{finalAmount.toLocaleString()} 원</div>

        <button onClick={saveSettlement} style={buttonStyle}>
          정산확정
        </button>

        <button onClick={downloadExcel} style={excelButtonStyle}>
          정산서 엑셀출력
        </button>
      </div>

      <div style={boxStyle}>
        <h2 style={titleStyle}>정산 이력</h2>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>정산월</th>
              <th style={thStyle}>생산수량</th>
              <th style={thStyle}>수량 도급비</th>
              <th style={thStyle}>최종금액</th>
              <th style={thStyle}>관리</th>
            </tr>
          </thead>

          <tbody>
            {history.map((row) => (
              <tr key={row.id}>
                <td style={tdStyle}>{row.settlement_month}</td>

                <td style={tdRightStyle}>
                  {Number(row.total_qty).toLocaleString()} EA
                </td>

                <td style={tdRightStyle}>
                  {Number(row.production_amount).toLocaleString()} 원
                </td>

                <td style={tdRightStyle}>
                  {Number(row.final_amount).toLocaleString()} 원
                </td>

                <td style={tdStyle}>
                  <button
                    onClick={() =>
                      alert(
                        `정산월: ${row.settlement_month}\n` +
                          `생산수량: ${Number(
                            row.total_qty
                          ).toLocaleString()} EA\n` +
                          `수량 도급비: ${Number(
                            row.production_amount
                          ).toLocaleString()} 원\n` +
                          `관리자 비가동: ${Number(
                            row.manager_stop_hours
                          ).toLocaleString()} 시간 / ${Number(
                            row.manager_stop_amount
                          ).toLocaleString()} 원\n` +
                          `작업자 비가동: ${Number(
                            row.worker_stop_hours
                          ).toLocaleString()} 시간 / ${Number(
                            row.worker_stop_amount
                          ).toLocaleString()} 원\n` +
                          `교통비: ${Number(
                            row.transport_cost
                          ).toLocaleString()} 원\n` +
                          `최종금액: ${Number(
                            row.final_amount
                          ).toLocaleString()} 원`
                      )
                    }
                    style={detailButtonStyle}
                  >
                    상세
                  </button>

                  <button
                    onClick={() => deleteSettlement(row.id)}
                    style={deleteButtonStyle}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

const boxStyle = {
  marginTop: "30px",
  padding: "20px",
  border: "1px solid #ddd",
  borderRadius: "10px",
  backgroundColor: "#fff",
  width: "760px",
};

const titleStyle = {
  fontSize: "22px",
  fontWeight: "bold",
  marginBottom: "15px",
};

const labelStyle = {
  display: "block",
  marginTop: "12px",
  marginBottom: "6px",
  fontWeight: "bold",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "16px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const thStyle = {
  border: "1px solid #ccc",
  padding: "10px",
  backgroundColor: "#f3f4f6",
  textAlign: "center" as const,
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: "10px",
};

const tdRightStyle = {
  border: "1px solid #ccc",
  padding: "10px",
  textAlign: "right" as const,
};

const totalTdStyle = {
  border: "1px solid #ccc",
  padding: "10px",
  fontWeight: "bold",
  backgroundColor: "#f9fafb",
};

const totalRightStyle = {
  border: "1px solid #ccc",
  padding: "10px",
  textAlign: "right" as const,
  fontWeight: "bold",
  backgroundColor: "#f9fafb",
};

const totalStyle = {
  fontSize: "28px",
  fontWeight: "bold",
  color: "#2563eb",
};

const buttonStyle = {
  marginTop: "20px",
  padding: "12px 24px",
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

const excelButtonStyle = {
  marginTop: "20px",
  marginLeft: "10px",
  padding: "12px 24px",
  backgroundColor: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

const detailButtonStyle = {
  backgroundColor: "#111827",
  color: "white",
  border: "none",
  borderRadius: "4px",
  padding: "6px 12px",
  cursor: "pointer",
  marginRight: "6px",
};

const deleteButtonStyle = {
  backgroundColor: "#dc2626",
  color: "white",
  border: "none",
  borderRadius: "4px",
  padding: "6px 12px",
  cursor: "pointer",
};