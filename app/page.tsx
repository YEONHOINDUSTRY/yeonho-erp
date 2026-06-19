"use client";

import { useEffect, useMemo, useState } from "react";

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

const TARGET_QTY = 90000;

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
  if (totalQty >= 90000) return totalQty * 155;

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
  const achievementRate = Math.min((totalQty / TARGET_QTY) * 100, 100);

  const sortedProductions = useMemo(() => {
    return [...productions].sort((a, b) => {
      return getDate(b).localeCompare(getDate(a));
    });
  }, [productions]);

  const recentProductions = sortedProductions.slice(0, 5);
  const recentSettlements = [...settlements].slice(0, 5);

  const customerStats = useMemo(() => {
    const map = new Map<string, number>();

    productions.forEach((row) => {
      const name = row.customer_name || "미지정";
      map.set(name, (map.get(name) || 0) + getQty(row));
    });

    return Array.from(map.entries())
      .map(([name, qty]) => ({
        name,
        qty,
        rate: totalQty > 0 ? (qty / totalQty) * 100 : 0,
      }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [productions, totalQty]);

  const itemTop5 = useMemo(() => {
    const map = new Map<string, number>();

    productions.forEach((row) => {
      const name = row.item_name || "미지정";
      map.set(name, (map.get(name) || 0) + getQty(row));
    });

    return Array.from(map.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [productions]);

  const recent7Days = useMemo(() => {
    const map = new Map<string, number>();

    productions.forEach((row) => {
      const date = getDate(row);
      if (date !== "-") {
        map.set(date, (map.get(date) || 0) + getQty(row));
      }
    });

    return Array.from(map.entries())
      .map(([date, qty]) => ({ date, qty }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 7)
      .reverse();
  }, [productions]);

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
    <main style={{ padding: "30px", maxWidth: "1250px", margin: "0 auto" }}>
      <div style={{ marginBottom: "25px" }}>
        <h1 style={{ fontSize: "30px", fontWeight: "bold", marginBottom: "8px" }}>
          연호 ERP 대시보드
        </h1>
        <p style={{ color: "#666" }}>
          생산량, 예상 정산금액, 거래처별 비중, 품목별 실적을 한눈에 확인합니다.
        </p>
      </div>

      <div style={{ marginBottom: "25px", display: "flex", gap: "10px", alignItems: "center" }}>
        <label style={{ fontWeight: "bold" }}>조회월</label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          style={inputStyle}
        />
        <button onClick={loadDashboard} style={blackButtonStyle}>
          새로고침
        </button>
      </div>

      <section style={cardGridStyle}>
        <div style={cardStyle}>
          <div style={cardTitleStyle}>이번달 생산량</div>
          <div style={cardValueStyle}>{number(totalQty)} EA</div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitleStyle}>예상 생산금액</div>
          <div style={cardValueStyle}>{money(expectedProductionAmount)}</div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitleStyle}>목표 생산량</div>
          <div style={cardValueStyle}>{number(TARGET_QTY)} EA</div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitleStyle}>목표 달성률</div>
          <div style={cardValueStyle}>{achievementRate.toFixed(1)}%</div>
          <div style={progressOuterStyle}>
            <div style={{ ...progressInnerStyle, width: `${achievementRate}%` }} />
          </div>
        </div>
      </section>

      {loading && <div style={{ marginBottom: "20px", color: "#666" }}>데이터를 불러오는 중입니다.</div>}

      <section style={twoColumnStyle}>
        <div style={boxStyle}>
          <h2 style={sectionTitleStyle}>거래처별 생산 비중</h2>

          {customerStats.length === 0 ? (
            <p style={emptyStyle}>거래처별 생산 데이터가 없습니다.</p>
          ) : (
            customerStats.map((row) => (
              <div key={row.name} style={{ marginBottom: "14px" }}>
                <div style={barLabelStyle}>
                  <span>{row.name}</span>
                  <strong>
                    {number(row.qty)} EA / {row.rate.toFixed(1)}%
                  </strong>
                </div>
                <div style={progressOuterStyle}>
                  <div style={{ ...progressInnerStyle, width: `${row.rate}%` }} />
                </div>
              </div>
            ))
          )}
        </div>

        <div style={boxStyle}>
          <h2 style={sectionTitleStyle}>품목별 생산 TOP 5</h2>

          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>순위</th>
                <th style={thStyle}>품목</th>
                <th style={thStyle}>수량</th>
              </tr>
            </thead>
            <tbody>
              {itemTop5.length === 0 ? (
                <tr>
                  <td style={tdStyle} colSpan={3}>품목별 생산 데이터가 없습니다.</td>
                </tr>
              ) : (
                itemTop5.map((row, index) => (
                  <tr key={row.name}>
                    <td style={tdStyle}>{index + 1}</td>
                    <td style={tdStyle}>{row.name}</td>
                    <td style={{ ...tdStyle, textAlign: "right", fontWeight: "bold" }}>
                      {number(row.qty)} EA
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ ...boxStyle, marginTop: "20px" }}>
        <h2 style={sectionTitleStyle}>최근 7일 생산 추이</h2>

        {recent7Days.length === 0 ? (
          <p style={emptyStyle}>최근 생산 추이 데이터가 없습니다.</p>
        ) : (
          recent7Days.map((row) => {
            const maxQty = Math.max(...recent7Days.map((x) => x.qty), 1);
            const rate = (row.qty / maxQty) * 100;

            return (
              <div key={row.date} style={{ marginBottom: "12px" }}>
                <div style={barLabelStyle}>
                  <span>{row.date}</span>
                  <strong>{number(row.qty)} EA</strong>
                </div>
                <div style={progressOuterStyle}>
                  <div style={{ ...progressInnerStyle, width: `${rate}%` }} />
                </div>
              </div>
            );
          })
        )}
      </section>

      <section style={twoColumnStyle}>
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
                  <td style={tdStyle} colSpan={4}>생산일보 내역이 없습니다.</td>
                </tr>
              ) : (
                recentProductions.map((row, index) => (
                  <tr key={row.id ?? index}>
                    <td style={tdStyle}>{getDate(row)}</td>
                    <td style={tdStyle}>{row.item_name ?? "-"}</td>
                    <td style={tdStyle}>{row.customer_name ?? "-"}</td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>{number(getQty(row))}</td>
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
                  <td style={tdStyle} colSpan={4}>정산 내역이 없습니다.</td>
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
                    <td style={tdStyle}>{row.created_at ? row.created_at.slice(0, 10) : "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginTop: "25px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <a href="/production" style={linkButtonStyle}>생산일보 입력</a>
        <a href="/settlement" style={linkButtonStyle}>정산관리</a>
        <a href="/items" style={linkButtonStyle}>품목관리</a>
        <a href="/customers" style={linkButtonStyle}>거래처관리</a>
      </section>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  border: "1px solid #ccc",
  borderRadius: "6px",
};

const blackButtonStyle: React.CSSProperties = {
  padding: "9px 16px",
  background: "#111827",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const cardGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "15px",
  marginBottom: "25px",
};

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

const twoColumnStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px",
  marginTop: "20px",
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

const progressOuterStyle: React.CSSProperties = {
  width: "100%",
  height: "10px",
  background: "#e5e7eb",
  borderRadius: "999px",
  overflow: "hidden",
  marginTop: "8px",
};

const progressInnerStyle: React.CSSProperties = {
  height: "100%",
  background: "#2563eb",
  borderRadius: "999px",
};

const barLabelStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "14px",
  marginBottom: "5px",
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

const emptyStyle: React.CSSProperties = {
  color: "#777",
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