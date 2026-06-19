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

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
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

function groupBy(productions: Production[], key: keyof Production) {
  const map = new Map<string, number>();

  productions.forEach((row) => {
    const name = String(row[key] ?? "미지정");
    map.set(name, (map.get(name) || 0) + getQty(row));
  });

  return Array.from(map.entries())
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty);
}

export default function StatisticsPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(false);

  const totalQty = productions.reduce((sum, row) => sum + getQty(row), 0);

  const itemStats = useMemo(() => groupBy(productions, "item_name"), [productions]);
  const customerStats = useMemo(() => groupBy(productions, "customer_name"), [productions]);
  const lineStats = useMemo(() => groupBy(productions, "line_name"), [productions]);

  const dailyStats = useMemo(() => {
    const map = new Map<string, number>();

    productions.forEach((row) => {
      const date = getDate(row);
      map.set(date, (map.get(date) || 0) + getQty(row));
    });

    return Array.from(map.entries())
      .map(([date, qty]) => ({ date, qty }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [productions]);

  async function loadProductions() {
    setLoading(true);

    try {
      const res = await fetch(`/api/productions?month=${month}`);
      const data = await res.json();
      setProductions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      alert("생산통계 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProductions();
  }, [month]);

  return (
    <main style={{ padding: "30px", maxWidth: "1250px", margin: "0 auto" }}>
      <div style={{ marginBottom: "25px" }}>
        <h1 style={{ fontSize: "30px", fontWeight: "bold", marginBottom: "8px" }}>
          생산통계
        </h1>
        <p style={{ color: "#666" }}>
          월별, 일자별, 품목별, 거래처별, 라인별 생산수량을 확인합니다.
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
        <button onClick={loadProductions} style={blackButtonStyle}>
          새로고침
        </button>
      </div>

      <section style={cardGridStyle}>
        <div style={cardStyle}>
          <div style={cardTitleStyle}>조회월</div>
          <div style={cardValueStyle}>{month}</div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitleStyle}>총 생산수량</div>
          <div style={cardValueStyle}>{number(totalQty)} EA</div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitleStyle}>생산일보 건수</div>
          <div style={cardValueStyle}>{number(productions.length)}건</div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitleStyle}>품목 수</div>
          <div style={cardValueStyle}>{number(itemStats.length)}개</div>
        </div>
      </section>

      {loading && (
        <div style={{ marginBottom: "20px", color: "#666" }}>
          데이터를 불러오는 중입니다.
        </div>
      )}

      <section style={boxStyle}>
        <h2 style={sectionTitleStyle}>일자별 생산현황</h2>
        <StatsTable titleName="일자" rows={dailyStats} totalQty={totalQty} />
      </section>

      <section style={twoColumnStyle}>
        <div style={boxStyle}>
          <h2 style={sectionTitleStyle}>품목별 생산현황</h2>
          <StatsTable titleName="품목" rows={itemStats} totalQty={totalQty} />
        </div>

        <div style={boxStyle}>
          <h2 style={sectionTitleStyle}>거래처별 생산현황</h2>
          <StatsTable titleName="거래처" rows={customerStats} totalQty={totalQty} />
        </div>
      </section>

      <section style={{ ...boxStyle, marginTop: "20px" }}>
        <h2 style={sectionTitleStyle}>라인별 생산현황</h2>
        <StatsTable titleName="라인" rows={lineStats} totalQty={totalQty} />
      </section>

      <section style={{ marginTop: "25px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <a href="/" style={linkButtonStyle}>대시보드</a>
        <a href="/production" style={linkButtonStyle}>생산일보 입력</a>
        <a href="/settlement" style={linkButtonStyle}>정산관리</a>
      </section>
    </main>
  );
}

function StatsTable({
  titleName,
  rows,
  totalQty,
}: {
  titleName: string;
  rows: { name?: string; date?: string; qty: number }[];
  totalQty: number;
}) {
  if (rows.length === 0) {
    return <p style={emptyStyle}>생산 데이터가 없습니다.</p>;
  }

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>{titleName}</th>
          <th style={thStyle}>생산수량</th>
          <th style={thStyle}>비율</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => {
          const label = row.name ?? row.date ?? "-";
          const rate = totalQty > 0 ? (row.qty / totalQty) * 100 : 0;

          return (
            <tr key={`${label}-${index}`}>
              <td style={tdStyle}>{label}</td>
              <td style={{ ...tdStyle, textAlign: "right", fontWeight: "bold" }}>
                {number(row.qty)} EA
              </td>
              <td style={{ ...tdStyle, width: "220px" }}>
                <div style={rateWrapStyle}>
                  <span style={{ width: "55px", display: "inline-block" }}>
                    {rate.toFixed(1)}%
                  </span>
                  <div style={progressOuterStyle}>
                    <div style={{ ...progressInnerStyle, width: `${rate}%` }} />
                  </div>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
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

const rateWrapStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const progressOuterStyle: React.CSSProperties = {
  width: "140px",
  height: "9px",
  background: "#e5e7eb",
  borderRadius: "999px",
  overflow: "hidden",
};

const progressInnerStyle: React.CSSProperties = {
  height: "100%",
  background: "#2563eb",
  borderRadius: "999px",
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