"use client";

import { useEffect, useState } from "react";

export default function ProductionListPage() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    loadProductions();
  }, []);

  async function loadProductions() {
    const response = await fetch("/api/productions");
    const data = await response.json();
    setRows(data);
  }

  async function deleteProduction(id: number) {
    if (!confirm("삭제하시겠습니까?")) return;

    await fetch("/api/productions", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    loadProductions();
  }
const totalQty = rows.reduce(
  (sum, row) => sum + Number(row.quantity || 0),
  0
);

const totalAmount = rows.reduce(
  (sum, row) => sum + Number(row.amount || 0),
  0
);
  return (
    <main style={{ padding: "30px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>
        생산일보 조회
      </h1>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>작업일자</th>
            <th style={thStyle}>라인</th>
            <th style={thStyle}>품번</th>
            <th style={thStyle}>품명</th>
            <th style={thStyle}>거래처</th>
            <th style={thStyle}>단가</th>
            <th style={thStyle}>생산수량</th>
            <th style={thStyle}>금액</th>
            <th style={thStyle}>작업자</th>
            <th style={thStyle}>비고</th>
            <th style={thStyle}>관리</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td style={tdStyle}>{row.work_date}</td>
              <td style={tdStyle}>{row.line_name}</td>
              <td style={tdStyle}>{row.item_no}</td>
              <td style={tdStyle}>{row.item_name}</td>
              <td style={tdStyle}>{row.customer_name}</td>
              <td style={tdStyle}>{Number(row.unit_price).toLocaleString()}원</td>
              <td style={tdStyle}>
                {Number(row.quantity).toLocaleString()}
              </td>
              <td style={tdStyle}>{Number(row.amount).toLocaleString()}원</td>
              <td style={tdStyle}>{row.worker}</td>
              <td style={tdStyle}>{row.memo}</td>
              <td style={tdStyle}>
                <button style={smallButtonStyle}>수정</button>

                <button
                  style={deleteButtonStyle}
                  onClick={() => deleteProduction(row.id)}
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div
  style={{
    marginTop: "20px",
    display: "flex",
    gap: "30px",
    fontWeight: "bold",
    fontSize: "18px",
  }}
>
  <div>
    총 생산수량 : {totalQty.toLocaleString()} EA
  </div>

  <div>
    총 금액 : {totalAmount.toLocaleString()} 원
  </div>
</div>
    </main>
  );
}

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
  marginTop: "20px",
};

const thStyle = {
  border: "1px solid #ccc",
  padding: "12px",
  backgroundColor: "#f3f4f6",
  fontWeight: "bold",
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: "10px",
  textAlign: "center" as const,
};

const smallButtonStyle = {
  padding: "6px 10px",
  marginRight: "6px",
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "4px",
};

const deleteButtonStyle = {
  padding: "6px 10px",
  backgroundColor: "#dc2626",
  color: "white",
  border: "none",
  borderRadius: "4px",
};