"use client";

import { BreakTime } from "./types";

type Props = {
  breakTimes: BreakTime[];
  onLoad: (breakTime: BreakTime) => void;
  onDelete: (id: number) => void;
};

export default function BreakTimeTable({
  breakTimes,
  onLoad,
  onDelete,
}: Props) {
  return (
    <section style={boxStyle}>
      <h2 style={sectionTitle}>③ 휴게시간 목록</h2>

      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>사업장</th>
              <th style={thStyle}>휴게명</th>
              <th style={thStyle}>근무구분</th>
              <th style={thStyle}>시작</th>
              <th style={thStyle}>종료</th>
              <th style={thStyle}>휴게시간(분)</th>
              <th style={thStyle}>유급</th>
              <th style={thStyle}>상태</th>
              <th style={thStyle}>관리</th>
            </tr>
          </thead>
          <tbody>
            {breakTimes.map((item) => (
              <tr key={item.id}>
                <td style={tdStyle}>{item.site_name}</td>
                <td style={tdStyle}>{item.break_name}</td>
                <td style={tdStyle}>{item.work_type}</td>
                <td style={tdStyle}>{item.start_time}</td>
                <td style={tdStyle}>{item.end_time}</td>
                <td style={tdNumberStyle}>
                  {Number(item.break_minutes || 0).toLocaleString()}
                </td>
                <td style={tdStyle}>{item.is_paid === 1 ? "유급" : "무급"}</td>
                <td style={tdStyle}>
                  {item.is_active === 1 ? "사용" : "미사용"}
                </td>
                <td style={tdStyle}>
                  <button onClick={() => onLoad(item)} style={smallButtonStyle}>
                    불러오기
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    style={smallDangerButtonStyle}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}

            {breakTimes.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  style={{ ...tdStyle, textAlign: "center", padding: 20 }}
                >
                  등록된 휴게시간이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
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

const smallButtonStyle: React.CSSProperties = {
  padding: "5px 8px",
  marginRight: 6,
  fontSize: 12,
  border: "1px solid #bbb",
  borderRadius: 6,
  background: "#f5f5f5",
  cursor: "pointer",
};

const smallDangerButtonStyle: React.CSSProperties = {
  ...smallButtonStyle,
  background: "#b00020",
  color: "#fff",
  border: "1px solid #b00020",
};