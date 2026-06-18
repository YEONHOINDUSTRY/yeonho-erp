"use client";

import { useEffect, useState } from "react";

export default function ItemsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [itemNo, setItemNo] = useState("");
  const [itemName, setItemName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [unitPrice, setUnitPrice] = useState("");

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    const response = await fetch("/api/items");
    const data = await response.json();
    setRows(data);
  }

  async function saveItem() {
    await fetch("/api/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ itemNo, itemName, customerName, unitPrice }),
    });

    alert("등록완료");

    setItemNo("");
    setItemName("");
    setCustomerName("");
    setUnitPrice("");

    loadItems();
  }

  async function deleteItem(id: number) {
    if (!confirm("삭제하시겠습니까?")) return;

    await fetch("/api/items", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    loadItems();
  }

  return (
    <main style={{ padding: "30px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>품목관리</h1>

      <div style={{ marginTop: "20px", marginBottom: "20px" }}>
        <input placeholder="품번" style={inputStyle} value={itemNo} onChange={(e) => setItemNo(e.target.value)} />
        <input placeholder="품명" style={inputStyle} value={itemName} onChange={(e) => setItemName(e.target.value)} />
        <input placeholder="거래처" style={inputStyle} value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        <input placeholder="도급단가" style={inputStyle} value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
        <button style={buttonStyle} onClick={saveItem}>등록</button>
      </div>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>품번</th>
            <th style={thStyle}>품명</th>
            <th style={thStyle}>거래처</th>
            <th style={thStyle}>도급단가</th>
            <th style={thStyle}>관리</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td style={tdStyle}>{row.item_no}</td>
              <td style={tdStyle}>{row.item_name}</td>
              <td style={tdStyle}>{row.customer_name}</td>
              <td style={tdStyle}>{Number(row.unit_price).toLocaleString()}원</td>
              <td style={tdStyle}>
                <button style={editButtonStyle}>수정</button>

                <button
                  style={deleteButtonStyle}
                  onClick={() => deleteItem(row.id)}
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

const editButtonStyle = {
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