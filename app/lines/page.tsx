"use client";

import { useEffect, useMemo, useState } from "react";

type Site = {
  id: number;
  name: string;
};

type Line = {
  id: number;
  site_id: number;
  name: string;
  line_name: string;
  description: string;
  is_active: number;
};

export default function LinesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [lines, setLines] = useState<Line[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [siteId, setSiteId] = useState("");
  const [lineName, setLineName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [searchSiteId, setSearchSiteId] = useState("");

  const filteredLines = useMemo(() => {
    if (!searchSiteId) return lines;
    return lines.filter((line) => String(line.site_id) === String(searchSiteId));
  }, [lines, searchSiteId]);

  useEffect(() => {
    loadSites();
    loadLines();
  }, []);

  async function loadSites() {
    const res = await fetch("/api/sites");
    if (!res.ok) return;

    const data = await res.json();
    setSites(
      data.map((site: any) => ({
        id: site.id,
        name: site.name || site.site_name || "",
      }))
    );
  }

  async function loadLines() {
    const res = await fetch("/api/lines");
    if (!res.ok) return;

    const data = await res.json();
    setLines(data);
  }

  function resetForm() {
    setEditingId(null);
    setSiteId("");
    setLineName("");
    setDescription("");
    setIsActive(true);
  }

  function loadLine(line: Line) {
    setEditingId(line.id);
    setSiteId(String(line.site_id || ""));
    setLineName(line.line_name || line.name || "");
    setDescription(line.description || "");
    setIsActive(Number(line.is_active) === 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function getSiteName(id: number) {
    return sites.find((site) => String(site.id) === String(id))?.name || id;
  }

  async function saveLine() {
    if (!siteId) {
      alert("사업장을 선택하세요.");
      return;
    }

    if (!lineName.trim()) {
      alert("라인명을 입력하세요.");
      return;
    }

    const payload = {
      siteId,
      lineName,
      description,
      isActive,
    };

    const url = editingId ? `/api/lines/${editingId}` : "/api/lines";
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

    alert(editingId ? "생산라인이 수정되었습니다." : "생산라인이 등록되었습니다.");
    resetForm();
    await loadLines();
  }

  async function deleteLine(id: number) {
    if (!confirm("선택한 생산라인을 삭제하시겠습니까?")) return;

    const res = await fetch(`/api/lines/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("삭제 중 오류가 발생했습니다.");
      return;
    }

    alert("삭제되었습니다.");
    await loadLines();

    if (editingId === id) {
      resetForm();
    }
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
          margin-bottom: 18px;
        }

        h1 {
          margin: 0;
          font-size: 26px;
          font-weight: 900;
        }

        .badge {
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
          font-weight: 900;
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
        select,
        textarea {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 0 10px;
          font-size: 14px;
          background: white;
        }

        input,
        select {
          height: 38px;
        }

        textarea {
          height: 82px;
          padding-top: 10px;
          resize: vertical;
        }

        .full {
          grid-column: 1 / -1;
        }

        .button-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 14px;
        }

        button {
          border: none;
          border-radius: 8px;
          padding: 9px 14px;
          font-size: 14px;
          font-weight: 800;
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
          padding: 7px;
          text-align: center;
          vertical-align: middle;
        }

        .left {
          text-align: left;
        }

        .table-wrap {
          overflow-x: auto;
        }

        .muted {
          color: #6b7280;
          font-size: 13px;
        }

        .active {
          color: #166534;
          font-weight: 900;
        }

        .inactive {
          color: #991b1b;
          font-weight: 900;
        }

        @media (max-width: 1000px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="title-row">
        <h1>생산라인관리</h1>
        <div className="badge">
          {editingId ? `수정 중 · 라인번호 ${editingId}` : "신규 등록"}
        </div>
      </div>

      <section className="card">
        <div className="card-title">① 생산라인 기본정보</div>

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
            <label>라인명</label>
            <input
              value={lineName}
              onChange={(e) => setLineName(e.target.value)}
              placeholder="예: 1000톤 1호기"
            />
          </div>

          <div className="field">
            <label>가동상태</label>
            <select
              value={isActive ? "1" : "0"}
              onChange={(e) => setIsActive(e.target.value === "1")}
            >
              <option value="1">사용</option>
              <option value="0">미사용</option>
            </select>
          </div>

          <div className="field full">
            <label>설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="예: 프레스 자동화 라인, 로봇 연동, 야간조 사용 등"
            />
          </div>
        </div>

        <div className="button-row">
          <button className="btn-light" onClick={resetForm}>
            신규
          </button>
          <button className="btn-primary" onClick={saveLine}>
            {editingId ? "수정 저장" : "등록"}
          </button>
          {editingId && (
            <button className="btn-danger" onClick={() => deleteLine(editingId)}>
              삭제
            </button>
          )}
        </div>
      </section>

      <section className="card">
        <div className="card-title">② 생산라인 검색</div>

        <div className="form-grid">
          <div className="field">
            <label>사업장별 조회</label>
            <select
              value={searchSiteId}
              onChange={(e) => setSearchSiteId(e.target.value)}
            >
              <option value="">전체 사업장</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-title">③ 생산라인 목록</div>

        {filteredLines.length === 0 ? (
          <p className="muted">등록된 생산라인이 없습니다.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>번호</th>
                  <th>사업장</th>
                  <th>라인명</th>
                  <th>설명</th>
                  <th>상태</th>
                  <th>불러오기</th>
                  <th>삭제</th>
                </tr>
              </thead>
              <tbody>
                {filteredLines.map((line) => (
                  <tr key={line.id}>
                    <td>{line.id}</td>
                    <td>{getSiteName(line.site_id)}</td>
                    <td className="left" style={{ fontWeight: 800 }}>
                      {line.line_name || line.name}
                    </td>
                    <td className="left">{line.description}</td>
                    <td>
                      {Number(line.is_active) === 1 ? (
                        <span className="active">사용</span>
                      ) : (
                        <span className="inactive">미사용</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn-primary"
                        onClick={() => loadLine(line)}
                      >
                        불러오기
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn-danger"
                        onClick={() => deleteLine(line.id)}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}