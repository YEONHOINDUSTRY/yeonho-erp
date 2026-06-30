"use client";

import { useEffect, useMemo, useState } from "react";
import BreakTimeForm from "./BreakTimeForm";
import BreakTimeSearch from "./BreakTimeSearch";
import BreakTimeTable from "./BreakTimeTable";
import {
  BreakTime,
  BreakTimeFormData,
  emptyBreakTimeForm,
  Site,
} from "./types";

export default function BreakTimesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [breakTimes, setBreakTimes] = useState<BreakTime[]>([]);
  const [form, setForm] = useState<BreakTimeFormData>(emptyBreakTimeForm);
  const [message, setMessage] = useState("");

  const [searchSiteId, setSearchSiteId] = useState("");
  const [searchWorkType, setSearchWorkType] = useState("");
  const [searchActive, setSearchActive] = useState("");
  const [searchName, setSearchName] = useState("");

  const loadSites = async () => {
    const res = await fetch("/api/sites");
    const data = await res.json();
    setSites(Array.isArray(data) ? data : []);
  };

  const loadBreakTimes = async () => {
    const res = await fetch("/api/break-times");
    const data = await res.json();
    setBreakTimes(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadSites();
    loadBreakTimes();
  }, []);

  const filteredBreakTimes = useMemo(() => {
    return breakTimes.filter((item) => {
      return (
        (!searchSiteId || String(item.site_id ?? "") === searchSiteId) &&
        (!searchWorkType || item.work_type === searchWorkType) &&
        (!searchActive || String(item.is_active) === searchActive) &&
        (!searchName ||
          (item.break_name ?? "")
            .toLowerCase()
            .includes(searchName.toLowerCase()))
      );
    });
  }, [breakTimes, searchSiteId, searchWorkType, searchActive, searchName]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "start_time" || name === "end_time") {
        next.break_minutes = calculateBreakMinutes(
          next.start_time,
          next.end_time
        );
      }

      return next;
    });
  };

  const resetForm = () => {
    setForm(emptyBreakTimeForm);
    setMessage("");
  };

  const validateForm = () => {
    if (!form.site_id) return "사업장을 선택하세요.";
    if (!form.break_name.trim()) return "휴게명을 입력하세요.";
    if (!form.start_time) return "시작시간을 입력하세요.";
    if (!form.end_time) return "종료시간을 입력하세요.";
    return "";
  };

  const saveBreakTime = async () => {
    const validation = validateForm();

    if (validation) {
      setMessage(validation);
      return;
    }

    const payload = {
      site_id: Number(form.site_id),
      break_name: form.break_name.trim(),
      work_type: form.work_type,
      start_time: form.start_time,
      end_time: form.end_time,
      break_minutes: Number(form.break_minutes || 0),
      is_paid: Number(form.is_paid),
      is_active: Number(form.is_active),
      memo: form.memo.trim(),
    };

    const res = await fetch(
      form.id ? `/api/break-times/${form.id}` : "/api/break-times",
      {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setMessage(err.error || "저장 중 오류가 발생했습니다.");
      return;
    }

    await loadBreakTimes();
    setForm(emptyBreakTimeForm);
    setMessage(form.id ? "휴게시간이 수정되었습니다." : "휴게시간이 등록되었습니다.");
  };

  const loadToForm = (item: BreakTime) => {
    setForm({
      id: item.id,
      site_id: item.site_id ? String(item.site_id) : "",
      break_name: item.break_name ?? "",
      work_type: item.work_type ?? "공통",
      start_time: item.start_time ?? "",
      end_time: item.end_time ?? "",
      break_minutes: item.break_minutes ? String(item.break_minutes) : "",
      is_paid: String(item.is_paid ?? 0),
      is_active: String(item.is_active ?? 1),
      memo: item.memo ?? "",
    });

    setMessage("선택한 휴게시간을 불러왔습니다.");
  };

  const deleteBreakTime = async (id?: number) => {
    const targetId = id ?? form.id;

    if (!targetId) {
      setMessage("삭제할 휴게시간을 먼저 불러오세요.");
      return;
    }

    if (!confirm("선택한 휴게시간을 삭제하시겠습니까?")) return;

    const res = await fetch(`/api/break-times/${targetId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setMessage(err.error || "삭제 중 오류가 발생했습니다.");
      return;
    }

    await loadBreakTimes();
    setForm(emptyBreakTimeForm);
    setMessage("휴게시간이 삭제되었습니다.");
  };

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>
        휴게시간관리
      </h1>

      <BreakTimeForm
        sites={sites}
        form={form}
        message={message}
        onChange={handleChange}
        onNew={resetForm}
        onSave={saveBreakTime}
        onDelete={() => deleteBreakTime()}
      />

      <BreakTimeSearch
        sites={sites}
        searchSiteId={searchSiteId}
        searchWorkType={searchWorkType}
        searchActive={searchActive}
        searchName={searchName}
        setSearchSiteId={setSearchSiteId}
        setSearchWorkType={setSearchWorkType}
        setSearchActive={setSearchActive}
        setSearchName={setSearchName}
      />

      <BreakTimeTable
        breakTimes={filteredBreakTimes}
        onLoad={loadToForm}
        onDelete={deleteBreakTime}
      />
    </main>
  );
}

function calculateBreakMinutes(start: string, end: string) {
  if (!start || !end) return "";

  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  let startTotal = startHour * 60 + startMinute;
  let endTotal = endHour * 60 + endMinute;

  if (endTotal < startTotal) {
    endTotal += 24 * 60;
  }

  return String(endTotal - startTotal);
}