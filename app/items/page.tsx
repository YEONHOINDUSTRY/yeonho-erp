"use client";

import { useEffect, useMemo, useState } from "react";

type Site = {
  id: number;
  name: string;
};

type Item = {
  id: number;
  site_id: number | null;
  site_name?: string;
  customer_name: string;
  item_no: string;
  item_name: string;
  model_name: string;
  material: string;
  spec: string;
  process_name: string;
  unit: string;
  cycle_time: number;
  unit_price: number;
  is_active: number;
};

const emptyForm = {
  id: 0,
  site_id: "",
  customer_name: "",
  item_no: "",
  item_name: "",
  model_name: "",
  material: "",
  spec: "",
  process_name: "",
  unit: "EA",
  cycle_time: "",
  unit_price: "",
  is_active: "1",
};

export default function ItemsPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState<any>(emptyForm);

  const [searchSiteId, setSearchSiteId] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [searchItemNo, setSearchItemNo] = useState("");
  const [searchItemName, setSearchItemName] = useState("");

  const [message, setMessage] = useState("");

  const loadSites = async () => {
    const res = await fetch("/api/sites");
    const data = await res.json();
    setSites(Array.isArray(data) ? data : []);
  };

  const loadItems = async () => {
    const res = await fetch("/api/items");
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadSites();
    loadItems();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      return (
        (!searchSiteId || String(item.site_id ?? "") === searchSiteId) &&
        (!searchCustomer ||
          (item.customer_name ?? "").toLowerCase().includes(searchCustomer.toLowerCase())) &&
        (!searchItemNo ||
          (item.item_no ?? "").toLowerCase().includes(searchItemNo.toLowerCase())) &&
        (!searchItemName ||
          (item.item_name ?? "").toLowerCase().includes(searchItemName.toLowerCase()))
      );
    });
  }, [items, searchSiteId, searchCustomer, searchItemNo, searchItemName]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setMessage("");
  };

  const saveItem = async () => {
    if (!form.site_id) return setMessage("사업장을 선택하세요.");
    if (!form.customer_name.trim()) return setMessage("거래처를 입력하세요.");
    if (!form.item_no.trim()) return setMessage("품번을 입력하세요.");
    if (!form.item_name.trim()) return setMessage("품명을 입력하세요.");

    const payload = {
      site_id: Number(form.site_id),
      customer_name: form.customer_name.trim(),
      item_no: form.item_no.trim(),
      item_name: form.item_name.trim(),
      model_name: form.model_name.trim(),
      material: form.material.trim(),
      spec: form.spec.trim(),
      process_name: form.process_name.trim(),
      unit: form.unit.trim() || "EA",
      cycle_time: Number(form.cycle_time || 0),
      unit_price: Number(form.unit_price || 0),
      is_active: Number(form.is_active),
    };

    const res = await fetch(form.id ? `/api/items/${form.id}` : "/api/items", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return setMessage(err.error || "저장 중 오류가 발생했습니다.");
    }

    await loadItems();
    setMessage(form.id ? "품목이 수정되었습니다." : "품목이 등록되었습니다.");
    setForm(emptyForm);
  };

  const loadToForm = (item: Item) => {
    setForm({
      id: item.id,
      site_id: item.site_id ? String(item.site_id) : "",
      customer_name: item.customer_name ?? "",
      item_no: item.item_no ?? "",
      item_name: item.item_name ?? "",
      model_name: item.model_name ?? "",
      material: item.material ?? "",
      spec: item.spec ?? "",
      process_name: item.process_name ?? "",
      unit: item.unit ?? "EA",
      cycle_time: item.cycle_time ? String(item.cycle_time) : "",
      unit_price: item.unit_price ? String(item.unit_price) : "",
      is_active: String(item.is_active ?? 1),
    });

    setMessage("선택한 품목을 불러왔습니다.");
  };

  const deleteItem = async (id?: number) => {
    const targetId = id ?? form.id;

    if (!targetId) return setMessage("삭제할 품목을 먼저 불러오세요.");
    if (!confirm("선택한 품목을 삭제하시겠습니까?")) return;

    const res = await fetch(`/api/items/${targetId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return setMessage(err.error || "삭제 중 오류가 발생했습니다.");
    }

    await loadItems();
    setForm(emptyForm);
    setMessage("품목이 삭제되었습니다.");
  };

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>
        품목관리
      </h1>

      <section style={boxStyle}>
        <h2 style={sectionTitle}>① 품목 기본정보</h2>

        <div style={gridStyle}>
          <Field label="사업장">
            <select name="site_id" value={form.site_id} onChange={handleChange} style={inputStyle}>
              <option value="">선택</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
          </Field>

          <Input label="거래처" name="customer_name" value={form.customer_name} onChange={handleChange} />
          <Input label="차종" name="model_name" value={form.model_name} onChange={handleChange} />
          <Input label="품번" name="item_no" value={form.item_no} onChange={handleChange} />
          <Input label="품명" name="item_name" value={form.item_name} onChange={handleChange} />
          <Input label="재질" name="material" value={form.material} onChange={handleChange} />
          <Input label="규격" name="spec" value={form.spec} onChange={handleChange} />
          <Input label="공정" name="process_name" value={form.process_name} onChange={handleChange} />
          <Input label="단위" name="unit" value={form.unit} onChange={handleChange} />
          <Input label="표준 Cycle Time" name="cycle_time" type="number" value={form.cycle_time} onChange={handleChange} />
          <Input label="단가" name="unit_price" type="number" value={form.unit_price} onChange={handleChange} />

          <Field label="사용여부">
            <select name="is_active" value={form.is_active} onChange={handleChange} style={inputStyle}>
              <option value="1">사용</option>
              <option value="0">미사용</option>
            </select>
          </Field>
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <button onClick={resetForm} style={buttonStyle}>신규</button>
          <button onClick={saveItem} style={primaryButtonStyle}>
            {form.id ? "수정" : "등록"}
          </button>
          <button onClick={() => deleteItem()} style={dangerButtonStyle}>삭제</button>
        </div>

        {message && <p style={{ marginTop: 12, fontWeight: 600 }}>{message}</p>}
      </section>

      <section style={boxStyle}>
        <h2 style={sectionTitle}>② 품목 검색</h2>

        <div style={gridStyle}>
          <Field label="사업장">
            <select value={searchSiteId} onChange={(e) => setSearchSiteId(e.target.value)} style={inputStyle}>
              <option value="">전체</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
          </Field>

          <Input label="거래처" value={searchCustomer} onChange={(e: any) => setSearchCustomer(e.target.value)} />
          <Input label="품번" value={searchItemNo} onChange={(e: any) => setSearchItemNo(e.target.value)} />
          <Input label="품명" value={searchItemName} onChange={(e: any) => setSearchItemName(e.target.value)} />
        </div>
      </section>

      <section style={boxStyle}>
        <h2 style={sectionTitle}>③ 품목 목록</h2>

        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>사업장</th>
                <th style={thStyle}>거래처</th>
                <th style={thStyle}>차종</th>
                <th style={thStyle}>품번</th>
                <th style={thStyle}>품명</th>
                <th style={thStyle}>재질</th>
                <th style={thStyle}>규격</th>
                <th style={thStyle}>공정</th>
                <th style={thStyle}>단위</th>
                <th style={thStyle}>Cycle</th>
                <th style={thStyle}>단가</th>
                <th style={thStyle}>상태</th>
                <th style={thStyle}>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td style={tdStyle}>{item.site_name}</td>
                  <td style={tdStyle}>{item.customer_name}</td>
                  <td style={tdStyle}>{item.model_name}</td>
                  <td style={tdStyle}>{item.item_no}</td>
                  <td style={tdStyle}>{item.item_name}</td>
                  <td style={tdStyle}>{item.material}</td>
                  <td style={tdStyle}>{item.spec}</td>
                  <td style={tdStyle}>{item.process_name}</td>
                  <td style={tdStyle}>{item.unit}</td>
                  <td style={tdNumberStyle}>{Number(item.cycle_time || 0).toLocaleString()}</td>
                  <td style={tdNumberStyle}>{Number(item.unit_price || 0).toLocaleString()}</td>
                  <td style={tdStyle}>{item.is_active === 1 ? "사용" : "미사용"}</td>
                  <td style={tdStyle}>
                    <button onClick={() => loadToForm(item)} style={smallButtonStyle}>불러오기</button>
                    <button onClick={() => deleteItem(item.id)} style={smallDangerButtonStyle}>삭제</button>
                  </td>
                </tr>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={13} style={{ ...tdStyle, textAlign: "center", padding: 20 }}>
                    등록된 품목이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={labelStyle}>
      {label}
      {children}
    </label>
  );
}

function Input(props: any) {
  const { label, ...rest } = props;

  return (
    <label style={labelStyle}>
      {label}
      <input {...rest} style={inputStyle} />
    </label>
  );
}

const boxStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginBottom: 20,
  background: "#fff",
};

const sectionTitle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  marginBottom: 14,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
};

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 14,
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  height: 36,
  padding: "0 10px",
  border: "1px solid #ccc",
  borderRadius: 6,
};

const buttonStyle: React.CSSProperties = {
  padding: "8px 14px",
  border: "1px solid #bbb",
  borderRadius: 6,
  background: "#f5f5f5",
  cursor: "pointer",
};

const primaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: "#111",
  color: "#fff",
  border: "1px solid #111",
};

const dangerButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: "#b00020",
  color: "#fff",
  border: "1px solid #b00020",
};

const smallButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  padding: "5px 8px",
  marginRight: 6,
  fontSize: 12,
};

const smallDangerButtonStyle: React.CSSProperties = {
  ...smallButtonStyle,
  background: "#b00020",
  color: "#fff",
  border: "1px solid #b00020",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 13,
};

const thStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: 8,
  background: "#f0f0f0",
  textAlign: "center",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: 8,
  whiteSpace: "nowrap",
};

const tdNumberStyle: React.CSSProperties = {
  ...tdStyle,
  textAlign: "right",
};