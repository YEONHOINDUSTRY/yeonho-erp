"use client";

import { useEffect, useMemo, useState } from "react";

type Site = {
  id: number;
  name: string;
};

type Line = {
  id: number;
  name: string;
  site_id?: number;
};

type Item = {
  id: number;
  item_no: string;
  item_name: string;
  customer_name: string;
};

type PlanRow = {
  lineId: string;
  lineName: string;
  itemId: string;
  itemNo: string;
  itemName: string;
  customerName: string;
  monQty: number;
  tueQty: number;
  wedQty: number;
  thuQty: number;
  friQty: number;
  satQty: number;
  sunQty: number;
  memo: string;
};

type SavedPlan = {
  id: number;
  site_id: number;
  vendor_name: string;
  plan_name: string;
  start_date: string;
  end_date: string;
  plan_start_date?: string;
  plan_end_date?: string;
  writer: string;
  created_at: string;
  updated_at: string;
};

const emptyRow: PlanRow = {
  lineId: "",
  lineName: "",
  itemId: "",
  itemNo: "",
  itemName: "",
  customerName: "",
  monQty: 0,
  tueQty: 0,
  wedQty: 0,
  thuQty: 0,
  friQty: 0,
  satQty: 0,
  sunQty: 0,
  memo: "",
};

export default function ProductionPlansPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [plans, setPlans] = useState<SavedPlan[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [siteId, setSiteId] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [planName, setPlanName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [writer, setWriter] = useState("");

  const [rows, setRows] = useState<PlanRow[]>([{ ...emptyRow }]);

  const [searchPlanName, setSearchPlanName] = useState("");
  const [searchStartDate, setSearchStartDate] = useState("");
  const [searchEndDate, setSearchEndDate] = useState("");

  const selectedSiteName = useMemo(() => {
    return sites.find((site) => String(site.id) === String(siteId))?.name || "";
  }, [sites, siteId]);

  const filteredLines = useMemo(() => {
    if (!siteId) return lines;
    return lines.filter((line) => String(line.site_id || "") === String(siteId));
  }, [lines, siteId]);

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const planStart = plan.start_date || plan.plan_start_date || "";
      const planEnd = plan.end_date || plan.plan_end_date || "";

      const nameOk =
        !searchPlanName ||
        String(plan.plan_name || "")
          .toLowerCase()
          .includes(searchPlanName.toLowerCase());

      const startOk = !searchStartDate || planStart >= searchStartDate;
      const endOk = !searchEndDate || planEnd <= searchEndDate;

      return nameOk && startOk && endOk;
    });
  }, [plans, searchPlanName, searchStartDate, searchEndDate]);

  const grandTotal = useMemo(() => {
    return rows.reduce((sum, row) => sum + rowTotal(row), 0);
  }, [rows]);

  useEffect(() => {
    loadBaseData();
  }, []);

  useEffect(() => {
    loadPlans();
  }, [siteId]);

  async function loadBaseData() {
    const [siteRes, lineRes, itemRes] = await Promise.all([
      fetch("/api/sites"),
      fetch("/api/lines"),
      fetch("/api/items"),
    ]);

    if (siteRes.ok) {
      const siteData = await siteRes.json();
      setSites(
        siteData.map((site: any) => ({
          id: site.id,
          name: site.name || site.site_name || site.business_name || "",
        }))
      );
    }

    if (lineRes.ok) {
      const lineData = await lineRes.json();
      setLines(
        lineData.map((line: any) => ({
          id: line.id,
          name: line.name || line.line_name || "",
          site_id: line.site_id,
        }))
      );
    }

    if (itemRes.ok) {
      const itemData = await itemRes.json();
      setItems(
        itemData.map((item: any) => ({
          id: item.id,
          item_no: item.item_no,
          item_name: item.item_name,
          customer_name: item.customer_name,
        }))
      );
    }
  }

  async function loadPlans() {
    const url = siteId
      ? `/api/production-plans?siteId=${siteId}`
      : "/api/production-plans";

    const res = await fetch(url);
    if (!res.ok) return;

    const data = await res.json();
    setPlans(data);
  }

  function resetForm() {
    setEditingId(null);
    setVendorName("");
    setPlanName("");
    setStartDate("");
    setEndDate("");
    setWriter("");
    setRows([{ ...emptyRow }]);
  }

  function addRow() {
    setRows((prev) => [...prev, { ...emptyRow }]);
  }

  function removeRow(index: number) {
    if (rows.length === 1) {
      alert("최소 1개 행은 필요합니다.");
      return;
    }

    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function updateRow(index: number, key: keyof PlanRow, value: any) {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        return { ...row, [key]: value };
      })
    );
  }

  function handleLineChange(index: number, selectedLineId: string) {
    const selected = lines.find((line) => String(line.id) === selectedLineId);

    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;

        return {
          ...row,
          lineId: selectedLineId,
          lineName: selected?.name || "",
        };
      })
    );
  }

  function handleItemChange(index: number, selectedItemId: string) {
    const selected = items.find((item) => String(item.id) === selectedItemId);

    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;

        return {
          ...row,
          itemId: selectedItemId,
          itemNo: selected?.item_no || "",
          itemName: selected?.item_name || "",
          customerName: selected?.customer_name || "",
        };
      })
    );
  }

  function getDayLabel(dayIndex: number, label: string) {
    if (!startDate) return label;

    const base = new Date(startDate);
    base.setDate(base.getDate() + dayIndex);

    const month = String(base.getMonth() + 1).padStart(2, "0");
    const day = String(base.getDate()).padStart(2, "0");

    return `${label}(${month}/${day})`;
  }

  function rowTotal(row: PlanRow) {
    return (
      Number(row.monQty || 0) +
      Number(row.tueQty || 0) +
      Number(row.wedQty || 0) +
      Number(row.thuQty || 0) +
      Number(row.friQty || 0) +
      Number(row.satQty || 0) +
      Number(row.sunQty || 0)
    );
  }

  function formatNumber(value: number) {
    return Number(value || 0).toLocaleString();
  }

  function getPlanPeriod(plan: SavedPlan) {
    const start = plan.start_date || plan.plan_start_date || "-";
    const end = plan.end_date || plan.plan_end_date || "-";
    return `${start} ~ ${end}`;
  }

  async function savePlan() {
    if (!siteId) {
      alert("사업장을 선택하세요.");
      return;
    }

    if (!planName.trim()) {
      alert("생산계획명을 입력하세요.");
      return;
    }

    if (!startDate || !endDate) {
      alert("시작일과 종료일을 입력하세요.");
      return;
    }

    const validRows = rows.filter(
      (row) => row.lineName || row.itemNo || row.itemName || rowTotal(row) > 0
    );

    if (validRows.length === 0) {
      alert("저장할 생산계획 행이 없습니다.");
      return;
    }

    const payload = {
      siteId,
      vendorName,
      planName,
      startDate,
      endDate,
      writer,
      details: validRows,
    };

    const url = editingId
      ? `/api/production-plans/${editingId}`
      : "/api/production-plans";

    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => null);
      alert(error?.error || "저장 중 오류가 발생했습니다.");
      return;
    }

    const savedData = await res.json().catch(() => null);

    if (!editingId && savedData?.id) {
      setEditingId(savedData.id);
    }

    alert(editingId ? "생산계획이 수정되었습니다." : "생산계획이 저장되었습니다.");
    await loadPlans();
  }

  async function loadPlanDetail(id: number) {
    const res = await fetch(`/api/production-plans/${id}`);

    if (!res.ok) {
      alert("생산계획을 불러오지 못했습니다.");
      return;
    }

    const data = await res.json();
    const header = data.header;
    const details = data.details || [];

    setEditingId(header.id);
    setSiteId(String(header.site_id || ""));
    setVendorName(header.vendor_name || "");
    setPlanName(header.plan_name || "");
    setStartDate(header.start_date || header.plan_start_date || "");
    setEndDate(header.end_date || header.plan_end_date || "");
    setWriter(header.writer || "");

    setRows(
      details.length > 0
        ? details.map((row: any) => ({
            lineId: row.line_id ? String(row.line_id) : "",
            lineName: row.line_name || "",
            itemId: row.item_id ? String(row.item_id) : "",
            itemNo: row.item_no || "",
            itemName: row.item_name || "",
            customerName: row.customer_name || "",
            monQty: Number(row.mon_qty || 0),
            tueQty: Number(row.tue_qty || 0),
            wedQty: Number(row.wed_qty || 0),
            thuQty: Number(row.thu_qty || 0),
            friQty: Number(row.fri_qty || 0),
            satQty: Number(row.sat_qty || 0),
            sunQty: Number(row.sun_qty || 0),
            memo: row.memo || "",
          }))
        : [{ ...emptyRow }]
    );

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deletePlan(id: number) {
    if (!confirm("선택한 생산계획을 삭제하시겠습니까?")) return;

    const res = await fetch(`/api/production-plans/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("삭제 중 오류가 발생했습니다.");
      return;
    }

    alert("삭제되었습니다.");
    await loadPlans();

    if (editingId === id) {
      resetForm();
    }
  }

  async function copyPlan(id: number) {
    const res = await fetch(`/api/production-plans/${id}/copy`, {
      method: "POST",
    });

    if (!res.ok) {
      alert("복사 중 오류가 발생했습니다.");
      return;
    }

    const data = await res.json().catch(() => null);
    alert("복사되었습니다.");
    await loadPlans();

    if (data?.id) {
      await loadPlanDetail(data.id);
    }
  }

  function printPlan() {
    if (!editingId) {
      alert("저장된 생산계획만 인쇄할 수 있습니다. 먼저 저장하거나 목록에서 불러오십시오.");
      return;
    }

    window.open(`/production-plan-print?id=${editingId}`, "_blank");
  }

  function printSavedPlan(id: number) {
    window.open(`/production-plan-print?id=${id}`, "_blank");
  }

  function clearSearch() {
    setSearchPlanName("");
    setSearchStartDate("");
    setSearchEndDate("");
  }

  return (
    <main className="page">
      <style jsx>{`
        .page {
          padding: 24px;
          background: #f3f4f6;
          min-height: 100vh;
          color: #111827;
        }

        .title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
        }

        .title {
          font-size: 26px;
          font-weight: 800;
          margin: 0;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 13px;
          font-weight: 800;
          background: ${editingId ? "#dcfce7" : "#e5e7eb"};
          color: ${editingId ? "#166534" : "#374151"};
        }

        .card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 18px;
          margin-bottom: 18px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .card-title {
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 14px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .field label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 5px;
          color: #374151;
        }

        input,
        select {
          width: 100%;
          height: 38px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 0 10px;
          font-size: 14px;
          background: white;
        }

        .button-row {
          display: flex;
          gap: 8px;
          margin-top: 14px;
          flex-wrap: wrap;
        }

        button {
          border: none;
          border-radius: 8px;
          padding: 9px 14px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-primary {
          background: #2563eb;
          color: white;
        }

        .btn-secondary {
          background: #374151;
          color: white;
        }

        .btn-light {
          background: #e5e7eb;
          color: #111827;
        }

        .btn-danger {
          background: #dc2626;
          color: white;
        }

        .btn-copy {
          background: #059669;
          color: white;
        }

        .btn-print {
          background: #7c3aed;
          color: white;
        }

        .table-wrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          background: white;
        }

        th {
          background: #111827;
          color: white;
          padding: 9px 6px;
          border: 1px solid #374151;
          white-space: nowrap;
        }

        td {
          border: 1px solid #d1d5db;
          padding: 6px;
          text-align: center;
          vertical-align: middle;
        }

        td input,
        td select {
          height: 32px;
          font-size: 13px;
          border-radius: 6px;
        }

        .num {
          text-align: right;
        }

        .total-cell {
          font-weight: 800;
          background: #fef3c7;
        }

        .summary-box {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-top: 14px;
        }

        .summary-item {
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 12px;
          background: #f9fafb;
        }

        .summary-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .summary-value {
          font-size: 18px;
          font-weight: 900;
        }

        .list-table button {
          padding: 6px 9px;
          font-size: 12px;
        }

        .muted {
          color: #6b7280;
          font-size: 13px;
        }

        .left {
          text-align: left;
        }

        .small-text {
          font-size: 12px;
          color: #6b7280;
        }

        @media (max-width: 1100px) {
          .form-grid,
          .summary-box {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="title-row">
        <h1 className="title">생산계획관리</h1>
        <div className="status-badge">
          {editingId ? `수정 중 · 계획번호 ${editingId}` : "신규 작성"}
        </div>
      </div>

      <section className="card">
        <div className="card-title">① 생산계획 기본정보</div>

        <div className="form-grid">
          <div className="field">
            <label>사업장</label>
            <select value={siteId} onChange={(e) => setSiteId(e.target.value)}>
              <option value="">사업장 선택</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>출력 업체명</label>
            <input
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder="예: 태창금속"
            />
          </div>

          <div className="field">
            <label>생산계획명</label>
            <input
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="예: 2026년 6월 4주 생산계획"
            />
          </div>

          <div className="field">
            <label>시작일</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="field">
            <label>종료일</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="field">
            <label>작성자</label>
            <input
              value={writer}
              onChange={(e) => setWriter(e.target.value)}
              placeholder="작성자"
            />
          </div>
        </div>

        <div className="summary-box">
          <div className="summary-item">
            <div className="summary-label">선택 사업장</div>
            <div className="summary-value">{selectedSiteName || "-"}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">계획 행 수</div>
            <div className="summary-value">{rows.length.toLocaleString()}행</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">총 계획수량</div>
            <div className="summary-value">{formatNumber(grandTotal)} EA</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">인쇄 상태</div>
            <div className="summary-value">{editingId ? "가능" : "저장 필요"}</div>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-title">② 주간 생산계획 입력</div>

        <div className="button-row">
          <button className="btn-light" onClick={addRow}>
            행 추가
          </button>
          <button className="btn-primary" onClick={savePlan}>
            {editingId ? "수정 저장" : "저장"}
          </button>
          <button className="btn-secondary" onClick={resetForm}>
            신규 작성
          </button>
          <button className="btn-print" onClick={printPlan}>
            인쇄
          </button>
        </div>

        <div className="table-wrap" style={{ marginTop: 14 }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: 110 }}>라인</th>
                <th style={{ width: 150 }}>품번</th>
                <th style={{ width: 180 }}>품명</th>
                <th style={{ width: 140 }}>거래처</th>
                <th>{getDayLabel(0, "월")}</th>
                <th>{getDayLabel(1, "화")}</th>
                <th>{getDayLabel(2, "수")}</th>
                <th>{getDayLabel(3, "목")}</th>
                <th>{getDayLabel(4, "금")}</th>
                <th>{getDayLabel(5, "토")}</th>
                <th>{getDayLabel(6, "일")}</th>
                <th>합계</th>
                <th style={{ width: 160 }}>비고</th>
                <th style={{ width: 70 }}>삭제</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td>
                    <select
                      value={row.lineId}
                      onChange={(e) => handleLineChange(index, e.target.value)}
                    >
                      <option value="">선택</option>
                      {filteredLines.map((line) => (
                        <option key={line.id} value={line.id}>
                          {line.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <select
                      value={row.itemId}
                      onChange={(e) => handleItemChange(index, e.target.value)}
                    >
                      <option value="">품목 선택</option>
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.item_no}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>{row.itemName}</td>
                  <td>{row.customerName}</td>

                  {[
                    "monQty",
                    "tueQty",
                    "wedQty",
                    "thuQty",
                    "friQty",
                    "satQty",
                    "sunQty",
                  ].map((key) => (
                    <td key={key}>
                      <input
                        className="num"
                        type="number"
                        value={row[key as keyof PlanRow] as number}
                        onChange={(e) =>
                          updateRow(
                            index,
                            key as keyof PlanRow,
                            Number(e.target.value || 0)
                          )
                        }
                      />
                    </td>
                  ))}

                  <td className="total-cell">{formatNumber(rowTotal(row))}</td>

                  <td>
                    <input
                      value={row.memo}
                      onChange={(e) =>
                        updateRow(index, "memo", e.target.value)
                      }
                    />
                  </td>

                  <td>
                    <button
                      className="btn-danger"
                      onClick={() => removeRow(index)}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}

              <tr>
                <td colSpan={11} style={{ textAlign: "right", fontWeight: 800 }}>
                  전체 합계
                </td>
                <td className="total-cell">{formatNumber(grandTotal)}</td>
                <td colSpan={2}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <div className="card-title">③ 저장된 생산계획 검색</div>

        <div className="form-grid">
          <div className="field">
            <label>계획명 검색</label>
            <input
              value={searchPlanName}
              onChange={(e) => setSearchPlanName(e.target.value)}
              placeholder="생산계획명 입력"
            />
          </div>

          <div className="field">
            <label>시작일 이후</label>
            <input
              type="date"
              value={searchStartDate}
              onChange={(e) => setSearchStartDate(e.target.value)}
            />
          </div>

          <div className="field">
            <label>종료일 이전</label>
            <input
              type="date"
              value={searchEndDate}
              onChange={(e) => setSearchEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="button-row">
          <button className="btn-light" onClick={clearSearch}>
            검색 초기화
          </button>
          <button className="btn-secondary" onClick={loadPlans}>
            목록 새로고침
          </button>
        </div>
      </section>

      <section className="card">
        <div className="card-title">④ 저장된 생산계획 목록</div>

        {filteredPlans.length === 0 ? (
          <p className="muted">저장된 생산계획이 없습니다.</p>
        ) : (
          <div className="table-wrap">
            <table className="list-table">
              <thead>
                <tr>
                  <th>번호</th>
                  <th>사업장</th>
                  <th>업체명</th>
                  <th>생산계획명</th>
                  <th>기간</th>
                  <th>작성자</th>
                  <th>불러오기</th>
                  <th>인쇄</th>
                  <th>복사</th>
                  <th>삭제</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlans.map((plan) => (
                  <tr key={plan.id}>
                    <td>{plan.id}</td>
                    <td>
                      {sites.find((site) => String(site.id) === String(plan.site_id))
                        ?.name || plan.site_id}
                    </td>
                    <td>{plan.vendor_name}</td>
                    <td className="left" style={{ fontWeight: 700 }}>
                      {plan.plan_name}
                    </td>
                    <td>{getPlanPeriod(plan)}</td>
                    <td>{plan.writer}</td>
                    <td>
                      <button
                        className="btn-primary"
                        onClick={() => loadPlanDetail(plan.id)}
                      >
                        불러오기
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn-print"
                        onClick={() => printSavedPlan(plan.id)}
                      >
                        인쇄
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn-copy"
                        onClick={() => copyPlan(plan.id)}
                      >
                        복사
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn-danger"
                        onClick={() => deletePlan(plan.id)}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="small-text" style={{ marginTop: 10 }}>
              검색 결과: {filteredPlans.length.toLocaleString()}건 / 전체{" "}
              {plans.length.toLocaleString()}건
            </p>
          </div>
        )}
      </section>
    </main>
  );
}