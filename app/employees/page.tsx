"use client";

import { useEffect, useMemo, useState } from "react";

type Site = {
  id: number;
  name: string;
};

type Employee = {
  id: number;
  site_id: number | null;
  site_name?: string;
  employee_name: string;
  nationality: string;
  phone: string;
  position: string;
  work_type: string;
  hourly_wage: number;
  monthly_salary: number;
  hire_date: string;
  resign_date: string;
  is_active: number;
  memo: string;
};

const emptyForm = {
  id: 0,
  site_id: "",
  employee_name: "",
  nationality: "대한민국",
  phone: "",
  position: "",
  work_type: "주간",
  hourly_wage: "",
  monthly_salary: "",
  hire_date: "",
  resign_date: "",
  is_active: "1",
  memo: "",
};

export default function EmployeesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState<any>(emptyForm);

  const [searchSiteId, setSearchSiteId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchWorkType, setSearchWorkType] = useState("");
  const [searchActive, setSearchActive] = useState("");

  const [message, setMessage] = useState("");

  const loadSites = async () => {
    const res = await fetch("/api/sites");
    const data = await res.json();
    setSites(Array.isArray(data) ? data : []);
  };

  const loadEmployees = async () => {
    const res = await fetch("/api/employees");
    const data = await res.json();
    setEmployees(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadSites();
    loadEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      return (
        (!searchSiteId || String(emp.site_id ?? "") === searchSiteId) &&
        (!searchName ||
          (emp.employee_name ?? "")
            .toLowerCase()
            .includes(searchName.toLowerCase())) &&
        (!searchWorkType || emp.work_type === searchWorkType) &&
        (!searchActive || String(emp.is_active) === searchActive)
      );
    });
  }, [employees, searchSiteId, searchName, searchWorkType, searchActive]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setMessage("");
  };

  const saveEmployee = async () => {
    if (!form.site_id) return setMessage("사업장을 선택하세요.");
    if (!form.employee_name.trim()) return setMessage("직원명을 입력하세요.");

    const payload = {
      site_id: Number(form.site_id),
      employee_name: form.employee_name.trim(),
      nationality: form.nationality.trim(),
      phone: form.phone.trim(),
      position: form.position.trim(),
      work_type: form.work_type,
      hourly_wage: Number(form.hourly_wage || 0),
      monthly_salary: Number(form.monthly_salary || 0),
      hire_date: form.hire_date,
      resign_date: form.resign_date,
      is_active: Number(form.is_active),
      memo: form.memo.trim(),
    };

    const res = await fetch(
      form.id ? `/api/employees/${form.id}` : "/api/employees",
      {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return setMessage(err.error || "저장 중 오류가 발생했습니다.");
    }

    await loadEmployees();
    setForm(emptyForm);
    setMessage(form.id ? "직원 정보가 수정되었습니다." : "직원이 등록되었습니다.");
  };

  const loadToForm = (emp: Employee) => {
    setForm({
      id: emp.id,
      site_id: emp.site_id ? String(emp.site_id) : "",
      employee_name: emp.employee_name ?? "",
      nationality: emp.nationality ?? "대한민국",
      phone: emp.phone ?? "",
      position: emp.position ?? "",
      work_type: emp.work_type ?? "주간",
      hourly_wage: emp.hourly_wage ? String(emp.hourly_wage) : "",
      monthly_salary: emp.monthly_salary ? String(emp.monthly_salary) : "",
      hire_date: emp.hire_date ?? "",
      resign_date: emp.resign_date ?? "",
      is_active: String(emp.is_active ?? 1),
      memo: emp.memo ?? "",
    });

    setMessage("선택한 직원을 불러왔습니다.");
  };

  const deleteEmployee = async (id?: number) => {
    const targetId = id ?? form.id;

    if (!targetId) return setMessage("삭제할 직원을 먼저 불러오세요.");
    if (!confirm("선택한 직원을 삭제하시겠습니까?")) return;

    const res = await fetch(`/api/employees/${targetId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return setMessage(err.error || "삭제 중 오류가 발생했습니다.");
    }

    await loadEmployees();
    setForm(emptyForm);
    setMessage("직원 정보가 삭제되었습니다.");
  };

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>
        직원관리
      </h1>

      <section style={boxStyle}>
        <h2 style={sectionTitle}>① 직원 기본정보</h2>

        <div style={gridStyle}>
          <Field label="사업장">
            <select name="site_id" value={form.site_id} onChange={handleChange} style={inputStyle}>
              <option value="">선택</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
          </Field>

          <Input label="직원명" name="employee_name" value={form.employee_name} onChange={handleChange} />
          <Input label="국적" name="nationality" value={form.nationality} onChange={handleChange} />
          <Input label="연락처" name="phone" value={form.phone} onChange={handleChange} />
          <Input label="직책" name="position" value={form.position} onChange={handleChange} />

          <Field label="근무구분">
            <select name="work_type" value={form.work_type} onChange={handleChange} style={inputStyle}>
              <option value="주간">주간</option>
              <option value="야간">야간</option>
              <option value="2교대">2교대</option>
              <option value="관리">관리</option>
              <option value="기타">기타</option>
            </select>
          </Field>

          <Input label="시급" name="hourly_wage" type="number" value={form.hourly_wage} onChange={handleChange} />
          <Input label="월급" name="monthly_salary" type="number" value={form.monthly_salary} onChange={handleChange} />
          <Input label="입사일" name="hire_date" type="date" value={form.hire_date} onChange={handleChange} />
          <Input label="퇴사일" name="resign_date" type="date" value={form.resign_date} onChange={handleChange} />

          <Field label="상태">
            <select name="is_active" value={form.is_active} onChange={handleChange} style={inputStyle}>
              <option value="1">재직</option>
              <option value="0">퇴사</option>
            </select>
          </Field>
        </div>

        <label style={{ ...labelStyle, marginTop: 12 }}>
          메모
          <textarea name="memo" value={form.memo} onChange={handleChange} style={textareaStyle} />
        </label>

        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <button onClick={resetForm} style={buttonStyle}>신규</button>
          <button onClick={saveEmployee} style={primaryButtonStyle}>
            {form.id ? "수정" : "등록"}
          </button>
          <button onClick={() => deleteEmployee()} style={dangerButtonStyle}>삭제</button>
        </div>

        {message && <p style={{ marginTop: 12, fontWeight: 600 }}>{message}</p>}
      </section>

      <section style={boxStyle}>
        <h2 style={sectionTitle}>② 직원 검색</h2>

        <div style={gridStyle}>
          <Field label="사업장">
            <select value={searchSiteId} onChange={(e) => setSearchSiteId(e.target.value)} style={inputStyle}>
              <option value="">전체</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
          </Field>

          <Input label="직원명" value={searchName} onChange={(e: any) => setSearchName(e.target.value)} />

          <Field label="근무구분">
            <select value={searchWorkType} onChange={(e) => setSearchWorkType(e.target.value)} style={inputStyle}>
              <option value="">전체</option>
              <option value="주간">주간</option>
              <option value="야간">야간</option>
              <option value="2교대">2교대</option>
              <option value="관리">관리</option>
              <option value="기타">기타</option>
            </select>
          </Field>

          <Field label="상태">
            <select value={searchActive} onChange={(e) => setSearchActive(e.target.value)} style={inputStyle}>
              <option value="">전체</option>
              <option value="1">재직</option>
              <option value="0">퇴사</option>
            </select>
          </Field>
        </div>
      </section>

      <section style={boxStyle}>
        <h2 style={sectionTitle}>③ 직원 목록</h2>

        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>사업장</th>
                <th style={thStyle}>직원명</th>
                <th style={thStyle}>국적</th>
                <th style={thStyle}>연락처</th>
                <th style={thStyle}>직책</th>
                <th style={thStyle}>근무구분</th>
                <th style={thStyle}>시급</th>
                <th style={thStyle}>월급</th>
                <th style={thStyle}>입사일</th>
                <th style={thStyle}>퇴사일</th>
                <th style={thStyle}>상태</th>
                <th style={thStyle}>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td style={tdStyle}>{emp.site_name}</td>
                  <td style={tdStyle}>{emp.employee_name}</td>
                  <td style={tdStyle}>{emp.nationality}</td>
                  <td style={tdStyle}>{emp.phone}</td>
                  <td style={tdStyle}>{emp.position}</td>
                  <td style={tdStyle}>{emp.work_type}</td>
                  <td style={tdNumberStyle}>{Number(emp.hourly_wage || 0).toLocaleString()}</td>
                  <td style={tdNumberStyle}>{Number(emp.monthly_salary || 0).toLocaleString()}</td>
                  <td style={tdStyle}>{emp.hire_date}</td>
                  <td style={tdStyle}>{emp.resign_date}</td>
                  <td style={tdStyle}>{emp.is_active === 1 ? "재직" : "퇴사"}</td>
                  <td style={tdStyle}>
                    <button onClick={() => loadToForm(emp)} style={smallButtonStyle}>불러오기</button>
                    <button onClick={() => deleteEmployee(emp.id)} style={smallDangerButtonStyle}>삭제</button>
                  </td>
                </tr>
              ))}

              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={12} style={{ ...tdStyle, textAlign: "center", padding: 20 }}>
                    등록된 직원이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={labelStyle}>
      {label}
      {children}
    </label>
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

const smallButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  padding: "5px 8px",
  marginRight: 6,
  fontSize: 12,
};

const smallDangerButtonStyle: React.CSSProperties = {
  ...smallButtonStyle,
  background: "#b00020",
  color: "#fff",
  border: "1px solid #b00020",
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