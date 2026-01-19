import { api } from './apiClient';

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

export type DashboardResponse = {
  class: any;
  semester: any;
  summary: any;
  students: any; // paginationResponse hoặc array tùy BE bạn trả
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

export const advisorService = {
  async getMyClasses(params?: { include_inactive?: boolean }) {
    const res = await api.get<AdvisorClass[]>('/advisor/classes', { params });
    return res.data;
  },

  async getSemesters() {
    const res = await api.get<Semester[]>('/advisor/semesters');
    return res.data;
  },

  async getDashboard(params: {
    class_id: string;
    semester_id?: string;
    q?: string;
    page?: number;
    limit?: number;
  }) {
    const res = await api.get<DashboardResponse>('/advisor/dashboard', { params });
    return res.data;
  },

  async getWarningRules() {
    const res = await api.get<WarningRule[]>('/advisor/warning-rules');
    return res.data;
  },

  async listWarnings(params: {
    class_id: string;
    semester_id?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const res = await api.get('/advisor/warnings', { params });
    return res.data;
  },

  async previewWarnings(params: { class_id: string; semester_id?: string }) {
    const res = await api.get('/advisor/warnings/preview', { params });
    return res.data;
  },

  async generateWarnings(body: {
    class_id: string;
    semester_id?: string;
    create_status: 'Draft' | 'Sent';
    send_channel?: 'in_app' | 'email';
  }) {
    const res = await api.post('/advisor/warnings/generate', body);
    return res.data;
  },

  async sendWarnings(body: { warning_ids: string[]; channel?: 'in_app' | 'email' }) {
    const res = await api.post('/advisor/warnings/send', body);
    return res.data;
  },

  async updateWarningStatus(warningId: string, status: 'Draft' | 'Acknowledged' | 'Resolved') {
    const res = await api.patch(`/advisor/warnings/${warningId}/status`, { status });
    return res.data;
  },

  async getStudentDetail(studentId: string, params?: { semester_id?: string; include_grades?: boolean }) {
    const res = await api.get(`/advisor/students/${studentId}`, { params });
    return res.data;
  },

  async listNotes(studentId: string) {
    const res = await api.get('/advisor/notes', { params: { student_id: studentId } });
    return res.data;
  },

  async createNote(body: {
    student_id: string;
    warning_id?: string;
    content: string;
    counseling_date?: string;
    handling_status?: 'not_contacted' | 'contacted' | 'monitoring' | 'stable';
    attachment_url?: string;
  }) {
    const res = await api.post('/advisor/notes', body);
    return res.data;
  },
};
