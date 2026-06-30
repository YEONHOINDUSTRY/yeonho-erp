"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState("");

  async function loadSites() {
    const res = await fetch("/api/sites");
    const data = await res.json();
    setSites(data);

    const savedSiteId = localStorage.getItem("selectedSiteId");

    if (savedSiteId) {
      setSelectedSiteId(savedSiteId);
    } else if (data.length > 0) {
      setSelectedSiteId(String(data[0].id));
      localStorage.setItem("selectedSiteId", String(data[0].id));
    }
  }

  function changeSite(siteId: string) {
    setSelectedSiteId(siteId);
    localStorage.setItem("selectedSiteId", siteId);
  }

  useEffect(() => {
    loadSites();
  }, []);

  return (
    <div style={headerStyle}>
      <Link href="/" style={logoStyle}>
        연호 ERP
      </Link>

      <Link href="/sites" style={menuStyle}>
        사업장관리
      </Link>

      <Link href="/production" style={menuStyle}>
        생산일보 입력
      </Link>

      <Link href="/production/list" style={menuStyle}>
        생산일보 조회
      </Link>
      <Link href="/production-plans" style={menuStyle}>
        생산계획
      </Link>

      <Link href="/statistics" style={menuStyle}>
        생산통계
      </Link>

      <Link href="/settlement" style={menuStyle}>
        정산관리
      </Link>

      <Link href="/customers" style={menuStyle}>
        거래처관리
      </Link>

      <Link href="/items" style={menuStyle}>
        품목관리
      </Link>

      <Link href="/workers" style={menuStyle}>
        직원관리
      </Link>
      <Link href="/lines" style={menuStyle}>
       생산라인관리
      </Link>
      <Link href="/downtimes" style={menuStyle}>
       비가동관리
      </Link>

      <Link href="/break-times" style={menuStyle}>
        휴게시간관리
      </Link>

      <div style={siteBoxStyle}>
        <span style={siteLabelStyle}>현재 사업장</span>
        <select
          value={selectedSiteId}
          onChange={(e) => changeSite(e.target.value)}
          style={selectStyle}
        >
          {sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.site_name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

const headerStyle = {
  height: "60px",
  backgroundColor: "#111827",
  display: "flex",
  alignItems: "center",
  padding: "0 30px",
  gap: "20px",
};

const logoStyle = {
  color: "white",
  fontSize: "22px",
  fontWeight: "bold",
  textDecoration: "none",
};

const menuStyle = {
  color: "#e5e7eb",
  fontSize: "15px",
  textDecoration: "none",
};

const siteBoxStyle = {
  marginLeft: "auto",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const siteLabelStyle = {
  color: "#d1d5db",
  fontSize: "14px",
};

const selectStyle = {
  height: "34px",
  padding: "0 10px",
  borderRadius: "6px",
  border: "1px solid #9ca3af",
};