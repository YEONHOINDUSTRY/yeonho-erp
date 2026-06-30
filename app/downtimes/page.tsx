"use client";

import { useEffect, useState } from "react";

export default function DowntimesPage() {
  const [downtimes, setDowntimes] = useState<any[]>([]);
  const [workDate, setWorkDate] = useState("");
  const [lineName, setLineName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [downtimeType, setDowntimeType] = useState("설비");
  const [reason, setReason] = useState("");
  const [memo, setMemo] = useState("");

  function calcMinutes(start: string, end: string) {
    if (!start || !end) return 0;

    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    return eh * 60 + em - (sh * 60 + sm);
  }

  const totalMinutes = calcMinutes(startTime, endTime);

  async function loadDowntimes() {
    const res = await fetch("/api/downtimes");
    const data = await res.json();
    setDowntimes(data);
  }

  async function saveDowntime() {
    const siteId = localStorage.getItem("selectedSiteId") || "1";

    await fetch("/api/downtimes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        site_id: Number(siteId),
        work_date: workDate,
        line_name: lineName,
        start_time: startTime,
        end_time: endTime,
        total_minutes: totalMinutes,
        break_minutes: 0,
        payable_minutes: totalMinutes,
        downtime_type: downtimeType,
        reason,
        memo,
      }),
    });

    setLineName("");
    setStartTime("");
    setEndTime("");
    setReason("");
    setMemo("");

    loadDowntimes();
  }

  useEffect(() => {
    loadDowntimes();
  }, []);

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>비가동관리</h1>

      <div style={cardStyle}>
        <h2 style={cardTitleStyle}>비가동 입력</h2>

        <div style={formGridStyle}>
          <label style={labelStyle}>일자</label>
          <input
            style={inputStyle}
            type="date"
            value={workDate}
            onChange={(e) => setWorkDate(e.target.value)}
          />

          <label style={labelStyle}>라인</label>
          <input
            style={inputStyle}
            placeholder="예: 1000톤"
            value={lineName}
            onChange={(e) => setLineName(e.target.value)}
          />

          <label style={labelStyle}>시작시간</label>
          <input
            style={inputStyle}
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />

          <label style={labelStyle}>종료시간</label>
          <input
            style={inputStyle}
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />

          <label style={labelStyle}>총 시간</label>
          <div style={resultBoxStyle}>
            {totalMinutes > 0 ? `${totalMinutes}분` : "-"}
          </div>

          <label style={labelStyle}>비가동 구분</label>
          <select
            style={inputStyle}
            value={downtimeType}
            onChange={(e) => setDowntimeType(e.target.value)}
          >
            <option>설비</option>
            <option>금형</option>
            <option>소재</option>
            <option>물류</option>
            <option>품질</option>
            <option>인원</option>
            <option>기타</option>
          </select>

          <label style={labelStyle}>원인/내용</label>
          <input
            style={inputStyle}
            placeholder="예: 소재 미입고"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <label style={labelStyle}>비고</label>
          <input
            style={inputStyle}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>

        <div style={buttonAreaStyle}>
          <button style={buttonStyle} onClick={saveDowntime}>
            비가동 등록
          </button>
        </div>
      </div>

      <div style={cardStyle}>
        <h2 style={cardTitleStyle}>비가동 목록</h2>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>일자</th>
              <th style={thStyle}>라인</th>
              <th style={thStyle}>시작</th>
              <th style={thStyle}>종료</th>
              <th style={thStyle}>총분</th>
              <th style={thStyle}>인정분</th>
              <th style={thStyle}>구분</th>
              <th style={thStyle}>내용</th>
            </tr>
          </thead>
          <tbody>
            {downtimes.map((row) => (
              <tr key={row.id}>
                <td style={tdStyle}>{row.work_date}</td>
                <td style={tdStyle}>{row.line_name}</td>
                <td style={tdStyle}>{row.start_time}</td>
                <td style={tdStyle}>{row.end_time}</td>
                <td style={tdStyle}>{row.total_minutes}</td>
                <td style={tdStyle}>{row.payable_minutes}</td>
                <td style={tdStyle}>{row.downtime_type}</td>
                <td style={tdStyle}>{row.reason}</td>
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
  maxWidth: "650px",
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

const resultBoxStyle = {
  height: "38px",
  padding: "0 10px",
  border: "1px solid #9ca3af",
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
  backgroundColor: "#f9fafb",
  fontWeight: "bold",
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