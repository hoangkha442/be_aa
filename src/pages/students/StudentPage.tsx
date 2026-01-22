import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { advisorService, type DashboardResponse, type DashboardRow } from "@/services/advisor.service";

import AdvisorScopeBar from "@/feature/AdvisorScopeBar";
import EmptyState from "@/feature/EmptyState";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { useAdvisorScope } from "@/hooks/useAdvisorScope";
import { makeReturnTo } from "@/utils/returnTo";
import { parseMaybeNumber, safeNumber } from "@/utils/numbers";

import StudentFilters, { DEFAULT_FILTERS, type StudentFilterState } from "@/pages/dashboard/components/StudentFilters";
import StudentsTable from "@/pages/dashboard/components/StudentsTable";

export default function StudentsPage() {
  const loc = useLocation();
  const returnTo = useMemo(() => makeReturnTo(loc.pathname, loc.search), [loc.pathname, loc.search]);

  const { classes, semesters, classId, semesterId, setClassId, setSemesterId, ready } = useAdvisorScope();

  const [onlyWarned, setOnlyWarned] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resp, setResp] = useState<DashboardResponse | null>(null);

  const [filters, setFilters] = useState<StudentFilterState>(DEFAULT_FILTERS);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const load = useCallback(async () => {
    if (!classId || !semesterId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await advisorService.getDashboard({
        class_id: classId,
        semester_id: semesterId,
        page: 1,
        limit: 500,
        warned_only: onlyWarned,
      });
      setResp(res);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? "Load students failed");
      setResp(null);
    } finally {
      setLoading(false);
    }
  }, [classId, semesterId, onlyWarned]);

  useEffect(() => {
    if (!ready) return;
    setPage(1);
    load();
  }, [ready, classId, semesterId, onlyWarned, load]);

  const rows: DashboardRow[] = resp?.students?.data ?? [];

  const filteredRows = useMemo(() => {
    let out = [...rows];

    const q = filters.q.trim().toLowerCase();
    if (q) {
      out = out.filter((r: any) => {
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
      const want = filters.dataStatus;
      out = out.filter((r) => {
        const ds = String(r?.snapshot?.data_status ?? "");
        if (want === "missing") return ds === "missing" || ds === "missing_data";
        return ds === want;
      });
    }

    // warningMode vẫn dùng được kể cả khi onlyWarned=false
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
    if (gpaMin !== null) out = out.filter((r) => safeNumber(r?.snapshot?.gpa_semester, -Infinity) >= gpaMin);
    if (gpaMax !== null) out = out.filter((r) => safeNumber(r?.snapshot?.gpa_semester, Infinity) <= gpaMax);

    const failedMin = parseMaybeNumber(filters.failedCoursesMin);
    if (failedMin !== null) out = out.filter((r) => safeNumber(r?.snapshot?.failed_courses_count_semester, 0) >= failedMin);

    out.sort((a: any, b: any) => {
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

  const total = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">Sinh viên</h1>
            <p className="text-sm text-slate-600">
              Tra cứu theo lớp/học kỳ. Dashboard là chế độ “xử lý cảnh báo”, còn page này là “tra cứu tổng”.
            </p>
          </div>

          <Button variant="outline" className="border-slate-300" disabled={!ready || loading} onClick={load}>
            Reload
          </Button>
        </div>
        <Separator />
      </div>

      <AdvisorScopeBar
        classes={classes}
        semesters={semesters}
        classId={classId}
        semesterId={semesterId}
        onChangeClassId={(id) => {
          setPage(1);
          setClassId(id);
        }}
        onChangeSemesterId={(id) => {
          setPage(1);
          setSemesterId(id);
        }}
        bottomSlot={
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={onlyWarned}
              onChange={(e) => {
                setPage(1);
                setOnlyWarned(e.target.checked);
              }}
            />
            Chỉ hiển thị SV có cảnh báo
          </label>
        }
      />

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {String(error)}
        </div>
      )}

      <StudentFilters
        value={filters}
        onChange={(n) => {
          setPage(1);
          setFilters(n);
        }}
        shownCount={filteredRows.length}
        totalCount={rows.length}
      />

      <Card className="border-slate-200/70">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base text-slate-900">Danh sách sinh viên</CardTitle>
              <CardDescription className="text-slate-600">
                {ready ? <>Hiển thị {total} SV (sau lọc)</> : "Chọn lớp & học kỳ để hiển thị."}
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-slate-300 text-slate-700">
              Lọc: {filteredRows.length}/{rows.length}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {!ready ? (
            <EmptyState title="Vui lòng chọn lớp và học kỳ" description="Hệ thống sẽ tải dữ liệu sau khi bạn chọn đầy đủ." />
          ) : loading && !resp ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filteredRows.length === 0 ? (
            <EmptyState title="Không có sinh viên phù hợp" description="Thử đổi bộ lọc hoặc đổi học kỳ." />
          ) : (
            <StudentsTable
              rows={pageRows}
              semesterId={semesterId!}
              returnTo={returnTo}
              loading={loading}
              page={currentPage}
              pageSize={pageSize}
              total={total}
              totalPages={totalPages}
              onChangePage={(p) => setPage(Math.max(1, Math.min(totalPages, p)))}
              onChangePageSize={(n) => {
                setPageSize(n);
                setPage(1);
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
