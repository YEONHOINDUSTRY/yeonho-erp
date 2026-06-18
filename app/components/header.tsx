import Link from "next/link";

export default function Header() {
  return (
    <div style={headerStyle}>
      <Link href="/" style={logoStyle}>연호 ERP</Link>
      <Link href="/production" style={menuStyle}>생산일보 입력</Link>
      <Link href="/production/list" style={menuStyle}>생산일보 조회</Link>
      <Link href="/customers" style={menuStyle}>거래처관리</Link>
      <Link href="/items" style={menuStyle}>품목관리</Link>
    </div>
  );
}

const headerStyle = {
  height: "60px",
  backgroundColor: "#111827",
  display: "flex",
  alignItems: "center",
  padding: "0 30px",
  gap: "24px",
};

const logoStyle = {
  color: "white",
  fontSize: "22px",
  fontWeight: "bold",
  textDecoration: "none",
};

const menuStyle = {
  color: "#e5e7eb",
  fontSize: "16px",
  textDecoration: "none",
};