import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

function fmt(v: any) {
  return v == null || v === "" ? "-" : String(v);
}

function dataStatusBadge(s: string) {
  switch (s) {
    case "ok":
      return <Badge className="bg-emerald-50 text-emerald-900 border border-emerald-200">OK</Badge>;
    case "missing_data":
      return <Badge className="bg-amber-50 text-amber-900 border border-amber-200">Thiếu dữ liệu</Badge>;
    default:
      return <Badge variant="outline" className="border-slate-300 text-slate-700">{s || "-"}</Badge>;
  }
}

const DEFAULT_SEMESTER = "__default_semester__";

export default function StudentInfoCard({
  student,
  semester,
  snapshot,
  semesters,
  selectedSemesterId,
  onChangeSemester,
  loading,
}: {
  student: any;
  semester: any;
  snapshot: any;
  semesters: any[];
  selectedSemesterId: string | null;
  onChangeSemester: (id: string) => void;
  loading?: boolean;
}) {
  return (
    <Card className="border-slate-200/70">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base text-slate-900">Thông tin & Snapshot</CardTitle>

          <div className="w-65">
            <Select
              value={selectedSemesterId ?? DEFAULT_SEMESTER}
              onValueChange={(v) => v !== DEFAULT_SEMESTER && onChangeSemester(v)}
              disabled={loading}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Chọn học kỳ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DEFAULT_SEMESTER} disabled>
                  Chọn học kỳ
                </SelectItem>
                {semesters.map((s: any) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.semester_code} — {s.name}
                    {s.is_current ? " (hiện tại)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="text-xs text-slate-600">Sinh viên</div>
            <div className="mt-1 font-medium text-slate-900">{fmt(student?.full_name)}</div>
            <div className="text-sm text-slate-600">
              {fmt(student?.student_code)} • {fmt(student?.academic_status)}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="text-xs text-slate-600">Liên hệ</div>
            <div className="mt-1 text-sm text-slate-900">Email: {fmt(student?.email)}</div>
            <div className="text-sm text-slate-900">Phone: {fmt(student?.phone)}</div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-600">Học kỳ</div>
            <div className="mt-1 text-sm text-slate-900">
              {fmt(semester?.semester_code)} — {fmt(semester?.name)}
            </div>
            <div className="mt-2">{dataStatusBadge(snapshot?.data_status)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          {[
            ["GPA HK", snapshot?.gpa_semester],
            ["GPA TL", snapshot?.gpa_cumulative],
            ["TC đậu", snapshot?.credits_earned_semester],
            ["TC rớt", snapshot?.credits_failed_semester],
            ["Môn rớt", snapshot?.failed_courses_count_semester],
            ["Data", snapshot?.data_status],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="text-xs text-slate-600">{k}</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">{fmt(v)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
