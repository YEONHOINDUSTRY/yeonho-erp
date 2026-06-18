"use client";

import { useEffect, useState } from "react";

export default function SettlementPage() {
  const [totalQty, setTotalQty] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const response = await fetch("/api/productions");
    const data = await response.json();

    const qty = data.reduce(
      (sum: number, row: any) => sum + Number(row.quantity || 0),
      0
    );

    setTotalQty(qty);
  }

  function calculateProductionAmount(qty: number) {
    if (qty >= 90000) {
      return qty * 155;
    }

    if (qty > 40000) {
      return 40000 * 215 + (qty - 40000) * 140;
    }

    return qty * 215;
  }

  const productionAmount = calculateProductionAmount(totalQty);
  const finalAmount = productionAmount;

  return (
    <main style={{ padding: "30px" }}>
      <h1 style={{ fontSize: "32px", fontWeight: "bold" }}>정산관리</h1>

      <div style={boxStyle}>
        <h2 style={{ fontSize: "22px", fontWeight: "bold" }}>월 정산 요약</h2>

        <p>총 생산수량 : {totalQty.toLocaleString()} EA</p>
        <p>수량 도급비 : {productionAmount.toLocaleString()} 원</p>
        <p>관리자 비가동비 : 0 원</p>
        <p>작업자 비가동비 : 0 원</p>
        <p>교통비 : 0 원</p>

        <hr style={{ margin: "20px 0" }} />

        <h2 style={{ fontSize: "22px", fontWeight: "bold" }}>최종 정산금액</h2>

        <div style={totalStyle}>{finalAmount.toLocaleString()} 원</div>
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
  width: "500px",
};

const totalStyle = {
  fontSize: "28px",
  fontWeight: "bold",
  color: "#2563eb",
};