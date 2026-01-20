import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { advisorService } from "@/services/advisor.service";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

function qs(search: string) {
  return new URLSearchParams(search);
}

function statusBadge(s: string) {
  switch (s) {
    case "Acknowledged":
      return <Badge className="bg-amber-50 text-amber-900 border border-amber-200">Acknowledged</Badge>;
    case "Resolved":
      return <Badge className="bg-emerald-50 text-emerald-900 border border-emerald-200">Resolved</Badge>;
    case "Sent":
      return <Badge className="bg-sky-50 text-sky-900 border border-sky-200">Sent</Badge>;
    default:
      return <Badge variant="outline" className="border-slate-300 text-slate-700">{s}</Badge>;
  }
}

export default function StudentTimelinePage() {
  const { id } = useParams();
  const studentId = String(id ?? "");
  const location = useLocation();
  const navigate = useNavigate();

  const semesterId = qs(location.search).get("semester_id") ?? undefined;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const load = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await advisorService.getStudentTimeline(studentId, semesterId ? { semester_id: semesterId } : undefined);
      setData(res);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? "Load timeline failed");
    } finally {
      setLoading(false);
    }
  }, [studentId, semesterId]);

  useEffect(() => {
    load();
  }, [load]);

  const student = data?.student;
  const focusSemester = data?.focus_semester;
  const snapshots = (data?.snapshots ?? []) as any[];
  const warnings = (data?.warnings ?? []) as any[];
  const notes = (data?.notes ?? []) as any[];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xl font-semibold text-slate-900">
            {loading ? <Skeleton className="h-7 w-56" /> : `Timeline — ${student?.full_name ?? "Sinh viên"}`}
          </div>
          <div className="text-sm text-slate-600">
            {loading ? <Skeleton className="h-4 w-72" /> : `MSSV: ${student?.student_code ?? "-"} • Lớp: ${student?.class?.class_code ?? "-"}`}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {focusSemester?.id && (
            <Button variant="outline" className="border-slate-300" asChild>
              <Link to={`/students/${studentId}?semester_id=${encodeURIComponent(String(focusSemester.id))}`}>
                Xem chi tiết kỳ {focusSemester.semester_code}
              </Link>
            </Button>
          )}
          <Button variant="outline" className="border-slate-300" onClick={load} disabled={loading}>
            Reload
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <Separator />

      <Card className="border-slate-200/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Snapshots theo học kỳ</CardTitle>
          <CardDescription className="text-slate-600">
            Chọn một học kỳ để nhảy qua trang chi tiết.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-2">
          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : snapshots.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-600">
              Không có snapshots.
            </div>
          ) : (
            snapshots.map((s: any) => (
              <div key={s?.semester?.id} className="rounded-lg border border-slate-200 p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-900">
                    {s?.semester?.semester_code} — {s?.semester?.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    GPA HK: {s.gpa_semester ?? "-"} • GPA TL: {s.gpa_cumulative ?? "-"} • Rớt: {s.failed_courses_count_semester ?? "-"}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-300"
                  onClick={() => navigate(`/students/${studentId}?semester_id=${encodeURIComponent(String(s?.semester?.id))}`)}
                >
                  Xem kỳ này
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Warnings (toàn bộ)</CardTitle>
          <CardDescription className="text-slate-600">
            Danh sách cảnh báo theo học kỳ (tổng hợp).
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-2">
          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : warnings.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-600">
              Không có warnings.
            </div>
          ) : (
            warnings.map((w: any) => (
              <div key={w.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center gap-2">
                  {statusBadge(String(w.status))}
                  <div className="text-sm font-medium text-slate-900">
                    {w?.rule?.rule_code} — {w?.rule?.rule_name}
                  </div>
                  <div className="text-xs text-slate-500">
                    ({w?.semester?.semester_code})
                  </div>
                </div>
                <div className="mt-1 text-sm text-slate-700">{w.reason_text ?? "-"}</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Notes (toàn bộ)</CardTitle>
          <CardDescription className="text-slate-600">Ghi chú tư vấn theo thời gian</CardDescription>
        </CardHeader>

        <CardContent className="space-y-2">
          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : notes.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-600">
              Chưa có notes.
            </div>
          ) : (
            notes.map((n: any) => (
              <div key={n.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-900">{n?.advisor?.full_name ?? "Advisor"}</div>
                  <Badge variant="outline" className="border-slate-300 text-slate-700">{n.handling_status ?? "-"}</Badge>
                </div>
                <div className="mt-1 text-sm text-slate-700">{n.content}</div>
                <div className="mt-1 text-xs text-slate-500">warning_id: {n.warning_id ?? "-"} • counseling_date: {n.counseling_date ?? "-"}</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
