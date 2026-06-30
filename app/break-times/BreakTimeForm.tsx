"use client";

import { BreakTimeFormData, Site } from "./types";

type Props = {
  sites: Site[];
  form: BreakTimeFormData;
  message: string;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  onNew: () => void;
  onSave: () => void;
  onDelete: () => void;
};

export default function BreakTimeForm({
  sites,
  form,
  message,
  onChange,
  onNew,
  onSave,
  onDelete,
}: Props) {
  return (
    <section style={boxStyle}>
      <h2 style={sectionTitle}>① 휴게시간 기본정보</h2>

      <div style={gridStyle}>
        <label style={labelStyle}>
          사업장
          <select
            name="site_id"
            value={form.site_id}
            onChange={onChange}
            style={inputStyle}
          >
            <option value="">선택</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
        </label>

        <Input
          label="휴게명"
          name="break_name"
          value={form.break_name}
          onChange={onChange}
        />

        <label style={labelStyle}>
          근무구분
          <select
            name="work_type"
            value={form.work_type}
            onChange={onChange}
            style={inputStyle}
          >
            <option value="공통">공통</option>
            <option value="주간">주간</option>
            <option value="야간">야간</option>
            <option value="2교대">2교대</option>
            <option value="관리">관리</option>
            <option value="기타">기타</option>
          </select>
        </label>

        <Input
          label="시작시간"
          name="start_time"
          type="time"
          value={form.start_time}
          onChange={onChange}
        />

        <Input
          label="종료시간"
          name="end_time"
          type="time"
          value={form.end_time}
          onChange={onChange}
        />

        <Input
          label="휴게시간(분)"
          name="break_minutes"
          type="number"
          value={form.break_minutes}
          onChange={onChange}
        />

        <label style={labelStyle}>
          유급 여부
          <select
            name="is_paid"
            value={form.is_paid}
            onChange={onChange}
            style={inputStyle}
          >
            <option value="0">무급</option>
            <option value="1">유급</option>
          </select>
        </label>

        <label style={labelStyle}>
          사용 여부
          <select
            name="is_active"
            value={form.is_active}
            onChange={onChange}
            style={inputStyle}
          >
            <option value="1">사용</option>
            <option value="0">미사용</option>
          </select>
        </label>
      </div>

      <label style={{ ...labelStyle, marginTop: 12 }}>
        메모
        <textarea
          name="memo"
          value={form.memo}
          onChange={onChange}
          style={textareaStyle}
        />
      </label>

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <button onClick={onNew} style={buttonStyle}>
          신규
        </button>
        <button onClick={onSave} style={primaryButtonStyle}>
          {form.id ? "수정" : "등록"}
        </button>
        <button onClick={onDelete} style={dangerButtonStyle}>
          삭제
        </button>
      </div>

      {message && <p style={{ marginTop: 12, fontWeight: 600 }}>{message}</p>}
    </section>
  );
}

function Input(props: any) {
  const { label, ...rest } = props;

  return (
    <label style={labelStyle}>
      {label}
      <input {...rest} style={inputStyle} />
    </label>
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

const textareaStyle: React.CSSProperties = {
  minHeight: 70,
  padding: 10,
  border: "1px solid #ccc",
  borderRadius: 6,
  resize: "vertical",
};

const buttonStyle: React.CSSProperties = {
  padding: "8px 14px",
  border: "1px solid #bbb",
  borderRadius: 6,
  background: "#f5f5f5",
  cursor: "pointer",
};

const primaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: "#111",
  color: "#fff",
  border: "1px solid #111",
};

const dangerButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: "#b00020",
  color: "#fff",
  border: "1px solid #b00020",
};