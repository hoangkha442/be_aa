
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { advisorService } from "@/services/advisor.service";

import StudentSummaryCard from "@/feature/StudentSummaryCard";
import EmptyState from "@/feature/EmptyState";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { fmtNumber, safeNumber } from "@/utils/numbers";
import { makeReturnTo, readReturnTo } from "@/utils/returnTo";
import SemesterGradesTable from "@/pages/dashboard/components/SemesterGradesTable";

type SemesterLite = {
  id: string;
  semester_code: string;
  name: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
};

type SnapshotItem = {
  semester: SemesterLite;
  gpa_semester: number | null;
  gpa_cumulative: number | null;
  credits_earned_semester: number | null;
  credits_failed_semester: number | null;
  failed_courses_count_semester: number | null;
  data_status?: string | null;
};

type WarningItem = {
  id: string;
  semester: { id: string; semester_code: string; name: string };
  status: string;
  detected_value: number | string | null;
  reason_text: string;
  rule: { rule_code: string; rule_name: string; level?: number | null };
  created_at?: string;
};

type AdvisoryNote = {
  id: string;
  content: string;
  counseling_date?: string | null;
  handling_status?: string | null;
  warning_id?: string | null;
  advisor?: { id: string; full_name: string };
  created_at?: string;
};

type GradeItem = {
  id: string;
  attempt_no?: number;
  score_10?: number | null;
  letter_grade?: string | null;
  score_4?: number | null;
  is_pass?: boolean | null;
  updated_at?: string;
  course?: { course_code: string; course_name: string; credits: number };
};

type StudentTimelineResponse = {
  student: {
    id: string;
    student_code: string;
    full_name: string;
    academic_status?: string;
    class?: { id: string; class_code: string; class_name: string };
  };
  focus_semester: SemesterLite;
  snapshots: SnapshotItem[];
  warnings: WarningItem[];
  notes: AdvisoryNote[];
  grades_focus_semester: GradeItem[];
};

function qs(search: string) {
  return new URLSearchParams(search);
}

function fmtDate(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("vi-VN");
}

function sortBySemesterStartDesc(items: SnapshotItem[]) {
  return [...items].sort((a, b) => {
    const da = new Date(a?.semester?.start_date ?? 0).getTime();
    const db = new Date(b?.semester?.start_date ?? 0).getTime();
    return db - da;
  });
}

function countByStatus(warnings: WarningItem[]) {
  const m: Record<string, number> = {};
  for (const w of warnings) {
    const k = String(w.status ?? "Unknown");
    m[k] = (m[k] ?? 0) + 1;
  }
  return m;
}

function inRange(dateIso: string, startIso?: string, endIso?: string) {
  const t = new Date(dateIso).getTime();
  if (Number.isNaN(t)) return false;
  const s = startIso ? new Date(startIso).getTime() : -Infinity;
  const e = endIso ? new Date(endIso).getTime() : Infinity;
  return t >= s && t <= e;
}

export default function StudentTimelinePage() {
  const { id } = useParams();
  const studentId = String(id ?? "");
  const loc = useLocation();
  const nav = useNavigate();

  const returnTo = readReturnTo(loc.search);
  const semesterId = qs(loc.search).get("semester_id") ?? "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<StudentTimelineResponse | null>(null);
  console.log('data: ', data);

  const currentPathReturnTo = useMemo(
    () => makeReturnTo(loc.pathname, loc.search),
    [loc.pathname, loc.search]
  );

  const load = useCallback(async () => {
    if (!studentId || !semesterId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await (advisorService as any).getStudentTimeline(studentId, { semester_id: semesterId });
      setData(res);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? "Load timeline failed");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [studentId, semesterId]);

  // guard: thiếu semester_id => quay về dashboard để chọn đúng flow
  useEffect(() => {
    if (!studentId) return;
    if (semesterId) return;
    nav("/dashboard", { replace: true });
  }, [studentId, semesterId, nav]);

  useEffect(() => {
    if (!studentId || !semesterId) return;
    load();
  }, [studentId, semesterId, load]);

  const student = data?.student ?? null;
  const focus = data?.focus_semester ?? null;

  const snapshots = useMemo(() => sortBySemesterStartDesc(data?.snapshots ?? []), [data?.snapshots]);
  const warnings = data?.warnings ?? [];
  const notes = data?.notes ?? [];
  const grades = data?.grades_focus_semester ?? [];

  const semestersForSelect = useMemo(() => {
    const map = new Map<string, SemesterLite>();
    for (const s of snapshots) map.set(String(s.semester.id), s.semester);
    if (focus?.id) map.set(String(focus.id), focus);
    return Array.from(map.values()).sort((a, b) => {
      const da = new Date(a?.start_date ?? 0).getTime();
      const db = new Date(b?.start_date ?? 0).getTime();
      return db - da;
    });
  }, [snapshots, focus]);

  const snapshotBySemesterId = useMemo(() => {
    const m = new Map<string, SnapshotItem>();
    for (const s of snapshots) m.set(String(s.semester.id), s);
    return m;
  }, [snapshots]);

  const warningsBySemesterId = useMemo(() => {
    const m = new Map<string, WarningItem[]>();
    for (const w of warnings) {
      const sid = String(w?.semester?.id ?? "");
      if (!sid) continue;
      const arr = m.get(sid) ?? [];
      arr.push(w);
      m.set(sid, arr);
    }
    return m;
  }, [warnings]);

  const notesBySemesterId = useMemo(() => {
    const m = new Map<string, AdvisoryNote[]>();
    const warningIndex = new Map<string, WarningItem>();
    for (const w of warnings) warningIndex.set(String(w.id), w);

    for (const n of notes) {
      const wid = n.warning_id ? String(n.warning_id) : "";
      const fromWarning = wid ? warningIndex.get(wid) : null;
      if (fromWarning?.semester?.id) {
        const sid = String(fromWarning.semester.id);
        m.set(sid, [...(m.get(sid) ?? []), n]);
        continue;
      }

      // fallback: map theo counseling_date nằm trong khoảng học kỳ
      const d = n.counseling_date ?? n.created_at ?? "";
      if (!d) continue;

      for (const sem of semestersForSelect) {
        if (!sem?.id) continue;
        if (inRange(d, sem.start_date, sem.end_date)) {
          const sid = String(sem.id);
          m.set(sid, [...(m.get(sid) ?? []), n]);
          break;
        }
      }
    }

    // sort notes inside each semester
    for (const [k, arr] of m.entries()) {
      m.set(
        k,
        [...arr].sort((a, b) => {
          const ta = new Date(a.counseling_date ?? a.created_at ?? 0).getTime();
          const tb = new Date(b.counseling_date ?? b.created_at ?? 0).getTime();
          return tb - ta;
        })
      );
    }
    return m;
  }, [notes, warnings, semestersForSelect]);

  const focusSnapshot = useMemo(() => {
    if (!focus?.id) return null;
    return snapshotBySemesterId.get(String(focus.id)) ?? null;
  }, [focus, snapshotBySemesterId]);

  const focusWarnings = useMemo(() => {
    if (!focus?.id) return [];
    return warningsBySemesterId.get(String(focus.id)) ?? [];
  }, [focus, warningsBySemesterId]);

  const focusNotes = useMemo(() => {
    if (!focus?.id) return [];
    return notesBySemesterId.get(String(focus.id)) ?? [];
  }, [focus, notesBySemesterId]);

  const focusSemesterLabel = useMemo(() => {
    if (!focus) return "";
    return `${focus.semester_code} — ${focus.name}`;
  }, [focus]);

  const onChangeFocusSemester = (nextSemesterId: string) => {
    const sp = new URLSearchParams(loc.search);
    sp.set("semester_id", nextSemesterId);
    if (!sp.get("return_to")) {
      // giữ return_to nếu trước đó chưa có
      if (returnTo) sp.set("return_to", returnTo);
    }
    nav({ pathname: loc.pathname, search: sp.toString() }, { replace: true });
  };

  const onBack = () => {
    if (returnTo) nav(decodeURIComponent(returnTo));
    else nav(-1);
  };

  const toStudentDetail = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("semester_id", semesterId);
    sp.set("return_to", currentPathReturnTo);
    return `/students/${encodeURIComponent(studentId)}?${sp.toString()}`;
  }, [studentId, semesterId, currentPathReturnTo]);

  const toNotesWorkspace = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("student_id", studentId);
    sp.set("semester_id", semesterId);
    sp.set("return_to", currentPathReturnTo);
    return `/notes?${sp.toString()}`;
  }, [studentId, semesterId, currentPathReturnTo]);

  const focusWarningStatusCount = useMemo(() => countByStatus(focusWarnings), [focusWarnings]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xl font-semibold text-slate-900 truncate">
            {loading ? <Skeleton className="h-7 w-72" /> : `Timeline — ${student?.full_name ?? "Sinh viên"}`}
          </div>
          <div className="text-sm text-slate-600">
            {loading ? (
              <Skeleton className="h-4 w-80" />
            ) : (
              <>
                MSSV: <span className="font-medium text-slate-900">{student?.student_code ?? "-"}</span>
                {" • "}
                Lớp: <span className="font-medium text-slate-900">{student?.class?.class_code ?? "-"}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-slate-300" onClick={onBack}>
            Quay lại
          </Button>
          <Button variant="outline" className="border-slate-300" asChild>
            <Link to={toStudentDetail}>Mở chi tiết</Link>
          </Button>
          <Button className="bg-slate-900 text-slate-50 hover:bg-slate-800" asChild>
            <Link to={toNotesWorkspace}>Notes</Link>
          </Button>
        </div>
      </div>

      <Separator />

      {/* Errors */}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Focus selector */}
      <Card className="border-slate-200/70">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base text-slate-900">Học kỳ đang xem</CardTitle>
            </div>

            <div className="w-72">
              <div className="text-xs font-medium text-slate-600 mb-1">Focus học kỳ</div>
              <Select
                value={semesterId || undefined}
                onValueChange={(v) => onChangeFocusSemester(v)}
                disabled={loading || semestersForSelect.length === 0}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Chọn học kỳ" />
                </SelectTrigger>
                <SelectContent>
                  {semestersForSelect.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.semester_code} — {s.name}
                      {s.is_current ? " (hiện tại)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <Skeleton className="h-16 w-full" />
          ) : !data ? (
            <EmptyState title="Không có dữ liệu timeline." />
          ) : (
            <StudentSummaryCard
              student={student}
              snapshot={focusSnapshot}
              warningsCount={focusWarnings.length}
              semesterLabel={focusSemesterLabel}
              rightSlot={
                <Button variant="outline" className="border-slate-300" asChild>
                  <Link to={toStudentDetail}>Vào chi tiết để xử lý</Link>
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Focus highlights */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card className="border-slate-200/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">GPA học kỳ</CardTitle>
            <CardDescription className="text-xs">Kỳ đang xem</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-slate-900">
            {loading ? <Skeleton className="h-7 w-16" /> : (focusSnapshot ? fmtNumber(focusSnapshot.gpa_semester, 2) : "-")}
          </CardContent>
        </Card>

        <Card className="border-slate-200/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">TC đạt / rớt</CardTitle>
            <CardDescription className="text-xs">Kỳ đang xem</CardDescription>
          </CardHeader>
          <CardContent className="text-lg font-semibold text-slate-900">
            {loading ? <Skeleton className="h-6 w-28" /> : (
              <>
                {focusSnapshot?.credits_earned_semester ?? "-"} / {focusSnapshot?.credits_failed_semester ?? "-"}
                {" • "}
                Môn rớt: {focusSnapshot?.failed_courses_count_semester ?? "-"}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cảnh báo kỳ</CardTitle>
            <CardDescription className="text-xs">Theo trạng thái</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-amber-50 text-amber-900 border border-amber-200">
                  Total: {focusWarnings.length}
                </Badge>
                {Object.entries(focusWarningStatusCount).map(([k, v]) => (
                  <Badge key={k} variant="outline" className="border-slate-300 text-slate-700">
                    {k}: {v}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Grades (focus semester only) */}
      {/* <Card className="border-slate-200/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Điểm học kỳ </CardTitle>
          <CardDescription className="text-slate-600">
            Chỉ hiển thị theo học kỳ đang chọn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : grades.length === 0 ? (
            <EmptyState title="Không có dữ liệu điểm trong kỳ." />
          ) : (
            <div className="space-y-2">
              {grades.map((g) => (
                <div key={g.id} className="rounded-lg border border-slate-200 p-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">
                      {g?.course?.course_code ?? "-"} — {g?.course?.course_name ?? "-"}
                    </div>
                    <div className="text-xs text-slate-500">
                      Credits: {g?.course?.credits ?? "-"} • Attempt: {g?.attempt_no ?? 1}
                      {g?.is_pass === false ? " • Rớt" : ""}
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
      </Card> */}

<SemesterGradesTable
  loading={loading}
  semester={focus}
  grades={grades}
  snapshot={focusSnapshot}
  showSummary={false}
/>
      {/* Timeline list (all semesters) */}
      <Card className="border-slate-200/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Timeline học tập</CardTitle>
          <CardDescription className="text-slate-600">
            Lịch sử snapshot theo học kỳ. Mỗi học kỳ có thể mở rộng để xem warnings/notes.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {loading ? (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          ) : snapshots.length === 0 ? (
            <EmptyState title="Chưa có snapshot học kỳ." />
          ) : (
            <div className="space-y-2">
              {snapshots.map((s) => {
                const sid = String(s.semester.id);
                const w = warningsBySemesterId.get(sid) ?? [];
                const n = notesBySemesterId.get(sid) ?? [];

                const semesterLabel = `${s.semester.semester_code} — ${s.semester.name}`;
                const thisReturnTo = makeReturnTo(loc.pathname, loc.search);

                const toDetailThisSemester = `/students/${encodeURIComponent(studentId)}?semester_id=${encodeURIComponent(sid)}&return_to=${encodeURIComponent(thisReturnTo)}`;

                const dataStatus = String(s.data_status ?? "");

                return (
                  <div key={sid} className="rounded-lg border border-slate-200 bg-white">
                    <div className="p-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {semesterLabel}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="border-slate-300 text-slate-700">
                            GPA HK: {fmtNumber(s.gpa_semester, 2)}
                          </Badge>
                          <Badge variant="outline" className="border-slate-300 text-slate-700">
                            GPA TL: {fmtNumber(s.gpa_cumulative, 2)}
                          </Badge>
                          <Badge className="bg-slate-50 text-slate-900 border border-slate-200">
                            TC: {safeNumber(s.credits_earned_semester, 0)}/{safeNumber(s.credits_failed_semester, 0)}
                          </Badge>
                          <Badge className="bg-amber-50 text-amber-900 border border-amber-200">
                            Môn rớt: {safeNumber(s.failed_courses_count_semester, 0)}
                          </Badge>
                          <Badge className="bg-rose-50 text-rose-900 border border-rose-200">
                            Warnings: {w.length}
                          </Badge>
                          {dataStatus && dataStatus !== "ok" && (
                            <Badge variant="outline" className="border-rose-300 text-rose-700">
                              data: {dataStatus}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <Button size="sm" variant="outline" className="border-slate-300" asChild>
                          <Link to={toDetailThisSemester}>Chi tiết</Link>
                        </Button>
                      </div>
                    </div>

                    <details className="border-t border-slate-200">
                      <summary className="cursor-pointer select-none px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        Mở warnings & notes của học kỳ
                      </summary>

                      <div className="p-3 pt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <div className="text-sm font-semibold text-slate-900">Warnings</div>
                          {w.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-4 text-sm text-slate-600">
                              Không có warning.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {w.slice(0, 6).map((it) => (
                                <div key={it.id} className="rounded-lg border border-slate-200 p-3">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                      <div className="text-sm font-medium text-slate-900 truncate">
                                        {it.rule?.rule_code ?? "-"} — {it.rule?.rule_name ?? "Warning"}
                                      </div>
                                      <div className="text-xs text-slate-500">
                                        #{it.id} • {it.status} • detected: {String(it.detected_value ?? "-")}
                                      </div>
                                    </div>
                                    <Badge variant="outline" className="border-slate-300 text-slate-700">
                                      Lv {it.rule?.level ?? "-"}
                                    </Badge>
                                  </div>
                                  <div className="mt-1 text-sm text-slate-700">
                                    {it.reason_text ?? "-"}
                                  </div>
                                </div>
                              ))}
                              {w.length > 6 && (
                                <div className="text-xs text-slate-500">
                                  +{w.length - 6} warnings khác (xem “Chi tiết”)
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm font-semibold text-slate-900">Notes</div>
                          {n.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-4 text-sm text-slate-600">
                              Chưa có note trong kỳ.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {n.slice(0, 6).map((it) => (
                                <div key={it.id} className="rounded-lg border border-slate-200 p-3">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="text-sm font-medium text-slate-900">
                                      {it?.advisor?.full_name ?? "Advisor"}
                                    </div>
                                    <Badge variant="outline" className="border-slate-300 text-slate-700">
                                      {it.handling_status ?? "-"}
                                    </Badge>
                                  </div>
                                  <div className="mt-1 text-sm text-slate-700">{it.content}</div>
                                  <div className="mt-1 text-xs text-slate-500">
                                    counseling: {fmtDate(it.counseling_date ?? null)} • warning_id: {it.warning_id ?? "-"}
                                  </div>
                                </div>
                              ))}
                              {n.length > 6 && (
                                <div className="text-xs text-slate-500">
                                  +{n.length - 6} notes khác
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </details>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Focus semester quick notes preview */}
      <Card className="border-slate-200/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Notes (focus)</CardTitle>
          <CardDescription className="text-slate-600">
            Xem nhanh notes theo kỳ đang xem. Tạo/điều chỉnh notes ở trang Student Detail hoặc Notes workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : !studentId ? (
            <EmptyState title="Thiếu student_id" />
          ) : focusNotes.length === 0 ? (
            <EmptyState title="Chưa có note trong kỳ focus." />
          ) : (
            <div className="space-y-2">
              {focusNotes.slice(0, 6).map((n) => (
                <div key={n.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium text-slate-900">{n?.advisor?.full_name ?? "Advisor"}</div>
                    <Badge variant="outline" className="border-slate-300 text-slate-700">
                      {n.handling_status ?? "-"}
                    </Badge>
                  </div>
                  <div className="mt-1 text-sm text-slate-700">{n.content}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    counseling: {fmtDate(n.counseling_date ?? null)} • warning_id: {n.warning_id ?? "-"}
                  </div>
                </div>
              ))}
              {focusNotes.length > 6 && (
                <div className="text-xs text-slate-500">+{focusNotes.length - 6} notes khác…</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
