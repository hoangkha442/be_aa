import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchClassesThunk,
  fetchSemestersThunk,
  fetchDashboardThunk,
  setSelectedClass,
  setSelectedSemester,
} from "@/store/slices/advisorSlice";
import { advisorService } from "@/services/advisor.service";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { cn } from "@/lib/utils";
import { RefreshCcw, Search, UserRound, Mail, Phone, GraduationCap, TriangleAlert } from "lucide-react";

// ---------- helpers ----------
type LoadStatus = "idle" | "loading" | "succeeded" | "failed";

const DEFAULT_CLASS = "__no_class__";
const DEFAULT_SEMESTER = "__default_semester__";

type FilterState = {
  q: string;
  warningMode: "all" | "none" | "has" | "gte2";
  academicStatus: "all" | "studying" | "paused" | "dropped";
  dataStatus: "all" | "ok" | "missing" | "error";
  gpaMin: string;
  gpaMax: string;
  sort: "name_asc" | "gpa_asc" | "gpa_desc" | "warnings_desc";
};

const DEFAULT_FILTERS: FilterState = {
  q: "",
  warningMode: "all",
  academicStatus: "all",
  dataStatus: "all",
  gpaMin: "",
  gpaMax: "",
  sort: "name_asc",
};

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

function fmtNumber(n: any, digits = 2) {
  const num = safeNumber(n, NaN);
  if (!Number.isFinite(num)) return "-";
  return num.toFixed(digits);
}

function StatusBadge({ status, hasSelection }: { status: LoadStatus; hasSelection: boolean }) {
  const s = !hasSelection
    ? { label: "Chưa chọn lớp", cls: "bg-amber-50 text-amber-900 border border-amber-200" }
    : status === "loading"
    ? { label: "Đang tải", cls: "bg-indigo-50 text-indigo-900 border border-indigo-200" }
    : status === "failed"
    ? { label: "Có lỗi", cls: "bg-rose-50 text-rose-900 border border-rose-200" }
    : { label: "Sẵn sàng", cls: "bg-emerald-50 text-emerald-900 border border-emerald-200" };

  return <Badge className={cn("font-medium", s.cls)}>{s.label}</Badge>;
}

function warningsBadge(n: number) {
  if (n <= 0) return <Badge variant="outline" className="border-slate-300 text-slate-700">0</Badge>;
  if (n === 1) return <Badge className="bg-amber-50 text-amber-900 border border-amber-200">1</Badge>;
  return <Badge className="bg-rose-50 text-rose-900 border border-rose-200">{n}</Badge>;
}

function academicStatusBadge(s: string) {
  switch (s) {
    case "studying":
      return <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200">Đang học</Badge>;
    case "paused":
      return <Badge className="bg-amber-50 text-amber-800 border border-amber-200">Tạm dừng</Badge>;
    case "dropped":
      return <Badge className="bg-rose-50 text-rose-800 border border-rose-200">Thôi học</Badge>;
    default:
      return <Badge variant="outline" className="border-slate-300 text-slate-700">{s || "-"}</Badge>;
  }
}

function dataStatusBadge(s: string) {
  switch (s) {
    case "ok":
      return <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200">OK</Badge>;
    case "missing":
      return <Badge className="bg-amber-50 text-amber-800 border border-amber-200">Thiếu dữ liệu</Badge>;
    case "error":
      return <Badge className="bg-rose-50 text-rose-800 border border-rose-200">Lỗi</Badge>;
    default:
      return <Badge variant="outline" className="border-slate-300 text-slate-700">{s || "-"}</Badge>;
  }
}

// ---------- page ----------
export default function StudentsPage() {
  const dispatch = useAppDispatch();
  const advisor = useAppSelector((s: any) => s.advisor);

  const classes: any[] = advisor?.classes ?? [];
  const semesters: any[] = advisor?.semesters ?? [];
  const selectedClassId: string | null = advisor?.selectedClassId ?? null;
  const selectedSemesterId: string | null = advisor?.selectedSemesterId ?? null;

  const dashboard = advisor?.dashboard ?? null;
  const status: LoadStatus = (advisor?.status ?? "idle") as LoadStatus;
  const error: string | null = advisor?.error ?? null;

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<any>(null);

  const reqIdRef = useRef(0);

  // load base lists
  useEffect(() => {
    dispatch(fetchClassesThunk());
    dispatch(fetchSemestersThunk());
  }, [dispatch]);

  const reloadList = useCallback(() => {
    if (!selectedClassId) return;
    dispatch(
      fetchDashboardThunk({
        class_id: selectedClassId,
        semester_id: selectedSemesterId ?? undefined,
        page: 1,
        limit: 50, // fetch more for client-side filtering
      })
    );
  }, [dispatch, selectedClassId, selectedSemesterId]);

  // auto load list when selection changes
  useEffect(() => {
    if (selectedClassId) reloadList();
  }, [selectedClassId, selectedSemesterId, reloadList]);

  // close/clear detail when context changes
  useEffect(() => {
    setDetailOpen(false);
    setDetail(null);
  }, [selectedClassId, selectedSemesterId]);

  const rows: any[] = useMemo(() => {
    const students = dashboard?.students;
    if (!students) return [];
    if (Array.isArray(students)) return students;
    return students?.data ?? [];
  }, [dashboard]);

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

    if (filters.warningMode !== "all") {
      out = out.filter((r) => {
        const w = safeNumber(r?.warnings_total, 0);
        if (filters.warningMode === "none") return w === 0;
        if (filters.warningMode === "has") return w >= 1;
        if (filters.warningMode === "gte2") return w >= 2;
        return true;
      });
    }

    if (filters.academicStatus !== "all") {
      out = out.filter((r) => String(r?.student?.academic_status ?? "") === filters.academicStatus);
    }

    if (filters.dataStatus !== "all") {
      out = out.filter((r) => String(r?.snapshot?.data_status ?? "") === filters.dataStatus);
    }

    const gpaMin = parseMaybeNumber(filters.gpaMin);
    const gpaMax = parseMaybeNumber(filters.gpaMax);
    if (gpaMin !== null) out = out.filter((r) => safeNumber(r?.snapshot?.gpa_semester, -Infinity) >= gpaMin);
    if (gpaMax !== null) out = out.filter((r) => safeNumber(r?.snapshot?.gpa_semester, Infinity) <= gpaMax);

    out.sort((a, b) => {
      const nameA = String(a?.student?.full_name ?? "");
      const nameB = String(b?.student?.full_name ?? "");
      const gpaA = safeNumber(a?.snapshot?.gpa_semester, -Infinity);
      const gpaB = safeNumber(b?.snapshot?.gpa_semester, -Infinity);
      const wA = safeNumber(a?.warnings_total, 0);
      const wB = safeNumber(b?.warnings_total, 0);

      switch (filters.sort) {
        case "gpa_asc":
          return gpaA - gpaB;
        case "gpa_desc":
          return gpaB - gpaA;
        case "warnings_desc":
          return wB - wA;
        case "name_asc":
        default:
          return nameA.localeCompare(nameB, "vi");
      }
    });

    return out;
  }, [rows, filters]);

  const hasSelection = Boolean(selectedClassId);

  const openDetail = useCallback(
    async (studentId: string) => {
      if (!studentId) return;

      setDetailOpen(true);
      setDetail(null);
      setDetailLoading(true);

      const myReq = ++reqIdRef.current;

      try {
        const data = await advisorService.getStudentDetail(studentId, {
          semester_id: selectedSemesterId ?? undefined,
          include_grades: true,
        });

        // ignore stale response
        if (reqIdRef.current !== myReq) return;

        setDetail(data);
      } finally {
        if (reqIdRef.current === myReq) setDetailLoading(false);
      }
    },
    [selectedSemesterId]
  );

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="space-y-2">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
            Sinh viên
          </h1>
          <p className="text-sm text-slate-600">
            Tra cứu nhanh, lọc theo cảnh báo và xem hồ sơ chi tiết.
          </p>
        </div>
        <Separator />
      </div>

      {/* Context selection: class / semester */}
      <Card className="border-slate-200/70">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base text-slate-900">Phạm vi dữ liệu</CardTitle>
              <CardDescription className="text-slate-600">
                Chọn lớp và học kỳ để tải danh sách sinh viên.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={status} hasSelection={hasSelection} />
              <Button
                onClick={reloadList}
                disabled={!hasSelection || status === "loading"}
                className="gap-2 bg-slate-900 text-slate-50 hover:bg-slate-800"
              >
                <RefreshCcw className="h-4 w-4" />
                Làm mới
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-600">Lớp</div>
            <Select
              value={selectedClassId ?? DEFAULT_CLASS}
              onValueChange={(v) => {
                if (v === DEFAULT_CLASS) return;
                dispatch(setSelectedClass(v));
              }}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Chọn lớp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DEFAULT_CLASS} disabled>
                  Chọn lớp
                </SelectItem>
                {classes.map((a: any) => {
                  const id = a?.class?.id;
                  if (!id) return null;
                  return (
                    <SelectItem key={a.assignment_id ?? id} value={id}>
                      {a?.class?.class_code} — {a?.class?.class_name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-600">Học kỳ</div>
            <Select
              value={selectedSemesterId ?? DEFAULT_SEMESTER}
              onValueChange={(v) => dispatch(setSelectedSemester(v === DEFAULT_SEMESTER ? null : v))}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="(mặc định)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DEFAULT_SEMESTER}>(mặc định)</SelectItem>
                {semesters.map((s: any) => {
                  const id = s?.id;
                  if (!id) return null;
                  return (
                    <SelectItem key={id} value={id}>
                      {s?.semester_code} — {s?.name}
                      {s?.is_current ? " (hiện tại)" : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="md:col-span-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {String(error)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border-slate-200/70">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base text-slate-900">Bộ lọc</CardTitle>
              <CardDescription className="text-slate-600">
                Lọc nhanh theo cảnh báo, GPA và trạng thái.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="bg-slate-900 text-slate-50">
                {filteredRows.length}/{rows.length}
              </Badge>
              <Button
                variant="outline"
                className="border-slate-300"
                onClick={() => setFilters(DEFAULT_FILTERS)}
                disabled={
                  JSON.stringify(filters) === JSON.stringify(DEFAULT_FILTERS)
                }
              >
                Đặt lại
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-12">
          {/* Search */}
          <div className="md:col-span-4 space-y-1">
            <div className="text-xs font-medium text-slate-600">Tìm kiếm</div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                value={filters.q}
                onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
                placeholder="Mã SV hoặc họ tên"
                className="bg-white pl-9"
              />
            </div>
          </div>

          {/* Warning mode */}
          <div className="md:col-span-2 space-y-1">
            <div className="text-xs font-medium text-slate-600">Cảnh báo</div>
            <Select
              value={filters.warningMode}
              onValueChange={(v: any) => setFilters((p) => ({ ...p, warningMode: v }))}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="none">0 cảnh báo</SelectItem>
                <SelectItem value="has">Có cảnh báo</SelectItem>
                <SelectItem value="gte2">≥ 2 cảnh báo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Academic status */}
          <div className="md:col-span-2 space-y-1">
            <div className="text-xs font-medium text-slate-600">Học vụ</div>
            <Select
              value={filters.academicStatus}
              onValueChange={(v: any) => setFilters((p) => ({ ...p, academicStatus: v }))}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="studying">Đang học</SelectItem>
                <SelectItem value="paused">Tạm dừng</SelectItem>
                <SelectItem value="dropped">Thôi học</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data status */}
          <div className="md:col-span-2 space-y-1">
            <div className="text-xs font-medium text-slate-600">Dữ liệu</div>
            <Select
              value={filters.dataStatus}
              onValueChange={(v: any) => setFilters((p) => ({ ...p, dataStatus: v }))}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="ok">OK</SelectItem>
                <SelectItem value="missing">Thiếu</SelectItem>
                <SelectItem value="error">Lỗi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* GPA min/max */}
          <div className="md:col-span-1 space-y-1">
            <div className="text-xs font-medium text-slate-600">GPA min</div>
            <Input
              value={filters.gpaMin}
              onChange={(e) => setFilters((p) => ({ ...p, gpaMin: e.target.value }))}
              placeholder="0"
              inputMode="decimal"
              className="bg-white"
            />
          </div>
          <div className="md:col-span-1 space-y-1">
            <div className="text-xs font-medium text-slate-600">GPA max</div>
            <Input
              value={filters.gpaMax}
              onChange={(e) => setFilters((p) => ({ ...p, gpaMax: e.target.value }))}
              placeholder="4"
              inputMode="decimal"
              className="bg-white"
            />
          </div>

          {/* Sort */}
          <div className="md:col-span-2 space-y-1">
            <div className="text-xs font-medium text-slate-600">Sắp xếp</div>
            <Select
              value={filters.sort}
              onValueChange={(v: any) => setFilters((p) => ({ ...p, sort: v }))}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Tên A → Z" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name_asc">Tên A → Z</SelectItem>
                <SelectItem value="gpa_desc">GPA HK giảm dần</SelectItem>
                <SelectItem value="gpa_asc">GPA HK tăng dần</SelectItem>
                <SelectItem value="warnings_desc">Cảnh báo giảm dần</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-slate-200/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-slate-900">Danh sách</CardTitle>
          <CardDescription className="text-slate-600">
            Nhấn vào một dòng để xem chi tiết.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!hasSelection ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <div className="text-sm font-medium text-slate-900">Chưa có dữ liệu</div>
              <div className="mt-1 text-sm text-slate-600">Vui lòng chọn lớp để tải danh sách.</div>
            </div>
          ) : status === "loading" && !dashboard ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <div className="text-sm font-medium text-slate-900">Không có kết quả</div>
              <div className="mt-1 text-sm text-slate-600">Thử nới điều kiện lọc hoặc đặt lại.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-35">Mã SV</TableHead>
                    <TableHead className="min-w-55">Họ tên</TableHead>
                    <TableHead>Học vụ</TableHead>
                    <TableHead className="text-right">GPA HK</TableHead>
                    <TableHead className="text-right">TC rớt</TableHead>
                    <TableHead className="text-right">Môn rớt</TableHead>
                    <TableHead className="text-right">Cảnh báo</TableHead>
                    <TableHead>Dữ liệu</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredRows.map((r: any) => {
                    const st = r?.student ?? {};
                    const sn = r?.snapshot ?? {};
                    const warningsTotal = safeNumber(r?.warnings_total, 0);

                    const rowTone =
                      warningsTotal >= 2
                        ? "bg-rose-50/40 hover:bg-rose-50/60"
                        : warningsTotal === 1
                        ? "bg-amber-50/30 hover:bg-amber-50/50"
                        : "hover:bg-slate-50/70";

                    return (
                      <TableRow
                        key={st.id ?? st.student_code}
                        className={cn("cursor-pointer", rowTone)}
                        onClick={() => openDetail(String(st.id))}
                      >
                        <TableCell className="text-slate-800">{st.student_code ?? "-"}</TableCell>
                        <TableCell className="font-medium text-slate-900">{st.full_name ?? "-"}</TableCell>
                        <TableCell>{academicStatusBadge(st.academic_status)}</TableCell>
                        <TableCell className="text-right tabular-nums">{fmtNumber(sn.gpa_semester, 2)}</TableCell>
                        <TableCell className="text-right tabular-nums">{sn.credits_failed_semester ?? "-"}</TableCell>
                        <TableCell className="text-right tabular-nums">{sn.failed_courses_count_semester ?? "-"}</TableCell>
                        <TableCell className="text-right tabular-nums">{warningsBadge(warningsTotal)}</TableCell>
                        <TableCell>{dataStatusBadge(sn.data_status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="outline"
                            className="border-slate-300"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetail(String(st.id));
                            }}
                          >
                            Chi tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Chi tiết sinh viên</DialogTitle>
            <DialogDescription className="text-slate-600">
              Thông tin học vụ, cảnh báo và điểm theo học kỳ.
            </DialogDescription>
          </DialogHeader>

          {/* Content */}
          {detailLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : !detail ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <div className="text-sm font-medium text-slate-900">Chưa có dữ liệu</div>
              <div className="mt-1 text-sm text-slate-600">Chọn một sinh viên để xem hồ sơ.</div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Top summary */}
              <Card className="border-slate-200/70">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-slate-700" />
                        <div className="font-semibold text-slate-900">
                          {detail?.student?.full_name ?? "-"}
                        </div>
                        <Badge variant="outline" className="border-slate-300 text-slate-700">
                          {detail?.student?.student_code ?? "-"}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                        {academicStatusBadge(detail?.student?.academic_status)}
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {detail?.student?.email ?? "-"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {detail?.student?.phone ?? "-"}
                        </span>
                      </div>

                      <div className="text-sm text-slate-600">
                        Lớp:{" "}
                        <span className="text-slate-800 font-medium">
                          {detail?.student?.class?.class_code} — {detail?.student?.class?.class_name}
                        </span>
                        {" • "}
                        Ngành:{" "}
                        <span className="text-slate-800 font-medium">
                          {detail?.student?.class?.major_name}
                        </span>
                        {" • "}
                        Khóa{" "}
                        <span className="text-slate-800 font-medium">
                          {detail?.student?.class?.cohort_year}
                        </span>
                      </div>

                      <div className="text-sm text-slate-600">
                        Học kỳ:{" "}
                        <span className="text-slate-800 font-medium">
                          {detail?.semester?.semester_code} — {detail?.semester?.name}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 md:w-[320px]">
                      <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                        <div className="text-xs text-indigo-900">GPA HK</div>
                        <div className="mt-1 text-xl font-semibold text-indigo-950 tabular-nums">
                          {fmtNumber(detail?.snapshot?.gpa_semester, 2)}
                        </div>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <div className="text-xs text-slate-700">GPA TL</div>
                        <div className="mt-1 text-xl font-semibold text-slate-900 tabular-nums">
                          {fmtNumber(detail?.snapshot?.gpa_cumulative, 2)}
                        </div>
                      </div>

                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                        <div className="text-xs text-emerald-900">TC đậu</div>
                        <div className="mt-1 text-xl font-semibold text-emerald-950 tabular-nums">
                          {detail?.snapshot?.credits_earned_semester ?? "-"}
                        </div>
                      </div>
                      <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                        <div className="text-xs text-rose-900">TC rớt</div>
                        <div className="mt-1 text-xl font-semibold text-rose-950 tabular-nums">
                          {detail?.snapshot?.credits_failed_semester ?? "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Warnings + Notes */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Card className="border-slate-200/70">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-slate-900 flex items-center gap-2">
                      <TriangleAlert className="h-4 w-4 text-slate-700" />
                      Cảnh báo
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      {Array.isArray(detail?.warnings) ? detail.warnings.length : 0} mục
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!detail?.warnings?.length ? (
                      <div className="text-sm text-slate-600">Chưa có cảnh báo.</div>
                    ) : (
                      <div className="space-y-2">
                        {detail.warnings.map((w: any) => (
                          <div key={w.id} className="rounded-lg border border-slate-200 bg-white p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-medium text-slate-900">
                                {w?.rule_name ?? w?.rule_code ?? "Cảnh báo"}
                              </div>
                              <Badge className="bg-amber-50 text-amber-900 border border-amber-200">
                                {w?.status ?? "—"}
                              </Badge>
                            </div>
                            {w?.description && (
                              <div className="mt-1 text-sm text-slate-600">{w.description}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-slate-200/70">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-slate-900 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-slate-700" />
                      Ghi chú tư vấn
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      {Array.isArray(detail?.notes) ? detail.notes.length : 0} mục
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!detail?.notes?.length ? (
                      <div className="text-sm text-slate-600">Chưa có ghi chú.</div>
                    ) : (
                      <div className="space-y-2">
                        {detail.notes.map((n: any) => (
                          <div key={n.id} className="rounded-lg border border-slate-200 bg-white p-3">
                            <div className="text-sm text-slate-900">{n?.content ?? "-"}</div>
                            {n?.counseling_date && (
                              <div className="mt-1 text-xs text-slate-500">{n.counseling_date}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Grades */}
              <Card className="border-slate-200/70">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-slate-900">Bảng điểm</CardTitle>
                  <CardDescription className="text-slate-600">
                    {Array.isArray(detail?.grades) ? detail.grades.length : 0} học phần
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!detail?.grades?.length ? (
                    <div className="text-sm text-slate-600">Chưa có dữ liệu điểm.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-30">Mã HP</TableHead>
                            <TableHead className="min-w-60">Tên học phần</TableHead>
                            <TableHead className="text-right">TC</TableHead>
                            <TableHead className="text-right">Điểm 10</TableHead>
                            <TableHead className="text-right">Chữ</TableHead>
                            <TableHead className="text-right">Điểm 4</TableHead>
                            <TableHead>Kết quả</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {detail.grades.map((g: any) => {
                            const pass = Boolean(g?.is_pass);
                            return (
                              <TableRow key={g.id} className={pass ? "hover:bg-slate-50/70" : "bg-rose-50/30 hover:bg-rose-50/50"}>
                                <TableCell className="text-slate-800">{g?.course?.course_code ?? "-"}</TableCell>
                                <TableCell className="font-medium text-slate-900">{g?.course?.course_name ?? "-"}</TableCell>
                                <TableCell className="text-right tabular-nums">{g?.course?.credits ?? "-"}</TableCell>
                                <TableCell className="text-right tabular-nums">{fmtNumber(g?.score_10, 1)}</TableCell>
                                <TableCell className="text-right tabular-nums">{g?.letter_grade ?? "-"}</TableCell>
                                <TableCell className="text-right tabular-nums">{fmtNumber(g?.score_4, 1)}</TableCell>
                                <TableCell>
                                  {pass ? (
                                    <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200">Đạt</Badge>
                                  ) : (
                                    <Badge className="bg-rose-50 text-rose-800 border border-rose-200">Không đạt</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
