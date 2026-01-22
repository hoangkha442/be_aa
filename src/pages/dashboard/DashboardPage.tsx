// import { useEffect, useMemo, useCallback, useState } from "react";
// import { useAppDispatch, useAppSelector } from "@/store/hooks";
// import {
//   fetchClassesThunk,
//   fetchSemestersThunk,
//   fetchDashboardThunk,
//   setSelectedClass,
//   setSelectedSemester,
// } from "@/store/slices/advisorSlice";

// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Badge } from "@/components/ui/badge";
// import { Users, GraduationCap, TriangleAlert, Send } from "lucide-react";

// import DashboardToolbar from "./components/DashboardToolbar";
// import StudentFilters, { DEFAULT_FILTERS, type StudentFilterState } from "./components/StudentFilters";
// import StudentsTable from "./components/StudentsTable";
// import KpiCard from "./components/KpiCard";

// function safeNumber(n: any, fallback = 0) {
//   const num = typeof n === "number" ? n : Number(n);
//   return Number.isFinite(num) ? num : fallback;
// }

// function parseMaybeNumber(s: string): number | null {
//   const t = (s ?? "").trim();
//   if (!t) return null;
//   const n = Number(t);
//   return Number.isFinite(n) ? n : null;
// }

// export default function DashboardPage() {
//   const dispatch = useAppDispatch();
//   const advisor = useAppSelector((s: any) => s.advisor);

//   const classes: any[] = advisor?.classes ?? [];
//   const semesters: any[] = advisor?.semesters ?? [];
//   const selectedClassId: string | null = advisor?.selectedClassId ?? null;
//   const selectedSemesterId: string | null = advisor?.selectedSemesterId ?? null;

//   const dashboard = advisor?.dashboard ?? null;
//   const status: "idle" | "loading" | "succeeded" | "failed" = advisor?.status ?? "idle";
//   const error: string | null = advisor?.error ?? null;

//   const [page, setPage] = useState<number>(1);
//   const [limit, setLimit] = useState<number>(10);
//   const [filters, setFilters] = useState<StudentFilterState>(DEFAULT_FILTERS);

//   // 1) load meta once
//   useEffect(() => {
//     dispatch(fetchClassesThunk(undefined));
//     dispatch(fetchSemestersThunk());
//   }, [dispatch]);

//   // 2) auto select first class if none
//   useEffect(() => {
//     if (selectedClassId) return;
//     const first = classes.find((a: any) => a?.class?.id)?.class?.id;
//     if (first) dispatch(setSelectedClass(first));
//   }, [classes, selectedClassId, dispatch]);

//   // 3) auto select current semester if none (bắt buộc)
//   useEffect(() => {
//     if (selectedSemesterId) return;
//     const current = semesters.find((s: any) => s?.is_current)?.id ?? semesters?.[0]?.id;
//     if (current) dispatch(setSelectedSemester(current));
//   }, [semesters, selectedSemesterId, dispatch]);

//   const canFetch = Boolean(selectedClassId && selectedSemesterId);

//   // helper: fetch dashboard (warned_only=true)
//   const doFetch = useCallback(
//     (opts?: { page?: number; limit?: number; q?: string }) => {
//       if (!selectedClassId || !selectedSemesterId) return;

//       const p = opts?.page ?? page;
//       const l = opts?.limit ?? limit;
//       const q = (opts?.q ?? filters.q ?? "").trim();

//       dispatch(
//         fetchDashboardThunk({
//           class_id: selectedClassId,
//           semester_id: selectedSemesterId,
//           page: p,
//           limit: l,
//           q: q || undefined,
//           warned_only: true, // ✅ chỉ SV có cảnh báo trong kỳ
//         })
//       );
//     },
//     [dispatch, selectedClassId, selectedSemesterId, page, limit, filters.q]
//   );

//   // 4) refetch when class/semester changes (reset page)
//   useEffect(() => {
//     if (!canFetch) return;
//     setPage(1);
//     doFetch({ page: 1 });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedClassId, selectedSemesterId]);

//   // 5) server-side search q (debounce)
//   useEffect(() => {
//     if (!canFetch) return;
//     const t = setTimeout(() => {
//       setPage(1);
//       doFetch({ page: 1 });
//     }, 350);
//     return () => clearTimeout(t);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [filters.q, selectedClassId, selectedSemesterId]);

//   const reload = useCallback(() => {
//     if (!canFetch) return;
//     doFetch();
//   }, [canFetch, doFetch]);

//   const summary = dashboard?.summary ?? null;
//   const studentsPaging = dashboard?.students ?? null;

//   const rows: any[] = studentsPaging?.data ?? [];
//   // Dashboard: chỉ hiển thị SV có cảnh báo trong kỳ
// const warnedRows = useMemo(() => {
//   return (rows ?? []).filter((r: any) => Number(r?.warnings_total ?? 0) > 0);
// }, [rows]);

//   const total = safeNumber(studentsPaging?.total, rows.length);
//   const totalPages = safeNumber(studentsPaging?.totalPages, 1);

//   // client filters
//   const filteredRows = useMemo(() => {
//     let out = [...warnedRows];


//     const q = filters.q.trim().toLowerCase();
//     if (q) {
//       out = out.filter((r) => {
//         const st = r?.student ?? {};
//         const name = String(st.full_name ?? "").toLowerCase();
//         const code = String(st.student_code ?? "").toLowerCase();
//         return name.includes(q) || code.includes(q);
//       });
//     }

//     if (filters.academicStatus !== "all") {
//       out = out.filter((r) => String(r?.student?.academic_status ?? "") === filters.academicStatus);
//     }

//     if (filters.dataStatus !== "all") {
//       const want = filters.dataStatus;
//       out = out.filter((r) => {
//         const ds = String(r?.snapshot?.data_status ?? "");
//         if (want === "missing") return ds === "missing" || ds === "missing_data";
//         return ds === want;
//       });
//     }

//     if (filters.warningMode !== "all") {
//       out = out.filter((r) => {
//         const w = safeNumber(r?.warnings_total, 0);
//         if (filters.warningMode === "none") return w === 0;
//         if (filters.warningMode === "has") return w >= 1;
//         if (filters.warningMode === "gte2") return w >= 2;
//         return true;
//       });
//     }

//     const gpaMin = parseMaybeNumber(filters.gpaMin);
//     const gpaMax = parseMaybeNumber(filters.gpaMax);
//     if (gpaMin !== null) out = out.filter((r) => safeNumber(r?.snapshot?.gpa_semester, -Infinity) >= gpaMin);
//     if (gpaMax !== null) out = out.filter((r) => safeNumber(r?.snapshot?.gpa_semester, Infinity) <= gpaMax);

//     const failedMin = parseMaybeNumber(filters.failedCoursesMin);
//     if (failedMin !== null) out = out.filter((r) => safeNumber(r?.snapshot?.failed_courses_count_semester, 0) >= failedMin);

//     out.sort((a, b) => {
//       const nameA = String(a?.student?.full_name ?? "");
//       const nameB = String(b?.student?.full_name ?? "");
//       const gpaA = safeNumber(a?.snapshot?.gpa_semester, -Infinity);
//       const gpaB = safeNumber(b?.snapshot?.gpa_semester, -Infinity);
//       const wA = safeNumber(a?.warnings_total, 0);
//       const wB = safeNumber(b?.warnings_total, 0);

//       switch (filters.sort) {
//         case "gpa_desc":
//           return gpaB - gpaA;
//         case "gpa_asc":
//           return gpaA - gpaB;
//         case "warnings_desc":
//           return wB - wA;
//         case "warnings_asc":
//           return wA - wB;
//         case "name_asc":
//         default:
//           return nameA.localeCompare(nameB, "vi");
//       }
//     });

//     return out;
//   }, [rows, filters]);

//   const sentCount = safeNumber(summary?.warnings_by_status?.Sent, 0);

//   return (
//     <div className="space-y-5">
//       <div className="space-y-2">
//         <div>
//           <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">Advisor Dashboard</h1>
//           <p className="text-sm text-slate-600">Danh sách SV bị cảnh báo theo lớp/học kỳ.</p>
//         </div>
//         <Separator />
//       </div>

//       <DashboardToolbar
//         classes={classes}
//         semesters={semesters}
//         selectedClassId={selectedClassId}
//         selectedSemesterId={selectedSemesterId}
//         status={status}
//         onChangeClass={(id) => {
//           setPage(1);
//           dispatch(setSelectedClass(id));
//         }}
//         onChangeSemester={(id) => {
//           setPage(1);
//           dispatch(setSelectedSemester(id));
//         }}
//         onReload={reload}
//       />

//       {error && (
//         <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
//           {String(error)}
//         </div>
//       )}

//       <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
//         <KpiCard
//           label="SV bị cảnh báo"
//           tone="sky"
//           icon={Users}
//           value={summary ? summary.students_total : <Skeleton className="h-7 w-16" />}
//         />
//         <KpiCard
//           label="GPA TB (nhóm cảnh báo)"
//           tone="indigo"
//           icon={GraduationCap}
//           value={summary ? safeNumber(summary.avg_gpa_semester, 0).toFixed(2) : <Skeleton className="h-7 w-20" />}
//         />
//         <KpiCard
//           label="Tổng cảnh báo"
//           tone="amber"
//           icon={TriangleAlert}
//           value={summary ? summary.warnings_total : <Skeleton className="h-7 w-16" />}
//         />
//         <KpiCard
//           label="Đã gửi"
//           tone="emerald"
//           icon={Send}
//           value={summary ? sentCount : <Skeleton className="h-7 w-16" />}
//         />
//       </div>

//       <StudentFilters
//   value={filters}
//   onChange={setFilters}
//   shownCount={filteredRows.length}
//   totalCount={warnedRows.length}
// />


//       <Card className="border-slate-200/70">
//         <CardHeader className="pb-3">
//           <div className="flex items-start justify-between gap-3">
//             <div>
//               <CardTitle className="text-base text-slate-900">Danh sách sinh viên</CardTitle>
//               <CardDescription className="text-slate-600">
//                 {studentsPaging ? (
//                   <>
//                     Trang {studentsPaging.page}/{studentsPaging.totalPages} • Tổng {studentsPaging.total} SV
//                   </>
//                 ) : (
//                   "Chọn lớp & học kỳ để hiển thị."
//                 )}
//               </CardDescription>
//             </div>

//             <Badge variant="outline" className="border-slate-300 text-slate-700">
//               Đang lọc: {filteredRows.length}/{warnedRows.length}
//             </Badge>
//           </div>
//         </CardHeader>

//         <CardContent>
//           {!canFetch ? (
//             <div className="rounded-lg border border-dashed p-8 text-center">
//               <div className="text-sm font-medium text-slate-900">Vui lòng chọn lớp và học kỳ</div>
//               <div className="mt-1 text-sm text-slate-600">Hệ thống sẽ tự tải dữ liệu sau khi bạn chọn đầy đủ.</div>
//             </div>
//           ) : status === "loading" && !dashboard ? (
//             <div className="space-y-2">
//               <Skeleton className="h-10 w-full" />
//               <Skeleton className="h-10 w-full" />
//               <Skeleton className="h-10 w-full" />
//             </div>
//           ) : filteredRows.length === 0 ? (
//             <div className="rounded-lg border border-dashed p-8 text-center">
//               <div className="text-sm font-medium text-slate-900">Không có SV bị cảnh báo phù hợp</div>
//               <div className="mt-1 text-sm text-slate-600">Hãy thử nới điều kiện lọc hoặc đổi học kỳ.</div>
//             </div>
//           ) : (
//             <StudentsTable
//               rows={filteredRows}
//               semesterId={selectedSemesterId!}
//               page={page}
//               limit={limit}
//               total={total}
//               totalPages={totalPages}
//               loading={status === "loading"}
//               onChangePage={(p: any) => {
//                 const next = Math.max(1, Math.min(totalPages, p));
//                 setPage(next);
//                 doFetch({ page: next });
//               }}
//               onChangeLimit={(l: any) => {
//                 setLimit(l);
//                 setPage(1);
//                 doFetch({ page: 1, limit: l });
//               }}
//             />
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }


import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { advisorService, type DashboardRow, type DashboardResponse } from "@/services/advisor.service";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap, TriangleAlert, Send, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

import StudentFilters, { DEFAULT_FILTERS, type StudentFilterState } from "./components/StudentFilters";
import StudentsTable from "./components/StudentsTable";
import KpiCard from "./components/KpiCard";
import { useAdvisorScope } from "@/hooks/useAdvisorScope";
import { makeReturnTo } from "@/utils/returnTo";
import { parseMaybeNumber, safeNumber } from "@/utils/numbers";
import AdvisorScopeBar from "@/feature/AdvisorScopeBar";
import EmptyState from "@/feature/EmptyState";

export default function DashboardPage() {
  const loc = useLocation();
  const returnTo = useMemo(() => makeReturnTo(loc.pathname, loc.search), [loc.pathname, loc.search]);

  const { classes, semesters, classId, semesterId, setClassId, setSemesterId, ready } = useAdvisorScope();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resp, setResp] = useState<DashboardResponse | null>(null);

  // client UI
  const [filters, setFilters] = useState<StudentFilterState>(DEFAULT_FILTERS);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const load = useCallback(async () => {
    if (!classId || !semesterId) return;
    setLoading(true);
    setError(null);
    try {
      // fetch đủ lớn để client-filter + client-pagination không bị lệch
      const res = await advisorService.getDashboard({
        class_id: classId,
        semester_id: semesterId,
        page: 1,
        limit: 500,
        warned_only: true,
      });
      setResp(res);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? "Load dashboard failed");
      setResp(null);
    } finally {
      setLoading(false);
    }
  }, [classId, semesterId]);

  useEffect(() => {
    if (!ready) return;
    setPage(1);
    load();
  }, [ready, classId, semesterId, load]);

  const summary = resp?.summary ?? null;
  const rows: DashboardRow[] = resp?.students?.data ?? [];

  // warned_only=true rồi, nhưng vẫn giữ guard
  const warnedRows = useMemo(() => rows.filter((r: any) => safeNumber(r?.warnings_total, 0) > 0), [rows]);

  const filteredRows = useMemo(() => {
    let out = [...warnedRows];

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
  }, [warnedRows, filters]);

  // client pagination
  const total = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const sentCount = safeNumber(summary?.warnings_by_status?.Sent, 0);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">Advisor Dashboard</h1>
            <p className="text-sm text-slate-600">Chọn lớp/học kỳ → xem sinh viên bị cảnh báo → vào chi tiết xử lý.</p>
          </div>

          <Button
            variant="outline"
            className="border-slate-300 gap-2"
            disabled={!ready || loading}
            onClick={load}
          >
            <RefreshCcw className="h-4 w-4" />
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
        onChangeClassId={(id: any) => {
          setPage(1);
          setClassId(id);
        }}
        onChangeSemesterId={(id: any) => {
          setPage(1);
          setSemesterId(id);
        }}
        bottomSlot={
          !ready ? <div className="text-xs text-slate-500">* Vui lòng chọn đủ lớp và học kỳ.</div> : null
        }
      />

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {String(error)}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <KpiCard
          label="SV bị cảnh báo"
          tone="sky"
          icon={Users}
          value={summary ? summary.students_total : <Skeleton className="h-7 w-16" />}
        />
        <KpiCard
          label="GPA TB (nhóm cảnh báo)"
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

      <StudentFilters
        value={filters}
        onChange={(n) => {
          setPage(1);
          setFilters(n);
        }}
        shownCount={filteredRows.length}
        totalCount={warnedRows.length}
      />

      <Card className="border-slate-200/70">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base text-slate-900">Danh sách sinh viên</CardTitle>
              <CardDescription className="text-slate-600">
                {ready ? (
                  <>Đang hiển thị {total} SV (sau lọc)</>
                ) : (
                  "Chọn lớp & học kỳ để hiển thị."
                )}
              </CardDescription>
            </div>

            <Badge variant="outline" className="border-slate-300 text-slate-700">
              Lọc: {filteredRows.length}/{warnedRows.length}
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
            <EmptyState title="Không có SV bị cảnh báo phù hợp" description="Hãy thử nới điều kiện lọc hoặc đổi học kỳ." />
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
