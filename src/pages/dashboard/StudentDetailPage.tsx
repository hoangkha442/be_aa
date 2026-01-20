import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { advisorService } from "@/services/advisor.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDashboardThunk } from "@/store/slices/advisorSlice";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

function qs(search: string) {
  return new URLSearchParams(search);
}

function safeNumber(n: any, fallback = 0) {
  const num = typeof n === "number" ? n : Number(n);
  return Number.isFinite(num) ? num : fallback;
}

function statusBadge(s: string) {
  switch (s) {
    case "Draft":
      return <Badge variant="outline" className="border-slate-300 text-slate-700">Draft</Badge>;
    case "Sent":
      return <Badge className="bg-sky-50 text-sky-900 border border-sky-200">Sent</Badge>;
    case "SendFailed":
      return <Badge className="bg-rose-50 text-rose-900 border border-rose-200">SendFailed</Badge>;
    case "Acknowledged":
      return <Badge className="bg-amber-50 text-amber-900 border border-amber-200">Acknowledged</Badge>;
    case "Resolved":
      return <Badge className="bg-emerald-50 text-emerald-900 border border-emerald-200">Resolved</Badge>;
    default:
      return <Badge variant="outline" className="border-slate-300 text-slate-700">{s}</Badge>;
  }
}

export default function StudentDetailPage() {
  const { id } = useParams();
  const studentId = String(id ?? "");
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // dùng selection global (để fallback nếu URL chưa có semester_id)
  const selectedSemesterId = useAppSelector((s: any) => s.advisor?.selectedSemesterId) as string | null;
  const selectedClassId = useAppSelector((s: any) => s.advisor?.selectedClassId) as string | null;

  const semesterIdFromUrl = qs(location.search).get("semester_id");
  const focusSemesterId = semesterIdFromUrl ?? selectedSemesterId ?? "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  // note form
  const [noteContent, setNoteContent] = useState("");
  const [noteCounselingDate, setNoteCounselingDate] = useState(""); // yyyy-mm-dd
  const [noteHandlingStatus, setNoteHandlingStatus] = useState<"not_contacted" | "contacted" | "monitoring" | "stable">("contacted");
  const [noteWarningId, setNoteWarningId] = useState<string | undefined>(undefined);

  const load = useCallback(async () => {
    if (!studentId || !focusSemesterId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await advisorService.getStudentDetail(studentId, {
        semester_id: focusSemesterId,
        include_grades: true,
      });
      setData(res);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? "Load student detail failed");
    } finally {
      setLoading(false);
    }
  }, [studentId, focusSemesterId]);

  useEffect(() => {
    load();
  }, [load]);

  // Nếu user vào /students/:id mà không có semester_id, tự gắn vào URL cho UX nhất quán
  useEffect(() => {
    if (!studentId) return;
    if (semesterIdFromUrl) return;
    if (!selectedSemesterId) return;
    navigate(`/students/${studentId}?semester_id=${encodeURIComponent(selectedSemesterId)}`, { replace: true });
  }, [studentId, semesterIdFromUrl, selectedSemesterId, navigate]);

  const student = data?.student ?? null;
  const semester = data?.semester ?? data?.focus_semester ?? null; // tùy backend bạn trả field nào
  const snapshot = data?.snapshot ?? null;
  const warnings = (data?.warnings ?? []) as any[];
  const grades = (data?.grades ?? data?.grades_focus_semester ?? []) as any[];
  const notes = (data?.notes ?? []) as any[];

  const focusWarnings = useMemo(() => warnings ?? [], [warnings]);

  const onUpdateWarningStatus = useCallback(
    async (warningId: string, status: "Draft" | "Acknowledged" | "Resolved") => {
      setSaving(true);
      setError(null);
      try {
        await advisorService.updateWarningStatus(warningId, status);
        await load();

        // optional: refresh dashboard để KPI/rows đồng bộ nếu bạn muốn
        if (selectedClassId && focusSemesterId) {
          dispatch(fetchDashboardThunk({ class_id: selectedClassId, semester_id: focusSemesterId, warned_only: true }));
        }
      } catch (e: any) {
        setError(e?.response?.data?.message ?? e?.message ?? "Update warning failed");
      } finally {
        setSaving(false);
      }
    },
    [load, dispatch, selectedClassId, focusSemesterId]
  );

  const onCreateNote = useCallback(async () => {
    if (!noteContent.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await advisorService.createNote({
        student_id: studentId,
        warning_id: noteWarningId,
        content: noteContent.trim(),
        counseling_date: noteCounselingDate ? noteCounselingDate : undefined,
        handling_status: noteHandlingStatus,
      });
      setNoteContent("");
      setNoteCounselingDate("");
      setNoteWarningId(undefined);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? "Create note failed");
    } finally {
      setSaving(false);
    }
  }, [noteContent, noteCounselingDate, noteHandlingStatus, noteWarningId, studentId, load]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xl font-semibold text-slate-900">
            {loading ? <Skeleton className="h-7 w-56" /> : (student?.full_name ?? "Sinh viên")}
          </div>
          <div className="text-sm text-slate-600">
            {loading ? (
              <Skeleton className="h-4 w-72" />
            ) : (
              <>
                MSSV: <span className="font-medium text-slate-900">{student?.student_code ?? "-"}</span>
                {" • "}
                Học kỳ: <span className="font-medium text-slate-900">{semester?.semester_code ?? "-"}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-slate-300" asChild>
            <Link to={`/students/${studentId}/timeline?semester_id=${encodeURIComponent(focusSemesterId)}`}>
              Timeline
            </Link>
          </Button>
          <Button variant="outline" className="border-slate-300" onClick={load} disabled={loading || saving}>
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

      {/* Snapshot + KPI */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Card className="border-slate-200/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">GPA học kỳ</CardTitle>
            <CardDescription className="text-xs">Snapshot kỳ đang xem</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-slate-900">
            {loading ? <Skeleton className="h-7 w-16" /> : (snapshot ? safeNumber(snapshot.gpa_semester, 0).toFixed(2) : "-")}
          </CardContent>
        </Card>

        <Card className="border-slate-200/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">GPA tích lũy</CardTitle>
            <CardDescription className="text-xs">Snapshot kỳ đang xem</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-slate-900">
            {loading ? <Skeleton className="h-7 w-16" /> : (snapshot ? safeNumber(snapshot.gpa_cumulative, 0).toFixed(2) : "-")}
          </CardContent>
        </Card>

        <Card className="border-slate-200/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">TC đạt / rớt</CardTitle>
            <CardDescription className="text-xs">Kỳ đang xem</CardDescription>
          </CardHeader>
          <CardContent className="text-lg font-semibold text-slate-900">
            {loading ? <Skeleton className="h-6 w-24" /> : (
              <>
                {snapshot?.credits_earned_semester ?? "-"} / {snapshot?.credits_failed_semester ?? "-"}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cảnh báo</CardTitle>
            <CardDescription className="text-xs">Trong kỳ</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-slate-900">
            {loading ? <Skeleton className="h-7 w-16" /> : safeNumber(focusWarnings.length, 0)}
          </CardContent>
        </Card>
      </div>

      {/* Warnings */}
      <Card className="border-slate-200/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Cảnh báo trong học kỳ</CardTitle>
          <CardDescription className="text-slate-600">
            Bạn có thể “Acknowledged/Resolved” trực tiếp tại đây.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : focusWarnings.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-600">
              Không có cảnh báo trong học kỳ này.
            </div>
          ) : (
            <div className="space-y-2">
              {focusWarnings.map((w: any) => {
                const canAck = w.status !== "Acknowledged" && w.status !== "Resolved";
                const canResolve = w.status !== "Resolved";
                return (
                  <div
                    key={w.id}
                    className="rounded-lg border border-slate-200 bg-white p-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {statusBadge(String(w.status))}
                        <div className="text-sm font-medium text-slate-900 truncate">
                          {w?.rule?.rule_name ?? w?.rule_name ?? "Warning"}
                        </div>
                        <div className="text-xs text-slate-500">
                          #{w.id}
                        </div>
                      </div>

                      <div className="mt-1 text-sm text-slate-700">
                        {w.reason_text ?? "-"}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        detected: <span className="font-medium text-slate-700">{String(w.detected_value ?? "-")}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-300"
                        disabled={!canAck || saving}
                        onClick={() => onUpdateWarningStatus(String(w.id), "Acknowledged")}
                      >
                        Acknowledge
                      </Button>
                      <Button
                        size="sm"
                        className="bg-slate-900 text-slate-50 hover:bg-slate-800"
                        disabled={!canResolve || saving}
                        onClick={() => onUpdateWarningStatus(String(w.id), "Resolved")}
                      >
                        Resolve
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grades */}
      <Card className="border-slate-200/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Điểm học kỳ</CardTitle>
          <CardDescription className="text-slate-600">Grades của học kỳ đang xem</CardDescription>
        </CardHeader>

        <CardContent className="space-y-2">
          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : grades.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-600">
              Không có dữ liệu điểm.
            </div>
          ) : (
            <div className="space-y-2">
              {grades.map((g: any) => (
                <div key={g.id} className="rounded-lg border border-slate-200 p-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">
                      {g?.course?.course_code} — {g?.course?.course_name}
                    </div>
                    <div className="text-xs text-slate-500">
                      Credits: {g?.course?.credits ?? "-"} • Attempt: {g?.attempt_no ?? 1}
                    </div>
                  </div>
                  <div className="text-sm text-slate-900 font-medium tabular-nums">
                    {g.score_10 ?? "-"} / {g.letter_grade ?? "-"} / {g.score_4 ?? "-"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="border-slate-200/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ghi chú tư vấn</CardTitle>
          <CardDescription className="text-slate-600">Tạo note và gắn warning nếu cần</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Create note */}
          <div className="rounded-lg border border-slate-200 p-3 space-y-2">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <div className="md:col-span-2">
                <div className="text-xs font-medium text-slate-600 mb-1">Nội dung</div>
                <Textarea
                  value={noteContent}
                  onChange={(e: any) => setNoteContent(e.target.value)}
                  placeholder="Nhập ghi chú tư vấn..."
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <div>
                  <div className="text-xs font-medium text-slate-600 mb-1">Ngày tư vấn (optional)</div>
                  <Input
                    type="date"
                    value={noteCounselingDate}
                    onChange={(e) => setNoteCounselingDate(e.target.value)}
                    className="bg-white"
                  />
                </div>

                <div>
                  <div className="text-xs font-medium text-slate-600 mb-1">Gắn warning (optional)</div>
                  <select
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
                    value={noteWarningId ?? ""}
                    onChange={(e) => setNoteWarningId(e.target.value ? e.target.value : undefined)}
                  >
                    <option value="">(không gắn)</option>
                    {focusWarnings.map((w: any) => (
                      <option key={w.id} value={String(w.id)}>
                        #{w.id} — {w?.rule?.rule_code ?? w?.rule?.rule_name ?? "Warning"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="text-xs font-medium text-slate-600 mb-1">Trạng thái xử lý</div>
                  <select
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
                    value={noteHandlingStatus}
                    onChange={(e) => setNoteHandlingStatus(e.target.value as any)}
                  >
                    <option value="not_contacted">Chưa liên hệ</option>
                    <option value="contacted">Đã liên hệ</option>
                    <option value="monitoring">Theo dõi</option>
                    <option value="stable">Ổn định</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                className="bg-slate-900 text-slate-50 hover:bg-slate-800"
                disabled={saving || !noteContent.trim()}
                onClick={onCreateNote}
              >
                Tạo ghi chú
              </Button>
            </div>
          </div>

          {/* Notes list */}
          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : notes.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-600">
              Chưa có ghi chú.
            </div>
          ) : (
            <div className="space-y-2">
              {notes.map((n: any) => (
                <div key={n.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium text-slate-900">
                      {n?.advisor?.full_name ?? "Advisor"}
                    </div>
                    <Badge variant="outline" className="border-slate-300 text-slate-700">
                      {n.handling_status ?? "-"}
                    </Badge>
                  </div>
                  <div className="mt-1 text-sm text-slate-700">{n.content}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    warning_id: {n.warning_id ?? "-"} • counseling_date: {n.counseling_date ?? "-"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
