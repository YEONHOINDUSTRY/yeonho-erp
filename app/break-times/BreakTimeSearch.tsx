"use client";

import { Site } from "./types";

type Props = {
  sites: Site[];
  searchSiteId: string;
  searchWorkType: string;
  searchActive: string;
  searchName: string;
  setSearchSiteId: (value: string) => void;
  setSearchWorkType: (value: string) => void;
  setSearchActive: (value: string) => void;
  setSearchName: (value: string) => void;
};

export default function BreakTimeSearch({
  sites,
  searchSiteId,
  searchWorkType,
  searchActive,
  searchName,
  setSearchSiteId,
  setSearchWorkType,
  setSearchActive,
  setSearchName,
}: Props) {
  return (
    <section style={boxStyle}>
      <h2 style={sectionTitle}>② 휴게시간 검색</h2>

      <div style={gridStyle}>
        <label style={labelStyle}>
          사업장
          <select
            value={searchSiteId}
            onChange={(e) => setSearchSiteId(e.target.value)}
            style={inputStyle}
          >
            <option value="">전체</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
        </label>

        <label style={labelStyle}>
          근무구분
          <select
            value={searchWorkType}
            onChange={(e) => setSearchWorkType(e.target.value)}
            style={inputStyle}
          >
            <option value="">전체</option>
            <option value="공통">공통</option>
            <option value="주간">주간</option>
            <option value="야간">야간</option>
            <option value="2교대">2교대</option>
            <option value="관리">관리</option>
            <option value="기타">기타</option>
          </select>
        </label>

        <label style={labelStyle}>
          사용여부
          <select
            value={searchActive}
            onChange={(e) => setSearchActive(e.target.value)}
            style={inputStyle}
          >
            <option value="">전체</option>
            <option value="1">사용</option>
            <option value="0">미사용</option>
          </select>
        </label>

        <label style={labelStyle}>
          휴게명
          <input
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            style={inputStyle}
          />
        </label>
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