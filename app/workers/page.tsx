"use client";

import { useEffect, useState } from "react";

export default function WorkersPage() {
  const [workers, setWorkers] = useState<any[]>([]);

  const [workerName, setWorkerName] = useState("");
  const [nationality, setNationality] = useState("한국");
  const [position, setPosition] = useState("작업자");
  const [phone, setPhone] = useState("");
  const [hireDate, setHireDate] = useState("");

  async function loadWorkers() {
    const res = await fetch("/api/workers");
    const data = await res.json();
    setWorkers(data);
  }

  async function saveWorker() {
    const siteId = localStorage.getItem("selectedSiteId") || "1";

    await fetch("/api/workers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        site_id: Number(siteId),
        worker_name: workerName,
        nationality,
        position,
        phone,
        hire_date: hireDate,
      }),
    });

    setWorkerName("");
    setNationality("한국");
    setPosition("작업자");
    setPhone("");
    setHireDate("");

    loadWorkers();
  }

  useEffect(() => {
    loadWorkers();
  }, []);

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>직원관리</h1>

      <div style={cardStyle}>
        <h2 style={cardTitleStyle}>직원 등록</h2>

        <div style={formGridStyle}>
          <label style={labelStyle}>이름</label>
          <input
            style={inputStyle}
            placeholder="예: 장윤석"
            value={workerName}
            onChange={(e) => setWorkerName(e.target.value)}
          />

          <label style={labelStyle}>국적</label>
          <select
            style={inputStyle}
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
          >
            <option>한국</option>
            <option>러시아</option>
            <option>우즈베키스탄</option>
            <option>캄보디아</option>
            <option>베트남</option>
            <option>기타</option>
          </select>

          <label style={labelStyle}>직급</label>
          <select
            style={inputStyle}
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          >
            <option>관리자</option>
            <option>반장</option>
            <option>작업자</option>
          </select>

          <label style={labelStyle}>전화번호</label>
          <input
            style={inputStyle}
            placeholder="010-0000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <label style={labelStyle}>입사일</label>
          <input
            style={inputStyle}
            type="date"
            value={hireDate}
            onChange={(e) => setHireDate(e.target.value)}
          />
        </div>

        <div style={buttonAreaStyle}>
          <button style={buttonStyle} onClick={saveWorker}>
            직원 등록
          </button>
        </div>
      </div>

      <div style={cardStyle}>
        <h2 style={cardTitleStyle}>직원 목록</h2>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>이름</th>
              <th style={thStyle}>국적</th>
              <th style={thStyle}>직급</th>
              <th style={thStyle}>전화번호</th>
              <th style={thStyle}>입사일</th>
            </tr>
          </thead>
          <tbody>
            {workers.map((worker) => (
              <tr key={worker.id}>
                <td style={tdStyle}>{worker.worker_name}</td>
                <td style={tdStyle}>{worker.nationality}</td>
                <td style={tdStyle}>{worker.position}</td>
                <td style={tdStyle}>{worker.phone}</td>
                <td style={tdStyle}>{worker.hire_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const pageStyle = {
  padding: "24px",
  backgroundColor: "#f3f4f6",
  minHeight: "calc(100vh - 60px)",
};

const titleStyle = {
  fontSize: "28px",
  fontWeight: "bold",
  marginBottom: "20px",
};

const cardStyle = {
  backgroundColor: "white",
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  padding: "20px",
  marginBottom: "20px",
};

const cardTitleStyle = {
  fontSize: "20px",
  fontWeight: "bold",
  marginBottom: "16px",
};

const formGridStyle = {
  display: "grid",
  gridTemplateColumns: "120px 1fr",
  gap: "12px",
  maxWidth: "600px",
};

const labelStyle = {
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
};

const inputStyle = {
  height: "38px",
  padding: "0 10px",
  border: "1px solid #9ca3af",
  borderRadius: "6px",
  fontSize: "15px",
};

const buttonAreaStyle = {
  marginTop: "20px",
};

const buttonStyle = {
  height: "40px",
  padding: "0 24px",
  backgroundColor: "#111827",
  color: "white",
  border: "none",
  borderRadius: "6px",
  fontWeight: "bold",
  cursor: "pointer",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const thStyle = {
  border: "1px solid #d1d5db",
  padding: "10px",
  backgroundColor: "#f9fafb",
  textAlign: "center" as const,
};

const tdStyle = {
  border: "1px solid #d1d5db",
  padding: "10px",
  textAlign: "center" as const,
};