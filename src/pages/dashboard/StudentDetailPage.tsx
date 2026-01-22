import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import {
  advisorService,
  type StudentDetailResponse,
  type WarningItem,
} from "@/services/advisor.service";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import BackButton from "@/feature/BackButton";
import StudentSummaryCard from "@/feature/StudentSummaryCard";
import { fmtNumber } from "@/utils/numbers";
import WarningsPanel from "@/feature/WarningsPanel";
import NotesPanel from "@/feature/NotesPanel";
import SemesterGradesTable from "@/pages/dashboard/components/SemesterGradesTable";

function qs(search: string) {
  return new URLSearchParams(search);
}

export default function StudentDetailPage() {
  const { id } = useParams();
  const studentId = String(id ?? "");
  const loc = useLocation();
  const nav = useNavigate();

  const semesterId = qs(loc.search).get("semester_id") ?? "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<StudentDetailResponse | null>(null);
  console.log("data: ", data);
  const [notesError, setNotesError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!studentId || !semesterId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await advisorService.getStudentDetail(studentId, {
        semester_id: semesterId,
        include_grades: true,
      });
      setData(res);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ??
          e?.message ??
          "Load student detail failed",
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [studentId, semesterId]);

  useEffect(() => {
    if (!semesterId) return;
    load();
  }, [semesterId, load]);

  // guard: nếu thiếu semester_id -> điều hướng về dashboard để chọn đúng flow
  useEffect(() => {
    if (!studentId) return;
    if (semesterId) return;
    nav("/dashboard", { replace: true });
  }, [studentId, semesterId, nav]);

  const student = data?.student ?? null;
  const sem = data?.semester ?? null;
  const snapshot = data?.snapshot ?? null;
  const warnings = (data?.warnings ?? []) as WarningItem[];
  const notes = data?.notes ?? [];
  const grades = data?.grades ?? [];
  console.log('grades: ', grades);

  const semesterLabel = useMemo(
    () => (sem ? `${sem.semester_code} — ${sem.name}` : ""),
    [sem],
  );

  const onUpdateWarningStatus = useCallback(
    async (warningId: string, status: "Acknowledged" | "Resolved") => {
      setSaving(true);
      setError(null);
      try {
        await advisorService.updateWarningStatus(warningId, status);
        await load();
      } catch (e: any) {
        setError(
          e?.response?.data?.message ?? e?.message ?? "Update warning failed",
        );
      } finally {
        setSaving(false);
      }
    },
    [load],
  );

  const onCreateNote = useCallback(
    async (payload: {
      content: string;
      counseling_date?: string;
      handling_status: any;
      warning_id?: string;
    }) => {
      setSaving(true);
      setNotesError(null);
      try {
        await advisorService.createNote({
          student_id: studentId,
          content: payload.content,
          counseling_date: payload.counseling_date,
          handling_status: payload.handling_status,
          warning_id: payload.warning_id,
        });
        await load();
      } catch (e: any) {
        setNotesError(
          e?.response?.data?.message ?? e?.message ?? "Create note failed",
        );
      } finally {
        setSaving(false);
      }
    },
    [studentId, load],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xl font-semibold text-slate-900">
            {loading ? (
              <Skeleton className="h-7 w-56" />
            ) : (
              (student?.full_name ?? "Sinh viên")
            )}
          </div>
          <div className="text-sm text-slate-600">
            {loading ? (
              <Skeleton className="h-4 w-72" />
            ) : (
              <>
                MSSV:{" "}
                <span className="font-medium text-slate-900">
                  {student?.student_code ?? "-"}
                </span>
                {" • "}
                Học kỳ:{" "}
                <span className="font-medium text-slate-900">
                  {sem?.semester_code ?? "-"}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <BackButton />
          <Button variant="outline" className="border-slate-300" asChild>
            <Link
              to={`/students/${studentId}/timeline?semester_id=${encodeURIComponent(semesterId)}&return_to=${encodeURIComponent(loc.pathname + loc.search)}`}
            >
              Timeline
            </Link>
          </Button>
          <Button
            variant="outline"
            className="border-slate-300"
            onClick={load}
            disabled={loading || saving}
          >
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

      <StudentSummaryCard
        student={student}
        snapshot={snapshot}
        warningsCount={warnings.length}
        semesterLabel={semesterLabel}
        rightSlot={
          <Button
            className="bg-slate-900 text-slate-50 hover:bg-slate-800"
            asChild
          >
            <Link
              to={`/notes?student_id=${encodeURIComponent(studentId)}&semester_id=${encodeURIComponent(semesterId)}&return_to=${encodeURIComponent(loc.pathname + loc.search)}`}
            >
              Mở Notes
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Card className="border-slate-200/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">GPA học kỳ</CardTitle>
            <CardDescription className="text-xs">
              Snapshot kỳ đang xem
            </CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-slate-900">
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : snapshot ? (
              fmtNumber(snapshot.gpa_semester, 2)
            ) : (
              "-"
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">TC đạt / rớt</CardTitle>
            <CardDescription className="text-xs">Kỳ đang xem</CardDescription>
          </CardHeader>
          <CardContent className="text-lg font-semibold text-slate-900">
            {loading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <>
                {snapshot?.credits_earned_semester ?? "-"} /{" "}
                {snapshot?.credits_failed_semester ?? "-"}
                {" • "}
                Môn rớt: {snapshot?.failed_courses_count_semester ?? "-"}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <WarningsPanel
        loading={loading}
        saving={saving}
        warnings={warnings}
        onUpdateStatus={(warningId, status) =>
          onUpdateWarningStatus(warningId, status)
        }
      />

      <NotesPanel
        loading={loading}
        saving={saving}
        notes={notes}
        warningsForAttach={warnings}
        error={notesError}
        onCreate={onCreateNote}
      />

      {/* <Card className="border-slate-200/70">
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
      </Card> */}
      <SemesterGradesTable
        loading={loading}
        semester={sem}
        grades={grades}
        snapshot={snapshot}
        showSummary={true}
      />
    </div>
  );
}
