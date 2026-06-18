import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: "30px" }}>
      <h1 style={{ fontSize: "32px", fontWeight: "bold" }}>연호 ERP</h1>

      <div style={gridStyle}>
        <Link href="/production" style={cardStyle}>생산일보 입력</Link>
        <Link href="/production/list" style={cardStyle}>생산일보 조회</Link>
        <Link href="/customers" style={cardStyle}>거래처관리</Link>
        <Link href="/items" style={cardStyle}>품목관리</Link>
        <Link href="/settlement" style={cardStyle}>정산관리</Link>
      </div>
    </main>
  );
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 220px)",
  gap: "16px",
  marginTop: "30px",
};

const cardStyle = {
  width: "220px",
  height: "120px",
  border: "1px solid #ddd",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "20px",
  fontWeight: "bold",
  textDecoration: "none",
  color: "#111827",
  backgroundColor: "#f9fafb",
};