"use client";

import { useEffect, useState } from "react";

type Site = {
  id: number;
  name: string;
  customer_name: string;
  manager: string;
  phone: string;
  memo: string;
};

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [manager, setManager] = useState("");
  const [phone, setPhone] = useState("");
  const [memo, setMemo] = useState("");

  useEffect(() => {
    loadSites();
  }, []);

  async function loadSites() {
    const res = await fetch("/api/sites");
    if (!res.ok) return;

    const data = await res.json();
    setSites(data);
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setCustomerName("");
    setManager("");
    setPhone("");
    setMemo("");
  }

  function loadSite(site: Site) {
    setEditingId(site.id);
    setName(site.name || "");
    setCustomerName(site.customer_name || "");
    setManager(site.manager || "");
    setPhone(site.phone || "");
    setMemo(site.memo || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveSite() {
    if (!name.trim()) {
      alert("사업장명을 입력하세요.");
      return;
    }

    const payload = {
      name,
      customerName,
      manager,
      phone,
      memo,
    };

    const url = editingId ? `/api/sites/${editingId}` : "/api/sites";
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

    alert(editingId ? "사업장이 수정되었습니다." : "사업장이 등록되었습니다.");
    resetForm();
    await loadSites();
  }

  async function deleteSite(id: number) {
    if (!confirm("선택한 사업장을 삭제하시겠습니까?")) return;

    const res = await fetch(`/api/sites/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("삭제 중 오류가 발생했습니다.");
      return;
    }

    alert("삭제되었습니다.");
    await loadSites();

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
        textarea {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 0 10px;
          font-size: 14px;
          background: white;
        }

        input {
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

        @media (max-width: 1000px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="title-row">
        <h1>사업장관리</h1>
        <div className="badge">
          {editingId ? `수정 중 · 사업장번호 ${editingId}` : "신규 등록"}
        </div>
      </div>

      <section className="card">
        <div className="card-title">① 사업장 기본정보</div>

        <div className="form-grid">
          <div className="field">
            <label>사업장명</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 태창금속 당진공장"
            />
          </div>

          <div className="field">
            <label>거래처 / 원청</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="예: 태창금속, 호원오토"
            />
          </div>

          <div className="field">
            <label>담당자</label>
            <input
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              placeholder="예: 홍길동"
            />
          </div>

          <div className="field">
            <label>전화번호</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="예: 010-0000-0000"
            />
          </div>

          <div className="field full">
            <label>비고</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="사업장 특이사항, 계약 조건, 현장 메모 등"
            />
          </div>
        </div>

        <div className="button-row">
          <button className="btn-light" onClick={resetForm}>
            신규
          </button>
          <button className="btn-primary" onClick={saveSite}>
            {editingId ? "수정 저장" : "등록"}
          </button>
          {editingId && (
            <button className="btn-danger" onClick={() => deleteSite(editingId)}>
              삭제
            </button>
          )}
        </div>
      </section>

      <section className="card">
        <div className="card-title">② 사업장 목록</div>

        {sites.length === 0 ? (
          <p className="muted">등록된 사업장이 없습니다.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>번호</th>
                  <th>사업장명</th>
                  <th>거래처 / 원청</th>
                  <th>담당자</th>
                  <th>전화번호</th>
                  <th>비고</th>
                  <th>불러오기</th>
                  <th>삭제</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((site) => (
                  <tr key={site.id}>
                    <td>{site.id}</td>
                    <td className="left" style={{ fontWeight: 800 }}>
                      {site.name}
                    </td>
                    <td>{site.customer_name}</td>
                    <td>{site.manager}</td>
                    <td>{site.phone}</td>
                    <td className="left">{site.memo}</td>
                    <td>
                      <button
                        className="btn-primary"
                        onClick={() => loadSite(site)}
                      >
                        불러오기
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn-danger"
                        onClick={() => deleteSite(site.id)}
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