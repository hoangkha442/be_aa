import { useEffect, useMemo, useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchClassesThunk,
  fetchSemestersThunk,
  fetchDashboardThunk,
  setSelectedClass,
  setSelectedSemester,
} from "@/store/slices/advisorSlice";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap, TriangleAlert, Send } from "lucide-react";

import DashboardToolbar from "./components/DashboardToolbar";
import StudentFilters, { DEFAULT_FILTERS, type StudentFilterState } from "./components/StudentFilters";
import StudentsTable from "./components/StudentsTable";
import KpiCard from "@/pages/dashboard/components/KpiCard";

function safeNumber(n: any, fallback = 0) {
  const num = typeof n === "number" ? n : Number(n);
  return Number.isFinite(num) ? num : fallback;
}
function parseMaybeNumber(s: string): number | null {
  const t = (s ?? "").trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const advisor = useAppSelector((s: any) => s.advisor);

  const classes: any[] = advisor?.classes ?? [];
  const semesters: any[] = advisor?.semesters ?? [];
  const selectedClassId: string | null = advisor?.selectedClassId ?? null;
  const selectedSemesterId: string | null = advisor?.selectedSemesterId ?? null;

  const dashboard = advisor?.dashboard ?? null;
  const status: "idle" | "loading" | "succeeded" | "failed" = advisor?.status ?? "idle";
  const error: string | null = advisor?.error ?? null;

  // FE filters
  const [filters, setFilters] = useState<StudentFilterState>(DEFAULT_FILTERS);

  useEffect(() => {
    dispatch(fetchClassesThunk());
    dispatch(fetchSemestersThunk());
  }, [dispatch]);

  const reload = useCallback(() => {
    if (!selectedClassId) return;
    dispatch(
      fetchDashboardThunk({
        class_id: selectedClassId,
        semester_id: selectedSemesterId ?? undefined,
        page: 1,
        limit: 10,
      })
    );
  }, [dispatch, selectedClassId, selectedSemesterId]);

  useEffect(() => {
    if (selectedClassId) reload();
  }, [selectedClassId, selectedSemesterId, reload]);

  const summary = dashboard?.summary ?? null;
  const studentsPaging = dashboard?.students ?? null;
  const rows: any[] = studentsPaging?.data ?? [];

  // Apply client-side filters
  const filteredRows = useMemo(() => {
    let out = [...rows];

    const q = filters.q.trim().toLowerCase();
    if (q) {
      out = out.filter((r) => {
        const st = r?.student ?? {};
        const name = String(st.full_name ?? "").toLowerCase();
        const code = String(st.student_code ?? "").toLowerCase();
        return name.includes(q) || code.includes(q);
      });
    }

    if (filters.academicStatus !== "all") {
      out = out.filter((r) => String(r?.student?.academic_status ?? "") === filters.academicStatus);
    }

    if (filters.dataStatus !== "all") {
      out = out.filter((r) => String(r?.snapshot?.data_status ?? "") === filters.dataStatus);
    }

    if (filters.warningMode !== "all") {
      out = out.filter((r) => {
        const w = safeNumber(r?.warnings_total, 0);
        if (filters.warningMode === "none") return w === 0;
        if (filters.warningMode === "has") return w >= 1;
        if (filters.warningMode === "gte2") return w >= 2;
        return true;
      });
    }

    const gpaMin = parseMaybeNumber(filters.gpaMin);
    const gpaMax = parseMaybeNumber(filters.gpaMax);
    if (gpaMin !== null) {
      out = out.filter((r) => safeNumber(r?.snapshot?.gpa_semester, -Infinity) >= gpaMin);
    }
    if (gpaMax !== null) {
      out = out.filter((r) => safeNumber(r?.snapshot?.gpa_semester, Infinity) <= gpaMax);
    }

    const failedMin = parseMaybeNumber(filters.failedCoursesMin);
    if (failedMin !== null) {
      out = out.filter((r) => safeNumber(r?.snapshot?.failed_courses_count_semester, 0) >= failedMin);
    }

    // Sort
    out.sort((a, b) => {
      const nameA = String(a?.student?.full_name ?? "");
      const nameB = String(b?.student?.full_name ?? "");
      const gpaA = safeNumber(a?.snapshot?.gpa_semester, -Infinity);
      const gpaB = safeNumber(b?.snapshot?.gpa_semester, -Infinity);
      const wA = safeNumber(a?.warnings_total, 0);
      const wB = safeNumber(b?.warnings_total, 0);

      switch (filters.sort) {
        case "gpa_desc":
          return gpaB - gpaA;
        case "gpa_asc":
          return gpaA - gpaB;
        case "warnings_desc":
          return wB - wA;
        case "warnings_asc":
          return wA - wB;
        case "name_asc":
        default:
          return nameA.localeCompare(nameB, "vi");
      }
    });

    return out;
  }, [rows, filters]);

  const sentCount = safeNumber(summary?.warnings_by_status?.Sent, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="space-y-2">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
            Advisor Dashboard
          </h1>
          <p className="text-sm text-slate-600">
            Theo dõi tổng quan & danh sách sinh viên.
          </p>
        </div>
        <Separator />
      </div>

      <DashboardToolbar
        classes={classes}
        semesters={semesters}
        selectedClassId={selectedClassId}
        selectedSemesterId={selectedSemesterId}
        status={status}
        onChangeClass={(id) => dispatch(setSelectedClass(id))}
        onChangeSemester={(id) => dispatch(setSelectedSemester(id))}
        onReload={reload}
      />

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {String(error)}
        </div>
      )}

      {/* KPI */}
      {/* <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Card className="border-slate-200/70">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-600">Tổng sinh viên</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">
                  {summary ? summary.students_total : <Skeleton className="h-7 w-16" />}
                </div>
              </div>
              <div className="rounded-xl border bg-slate-50 p-2">
                <Users className="h-5 w-5 text-slate-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-600">GPA trung bình (HK)</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">
                  {summary ? safeNumber(summary.avg_gpa_semester, 0).toFixed(2) : <Skeleton className="h-7 w-20" />}
                </div>
              </div>
              <div className="rounded-xl border bg-slate-50 p-2">
                <GraduationCap className="h-5 w-5 text-slate-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-600">Tổng cảnh báo</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">
                  {summary ? summary.warnings_total : <Skeleton className="h-7 w-16" />}
                </div>
              </div>
              <div className="rounded-xl border bg-slate-50 p-2">
                <TriangleAlert className="h-5 w-5 text-slate-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-600">Đã gửi</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">
                  {summary ? sentCount : <Skeleton className="h-7 w-16" />}
                </div>
              </div>
              <div className="rounded-xl border bg-slate-50 p-2">
                <Send className="h-5 w-5 text-slate-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}
<div className="grid grid-cols-1 gap-3 md:grid-cols-4">
  <KpiCard
    label="Tổng sinh viên"
    tone="sky"
    icon={Users}
    value={summary ? summary.students_total : <Skeleton className="h-7 w-16" />}
  />
  <KpiCard
    label="GPA trung bình (HK)"
    tone="indigo"
    icon={GraduationCap}
    value={summary ? safeNumber(summary.avg_gpa_semester, 0).toFixed(2) : <Skeleton className="h-7 w-20" />}
  />
  <KpiCard
    label="Tổng cảnh báo"
    tone="amber"
    icon={TriangleAlert}
    value={summary ? summary.warnings_total : <Skeleton className="h-7 w-16" />}
  />
  <KpiCard
    label="Đã gửi"
    tone="emerald"
    icon={Send}
    value={summary ? sentCount : <Skeleton className="h-7 w-16" />}
  />
</div>
      {/* Filters FE */}
      <StudentFilters
        value={filters}
        onChange={setFilters}
        shownCount={filteredRows.length}
        totalCount={rows.length}
      />

      {/* Students */}
      <Card className="border-slate-200/70">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base text-slate-900">Danh sách sinh viên</CardTitle>
              <CardDescription className="text-slate-600">
                {studentsPaging ? (
                  <>
                    Trang {studentsPaging.page}/{studentsPaging.totalPages} • Tổng {studentsPaging.total} SV
                  </>
                ) : (
                  "Chọn lớp để hiển thị danh sách."
                )}
              </CardDescription>
            </div>

            <Badge variant="outline" className="border-slate-300 text-slate-700">
              Đang lọc: {filteredRows.length}/{rows.length}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {status === "loading" && !dashboard ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !selectedClassId ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <div className="text-sm font-medium text-slate-900">Vui lòng chọn lớp</div>
              <div className="mt-1 text-sm text-slate-600">
                Sau khi chọn lớp, hệ thống sẽ tự tải dữ liệu.
              </div>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <div className="text-sm font-medium text-slate-900">Không có kết quả phù hợp</div>
              <div className="mt-1 text-sm text-slate-600">
                Hãy thử nới điều kiện lọc hoặc bấm “Xoá lọc”.
              </div>
            </div>
          ) : (
            <StudentsTable rows={filteredRows} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
