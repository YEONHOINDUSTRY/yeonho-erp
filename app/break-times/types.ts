export type Site = {
  id: number;
  name: string;
};

export type BreakTime = {
  id: number;
  site_id: number | null;
  site_name?: string;
  break_name: string;
  work_type: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  is_paid: number;
  is_active: number;
  memo: string;
};

export type BreakTimeFormData = {
  id: number;
  site_id: string;
  break_name: string;
  work_type: string;
  start_time: string;
  end_time: string;
  break_minutes: string;
  is_paid: string;
  is_active: string;
  memo: string;
};

export const emptyBreakTimeForm: BreakTimeFormData = {
  id: 0,
  site_id: "",
  break_name: "",
  work_type: "공통",
  start_time: "",
  end_time: "",
  break_minutes: "",
  is_paid: "0",
  is_active: "1",
  memo: "",
};