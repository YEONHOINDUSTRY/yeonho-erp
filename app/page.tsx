"use client";

import { useEffect, useState } from "react";

type Production = {
  id?: number;
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

type Settlement = {
  id: number;
  settlement_month: string;
  total_qty: number;
  production_amount: number;
  manager_stop_hours: number;
  manager_stop_amount: number;
  worker_stop_hours: number;
  worker_stop_amount: number;
  transport_cost: number;
  final_amount: number;
  created_at: string;
};

const MANAGER_STOP_RATE = 14960;
const WORKER_STOP_RATE = 13050;

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function money(value: number) {
  return value.toLocaleString("ko-KR") + "원";
}

function number(value: number) {
  return value.toLocaleString("ko-KR");
}

function getQty(row: Production) {
  return Number(row.qty ?? row.quantity ?? row.total_qty ?? 0);
}

function getDate(row: Production) {
  return row.production_date ?? row.work_date ?? row.date ?? "-";
}

function calculateProductionAmount(totalQty: number) {
  if (totalQty >= 90000) {
    return totalQty * 155;
  }

  const baseQty = Math.min(totalQty, 40000);
  const overQty = Math.max(totalQty - 40000, 0);

  return baseQty * 215 + overQty * 140;
}

export default function HomePage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [productions, setProductions] = useState<Production[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(false);

  const totalQty = productions.reduce((sum, row) => sum + getQty(row), 0);
  const expectedProductionAmount = calculateProductionAmount(totalQty);

  const recentProductions = [...productions].slice(0, 5);
  const recentSettlements = [...settlements].slice(0, 5);

  async function loadDashboard() {
    setLoading(true);

    try {
      const productionRes = await fetch(`/api/productions?month=${month}`);
      const productionData = await productionRes.json();

      const settlementRes = await fetch(`/api/settlements`);
      const settlementData = await settlementRes.json();

      setProductions(Array.isArray(productionData) ? productionData : []);
      setSettlements(Array.isArray(settlementData) ? settlementData : []);
    } catch (error) {
      console.error(error);
      alert("대시보드 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, [month]);

  return (
    <main style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "25px" }}>
        <h1 style={{ fontSize: "30px", fontWeight: "bold", marginBottom: "8px" }}>
          연호 ERP 대시보드
        </h1>
        <p style={{ color: "#666" }}>
          생산일보, 정산금액, 최근 입력 내역을 한눈에 확인합니다.
        </p>
      </div>

      <div style={{ marginBottom: "25px", display: "flex", gap: "10px", alignItems: "center" }}>
        <label style={{ fontWeight: "bold" }}>조회월</label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          style={{
            padding: "8px 10px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />
        <button
          onClick={loadDashboard}
          style={{
            padding: "9px 16px",
            background: "#111827",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          새로고침
        </button>
      </div>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "15px",
          marginBottom: "30px",
        }}
      >
        <div style={cardStyle}>
          <div style={cardTitleStyle}>이번달 생산량</div>
          <div style={cardValueStyle}>{number(totalQty)} EA</div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitleStyle}>예상 생산금액</div>
          <div style={cardValueStyle}>{money(expectedProductionAmount)}</div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitleStyle}>최근 생산일보</div>
          <div style={cardValueStyle}>{number(recentProductions.length)}건</div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitleStyle}>정산 확정 내역</div>
          <div style={cardValueStyle}>{number(settlements.length)}건</div>
        </div>
      </section>

      {loading && (
        <div style={{ marginBottom: "20px", color: "#666" }}>
          데이터를 불러오는 중입니다.
        </div>
      )}

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div style={boxStyle}>
          <h2 style={sectionTitleStyle}>최근 생산일보</h2>

          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>일자</th>
                <th style={thStyle}>품목</th>
                <th style={thStyle}>거래처</th>
                <th style={thStyle}>수량</th>
              </tr>
            </thead>
            <tbody>
              {recentProductions.length === 0 ? (
                <tr>
                  <td style={tdStyle} colSpan={4}>
                    생산일보 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                recentProductions.map((row, index) => (
                  <tr key={row.id ?? index}>
                    <td style={tdStyle}>{getDate(row)}</td>
                    <td style={tdStyle}>{row.item_name ?? "-"}</td>
                    <td style={tdStyle}>{row.customer_name ?? "-"}</td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      {number(getQty(row))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={boxStyle}>
          <h2 style={sectionTitleStyle}>최근 정산내역</h2>

          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>정산월</th>
                <th style={thStyle}>생산수량</th>
                <th style={thStyle}>최종금액</th>
                <th style={thStyle}>저장일</th>
              </tr>
            </thead>
            <tbody>
              {recentSettlements.length === 0 ? (
                <tr>
                  <td style={tdStyle} colSpan={4}>
                    정산 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                recentSettlements.map((row) => (
                  <tr key={row.id}>
                    <td style={tdStyle}>{row.settlement_month}</td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      {number(Number(row.total_qty))}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", fontWeight: "bold" }}>
                      {money(Number(row.final_amount))}
                    </td>
                    <td style={tdStyle}>
                      {row.created_at ? row.created_at.slice(0, 10) : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginTop: "25px", display: "flex", gap: "10px" }}>
        <a href="/production" style={linkButtonStyle}>
          생산일보 입력
        </a>
        <a href="/settlement" style={linkButtonStyle}>
          정산관리
        </a>
        <a href="/items" style={linkButtonStyle}>
          품목관리
        </a>
        <a href="/customers" style={linkButtonStyle}>
          거래처관리
        </a>
      </section>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  background: "white",
  border: "1px solid #ddd",
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

const cardTitleStyle: React.CSSProperties = {
  color: "#666",
  fontSize: "14px",
  marginBottom: "10px",
};

const cardValueStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "bold",
};

const boxStyle: React.CSSProperties = {
  background: "white",
  border: "1px solid #ddd",
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "bold",
  marginBottom: "15px",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle: React.CSSProperties = {
  borderBottom: "2px solid #ddd",
  padding: "10px",
  background: "#f3f4f6",
  textAlign: "left",
  fontSize: "14px",
};

const tdStyle: React.CSSProperties = {
  borderBottom: "1px solid #eee",
  padding: "10px",
  fontSize: "14px",
};

const linkButtonStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "11px 18px",
  background: "#2563eb",
  color: "white",
  textDecoration: "none",
  borderRadius: "8px",
  fontWeight: "bold",
};