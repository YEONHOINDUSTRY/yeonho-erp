"use client";

import { useEffect, useState } from "react";

export default function CustomersPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [manager, setManager] = useState("");
  const [phone, setPhone] = useState("");
  const [memo, setMemo] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    const response = await fetch("/api/customers");
    const data = await response.json();
    setRows(data);
  }

  async function saveCustomer() {
    await fetch("/api/customers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, manager, phone, memo }),
    });

    alert("등록완료");

    setName("");
    setManager("");
    setPhone("");
    setMemo("");

    loadCustomers();
  }
async function deleteCustomer(id: number) {
  if (!confirm("삭제하시겠습니까?")) return;

  await fetch("/api/customers", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });

  loadCustomers();
}
  return (
    <main style={{ padding: "30px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>거래처관리</h1>

      <div style={{ marginTop: "20px", marginBottom: "20px" }}>
        <input placeholder="거래처명" style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="담당자" style={inputStyle} value={manager} onChange={(e) => setManager(e.target.value)} />
        <input placeholder="연락처" style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input placeholder="비고" style={inputStyle} value={memo} onChange={(e) => setMemo(e.target.value)} />
        <button style={buttonStyle} onClick={saveCustomer}>등록</button>
      </div>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>거래처명</th>
            <th style={thStyle}>담당자</th>
            <th style={thStyle}>연락처</th>
            <th style={thStyle}>비고</th>
            <th style={thStyle}>관리</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td style={tdStyle}>{row.name}</td>
              <td style={tdStyle}>{row.manager}</td>
              <td style={tdStyle}>{row.phone}</td>
              <td style={tdStyle}>{row.memo}</td>
       <td style={tdStyle}>
  <button style={smallButtonStyle}>수정</button>

  <button
    style={deleteButtonStyle}
    onClick={() => deleteCustomer(row.id)}
  >
    삭제
  </button>
</td>
              
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

const inputStyle = {
  padding: "10px",
  marginRight: "8px",
  border: "1px solid #ccc",
  borderRadius: "6px",
};

const buttonStyle = {
  padding: "10px 18px",
  backgroundColor: "#111827",
  color: "white",
  border: "none",
  borderRadius: "6px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
  marginTop: "20px",
};

const thStyle = {
  border: "1px solid #ccc",
  padding: "12px",
  backgroundColor: "#f3f4f6",
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
