"use client";

import { useEffect, useState } from "react";

export default function ProductionPage() {
  const [items, setItems] = useState<any[]>([]);

  const [workDate, setWorkDate] = useState("");
  const [lineName, setLineName] = useState("");
  const [itemNo, setItemNo] = useState("");
  const [itemName, setItemName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [worker, setWorker] = useState("");
  const [memo, setMemo] = useState("");

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    const response = await fetch("/api/items");
    const data = await response.json();
    setItems(data);
  }

  function selectItem(selectedItemNo: string) {
    setItemNo(selectedItemNo);

    const selectedItem = items.find((item) => item.item_no === selectedItemNo);

    if (selectedItem) {
  setItemName(selectedItem.item_name);
  setCustomerName(selectedItem.customer_name);
  setUnitPrice(selectedItem.unit_price);
}
  }

  async function saveProduction() {
    await fetch("/api/productions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workDate,
        lineName,
        itemNo,
        itemName,
        quantity,
        worker,
        memo,
        customerName,
        unitPrice,
      }),
    });

    alert("생산일보 등록완료");

    setWorkDate("");
    setLineName("");
    setItemNo("");
    setItemName("");
    setQuantity("");
    setWorker("");
    setMemo("");
  }

  return (
    <main style={{ padding: "30px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>생산일보 입력</h1>

      <div style={formStyle}>
        <input type="date" style={inputStyle} value={workDate} onChange={(e) => setWorkDate(e.target.value)} />

        <input placeholder="라인명" style={inputStyle} value={lineName} onChange={(e) => setLineName(e.target.value)} />

        <select style={inputStyle} value={itemNo} onChange={(e) => selectItem(e.target.value)}>
          <option value="">품번 선택</option>
          {items.map((item) => (
            <option key={item.id} value={item.item_no}>
              {item.item_no} / {item.item_name}
            </option>
          ))}
        </select>

        <input placeholder="품명" style={inputStyle} value={itemName} readOnly />
        
        <input placeholder="거래처" style={inputStyle} value={customerName} readOnly />
        
        <input placeholder="도급단가" style={inputStyle} value={unitPrice} readOnly />

        <input placeholder="생산수량" style={inputStyle} value={quantity} onChange={(e) => setQuantity(e.target.value)} />

        <input placeholder="작업자" style={inputStyle} value={worker} onChange={(e) => setWorker(e.target.value)} />

        <input placeholder="비고" style={inputStyle} value={memo} onChange={(e) => setMemo(e.target.value)} />

        <button style={buttonStyle} onClick={saveProduction}>등록</button>
      </div>
    </main>
  );
}

const formStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "12px",
  width: "400px",
  marginTop: "20px",
};

const inputStyle = {
  padding: "12px",
  border: "1px solid #ccc",
  borderRadius: "6px",
};

const buttonStyle = {
  padding: "12px",
  backgroundColor: "#111827",
  color: "white",
  border: "none",
  borderRadius: "6px",
};