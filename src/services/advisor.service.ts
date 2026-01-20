import { api } from "./apiClient";

/** ===== Types ===== */
export type GetDashboardParams = {
  class_id: string;
  semester_id: string;       
  q?: string;
  page?: number;
  limit?: number;
  warned_only?: boolean;     
};

export type AdvisorClass = {
  assignment_id: string;
  from_date: string;
  to_date: string | null;
  is_primary: boolean;
  class: {
    id: string;
    class_code: string;
    class_name: string;
    major_name: string;
    cohort_year: number;
    status: string;
  } | null;
};

export type Semester = {
  id: string;
  semester_code: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
};

export type Snapshot = {
  gpa_semester: number | null;
  gpa_cumulative: number | null;
  credits_earned_semester: number;
  credits_failed_semester: number;
  failed_courses_count_semester: number;
  data_status: "ok" | "missing_data" | string;
};

export type WarningItem = {
  id: string;
  status: "Draft" | "Sent" | "SendFailed" | "Resolved" | "Acknowledged" | string;
  detected_value: number | null;
  reason_text: string | null;
  created_at?: string;
  send?: {
    channel: "in_app" | "email" | string | null;
    status: "sent" | "failed" | string | null;
    error: string | null;
    sent_at: string | null;
  };
  semester?: {
    id: string;
    semester_code: string;
    name: string;
  };
  rule?: {
    rule_code: string;
    rule_name: string;
    condition_type?: string;
    operator?: string;
    threshold_value?: number;
    level?: number | null;
  } | null;
};

export type AdvisoryNote = {
  id: string;
  content: string;
  counseling_date: string | null;
  handling_status: "not_contacted" | "contacted" | "monitoring" | "stable" | string;
  warning_id: string | null;
  attachment_url: string | null;
  advisor: { id: string; full_name: string } | null;
  created_at: string;
};

export type GradeItem = {
  id: string;
  attempt_no: number;
  score_10: number | null;
  letter_grade: string | null;
  score_4: number | null;
  is_pass: boolean | null;
  updated_at: string;
  course: {
    course_code: string;
    course_name: string;
    credits: number;
  } | null;
};

export type DashboardRow = {
  student: {
    id: string;
    student_code: string;
    full_name: string;
    academic_status: "studying" | "leave" | "dropout" | "graduated" | string;
  };
  snapshot: Snapshot;
  warnings_total: number;
};

export type Pagination<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type DashboardResponse = {
  class: any;
  semester: Semester;
  summary: {
    students_total: number;
    avg_gpa_semester: number | null;
    warnings_total: number;
    warnings_by_status: Record<string, number>;
  };
  students: Pagination<DashboardRow>;
};

export type StudentDetailResponse = {
  student: {
    id: string;
    student_code: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    academic_status: "studying" | "leave" | "dropout" | "graduated" | string;
    class: { id: string; class_code: string; class_name: string; major_name?: string; cohort_year?: number } | null;
  };
  semester: Semester;
  snapshot: Snapshot;
  warnings: WarningItem[];
  notes: AdvisoryNote[];
  grades: GradeItem[] | null;
};

export type StudentTimelineResponse = {
  student: {
    id: string;
    student_code: string;
    full_name: string;
    academic_status: "studying" | "leave" | "dropout" | "graduated" | string;
    class: { id: string; class_code: string; class_name: string } | null;
  };
  focus_semester: Semester;
  snapshots: Array<{
    semester: Semester;
    gpa_semester: number | null;
    gpa_cumulative: number | null;
    credits_earned_semester: number;
    credits_failed_semester: number;
    failed_courses_count_semester: number;
    data_status: string;
  }>;
  warnings: Array<{
    id: string;
    semester: { id: string; semester_code: string; name: string };
    status: string;
    detected_value: number | null;
    reason_text: string | null;
    rule: { rule_code: string; rule_name: string; level: number | null } | null;
    created_at: string;
  }>;
  notes: AdvisoryNote[];
  grades_focus_semester: GradeItem[];
};

export type WarningRule = {
  id: string;
  rule_code: string;
  rule_name: string;
  description?: string | null;
  condition_type: string;
  operator: string;
  threshold_value: number | null;
  level?: number | null;
  is_active: boolean;
};

/** ===== API ===== */

export const advisorService = {
  getMyClasses(params?: { include_inactive?: boolean }) {
    return api.get<AdvisorClass[]>("/advisor/classes", { params }).then((r) => r.data);
  },

  getSemesters() {
    return api.get<Semester[]>("/advisor/semesters").then((r) => r.data);
  },

  async getDashboard(params: GetDashboardParams) {
  const res = await api.get<DashboardResponse>("/advisor/dashboard", {
    params: {
      ...params,
      warned_only: params.warned_only ? "true" : "false",
    },
  });
  return res.data;
},

  getWarningRules() {
    return api.get<WarningRule[]>("/advisor/warning-rules").then((r) => r.data);
  },

  listWarnings(params: { class_id: string; semester_id?: string; status?: string; page?: number; limit?: number }) {
    return api.get("/advisor/warnings", { params }).then((r) => r.data);
  },

  previewWarnings(params: { class_id: string; semester_id?: string }) {
    return api.get("/advisor/warnings/preview", { params }).then((r) => r.data);
  },

  generateWarnings(body: { class_id: string; semester_id?: string; create_status: "Draft" | "Sent"; send_channel?: "in_app" | "email" }) {
    return api.post("/advisor/warnings/generate", body).then((r) => r.data);
  },

  sendWarnings(body: { warning_ids: string[]; channel?: "in_app" | "email" }) {
    return api.post("/advisor/warnings/send", body).then((r) => r.data);
  },

  updateWarningStatus(warningId: string, status: "Draft" | "Acknowledged" | "Resolved") {
    return api.patch(`/advisor/warnings/${warningId}/status`, { status }).then((r) => r.data);
  },

  bulkUpdateWarningStatus(body: { ids: string[]; status: "Draft" | "Acknowledged" | "Resolved" }) {
    return api.patch("/advisor/warnings/bulk-status", body).then((r) => r.data);
  },

  getWarningDetail(warningId: string) {
    return api.get(`/advisor/warnings/${warningId}`).then((r) => r.data);
  },

  getStudentDetail(studentId: string, params?: { semester_id?: string; include_grades?: boolean }) {
    return api.get<StudentDetailResponse>(`/advisor/students/${studentId}`, { params }).then((r) => r.data);
  },

  getStudentTimeline(studentId: string, params?: { semester_id?: string }) {
    return api.get<StudentTimelineResponse>(`/advisor/students/${studentId}/timeline`, { params }).then((r) => r.data);
  },

  listNotes(studentId: string) {
    return api.get("/advisor/notes", { params: { student_id: studentId } }).then((r) => r.data);
  },

  createNote(body: {
    student_id: string;
    warning_id?: string;
    content: string;
    counseling_date?: string;
    handling_status?: "not_contacted" | "contacted" | "monitoring" | "stable";
    attachment_url?: string;
  }) {
    return api.post("/advisor/notes", body).then((r) => r.data);
  },
};
