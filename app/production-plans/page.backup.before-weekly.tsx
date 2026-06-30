"use client";

import { useEffect, useState } from "react";

export default function ProductionPlansPage() {
  const [siteId, setSiteId] = useState("");
  const [planDate, setPlanDate] = useState("");
  const [planQty, setPlanQty] = useState("");

  const [lines, setLines] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);

  const [lineId, setLineId] = useState("");
  const [itemId, setItemId] = useState("");

  async function loadData() {
    const selectedSiteId = localStorage.getItem("selectedSiteId") || "";
    setSiteId(selectedSiteId);

    const lineRes = await fetch(`/api/lines?site_id=${selectedSiteId}`);
    const lineData = await lineRes.json();

    const itemRes = await fetch(`/api/items?site_id=${selectedSiteId}`);
    const itemData = await itemRes.json();

    const planRes = await fetch(`/api/production-plans?site_id=${selectedSiteId}`);
    const planData = await planRes.json();

    setLines(Array.isArray(lineData) ? lineData : []);
    setItems(Array.isArray(itemData) ? itemData : []);
    setPlans(Array.isArray(planData) ? planData : []);
  }

  async function savePlan() {
    if (!siteId) {
      alert("현재 사업장이 선택되지 않았습니다.");
      return;
    }

    if (!planDate || !lineId || !itemId || !planQty) {
      alert("계획일, 생산라인, 품목, 계획수량을 모두 입력하세요.");
      return;
    }

    const selectedLine = lines.find((x) => String(x.id) === lineId);
    const selectedItem = items.find((x) => String(x.id) === itemId);

    const res = await fetch("/api/production-plans", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        site_id: siteId,
        plan_date: planDate,
        line_id: lineId,
        line_name: selectedLine?.line_name || "",
        item_id: itemId,
        item_no: selectedItem?.item_no || "",
        item_name: selectedItem?.item_name || "",
        customer_name: selectedItem?.customer_name || "",
        plan_qty: Number(planQty),
        memo: "",
      }),
    });

    const result = await res.json();

    if (result.success) {
      alert("생산계획 저장 완료");
      setPlanQty("");
      await loadData();
    } else {
      alert(result.error || "저장 실패");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <main style={{ padding: "30px", maxWidth: "1100px", margin: "0 auto" }}>
      <h1 style={titleStyle}>생산계획 관리</h1>

      <section style={boxStyle}>
        <h2 style={sectionTitleStyle}>생산계획 등록</h2>

        <div style={formGridStyle}>
          <div>
            <label style={labelStyle}>현재 사업장 ID</label>
            <input value={siteId || "선택 안 됨"} readOnly style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>계획일</label>
            <input
              type="date"
              value={planDate}
              onChange={(e) => setPlanDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>생산라인</label>
            <select
              value={lineId}
              onChange={(e) => setLineId(e.target.value)}
              style={inputStyle}
            >
              <option value="">선택</option>
              {lines.map((line) => (
                <option key={line.id} value={line.id}>
                  {line.line_name}
                </option>
              ))}
            </select>
            {lines.length === 0 && (
              <p style={helpStyle}>현재 사업장에 등록된 생산라인이 없습니다.</p>
            )}
          </div>

          <div>
            <label style={labelStyle}>품목</label>
            <select
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              style={inputStyle}
            >
              <option value="">선택</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.item_name}
                </option>
              ))}
            </select>
            {items.length === 0 && (
              <p style={helpStyle}>현재 사업장에 등록된 품목이 없습니다.</p>
            )}
          </div>

          <div>
            <label style={labelStyle}>계획수량</label>
            <input
              type="number"
              value={planQty}
              onChange={(e) => setPlanQty(e.target.value)}
              style={inputStyle}
              placeholder="예: 15000"
            />
          </div>
        </div>

        <button onClick={savePlan} style={buttonStyle}>
          저장
        </button>
      </section>

      <section style={boxStyle}>
        <h2 style={sectionTitleStyle}>생산계획 목록</h2>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>계획일</th>
              <th style={thStyle}>라인</th>
              <th style={thStyle}>품목번호</th>
              <th style={thStyle}>품목명</th>
              <th style={thStyle}>거래처</th>
              <th style={thStyle}>계획수량</th>
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 ? (
              <tr>
                <td style={tdStyle} colSpan={6}>
                  등록된 생산계획이 없습니다.
                </td>
              </tr>
            ) : (
              plans.map((plan) => (
                <tr key={plan.id}>
                  <td style={tdStyle}>{plan.plan_date}</td>
                  <td style={tdStyle}>{plan.line_name}</td>
                  <td style={tdStyle}>{plan.item_no}</td>
                  <td style={tdStyle}>{plan.item_name}</td>
                  <td style={tdStyle}>{plan.customer_name}</td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: "bold" }}>
                    {Number(plan.plan_qty).toLocaleString("ko-KR")} EA
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}

const titleStyle: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: "bold",
  marginBottom: "20px",
};

const boxStyle: React.CSSProperties = {
  background: "white",
  border: "1px solid #ddd",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "20px",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "bold",
  marginBottom: "15px",
};

const formGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "15px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: "bold",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "38px",
  padding: "0 10px",
  border: "1px solid #ccc",
  borderRadius: "6px",
};

const helpStyle: React.CSSProperties = {
  color: "#b91c1c",
  fontSize: "13px",
  marginTop: "5px",
};

const buttonStyle: React.CSSProperties = {
  marginTop: "20px",
  padding: "10px 18px",
  background: "#111827",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
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
};

const tdStyle: React.CSSProperties = {
  borderBottom: "1px solid #eee",
  padding: "10px",
};