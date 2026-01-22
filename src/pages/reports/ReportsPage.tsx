import { useCallback, useEffect, useMemo, useState } from "react";

import { advisorService, type DashboardResponse } from "@/services/advisor.service";

import AdvisorScopeBar from "@/feature/AdvisorScopeBar";
import EmptyState from "@/feature/EmptyState";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { exportAdvisorReportExcel } from "@/utils/exportReportExcel";

import { useAdvisorScope } from "@/hooks/useAdvisorScope";
import { safeNumber } from "@/utils/numbers";

export default function ReportsPage() {
  const { classes, semesters, classId, semesterId, setClassId, setSemesterId, ready } = useAdvisorScope();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resp, setResp] = useState<DashboardResponse | null>(null);

  const load = useCallback(async () => {
    if (!classId || !semesterId) return;
    setLoading(true);
    setError(null);
    try {
      // MVP: dùng summary từ dashboard (warned_only=true)
      const res = await advisorService.getDashboard({
        class_id: classId,
        semester_id: semesterId,
        page: 1,
        limit: 1,
        warned_only: true,
      });
      setResp(res);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? "Load report failed");
      setResp(null);
    } finally {
      setLoading(false);
    }
  }, [classId, semesterId]);

  useEffect(() => {
    if (!ready) return;
    load();
  }, [ready, classId, semesterId, load]);

  const summary = resp?.summary ?? null;

  const byStatus = useMemo(() => {
    const s = summary?.warnings_by_status ?? {};
    return Object.entries(s).sort((a, b) => safeNumber(b[1], 0) - safeNumber(a[1], 0));
  }, [summary]);
const classLabel = useMemo(() => {
  const c = classes.find((a: any) => String(a?.class?.id) === String(classId))?.class;
  return c ? `${c.class_code ?? ""}-${c.class_name ?? ""}` : String(classId ?? "");
}, [classes, classId]);

const semesterLabel = useMemo(() => {
  const s = semesters.find((x: any) => String(x?.id) === String(semesterId));
  return s ? `${s.semester_code ?? ""}-${s.name ?? ""}` : String(semesterId ?? "");
}, [semesters, semesterId]);
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">Báo cáo</h1>
          </div>

          <Button variant="outline" className="border-slate-300" disabled={!ready || loading} onClick={load}>
            Reload
          </Button>
          <Button
  variant="outline"
  className="border-slate-300"
  disabled={!ready || loading || !summary}
  onClick={() => {
    if (!summary) return;
    exportAdvisorReportExcel({
      classLabel,
      semesterLabel,
      summary: {
        students_total: summary.students_total,
        // avg_gpa_semester: summary.avg_gpa_semester,
        warnings_total: summary.warnings_total,
        warnings_by_status: summary.warnings_by_status,
      },
    });
  }}
>
  Xuất Excel
</Button>

        </div>
        <Separator />
      </div>

      <AdvisorScopeBar
        classes={classes}
        semesters={semesters}
        classId={classId}
        semesterId={semesterId}
        onChangeClassId={setClassId}
        onChangeSemesterId={setSemesterId}
      />

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {String(error)}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Card className="border-slate-200/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">SV bị cảnh báo</CardTitle>
            <CardDescription className="text-xs">warned group</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-slate-900">
            {loading ? <Skeleton className="h-7 w-16" /> : (summary ? summary.students_total : "-")}
          </CardContent>
        </Card>

        <Card className="border-slate-200/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">GPA TB (warned)</CardTitle>
            <CardDescription className="text-xs">theo snapshot</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-slate-900">
            {loading ? <Skeleton className="h-7 w-16" /> : (summary ? safeNumber(summary.avg_gpa_semester, 0).toFixed(2) : "-")}
          </CardContent>
        </Card>

        <Card className="border-slate-200/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tổng cảnh báo</CardTitle>
            <CardDescription className="text-xs">warnings_total</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-slate-900">
            {loading ? <Skeleton className="h-7 w-16" /> : (summary ? summary.warnings_total : "-")}
          </CardContent>
        </Card>

        <Card className="border-slate-200/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Đã gửi</CardTitle>
            <CardDescription className="text-xs">status Sent</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-slate-900">
            {loading ? <Skeleton className="h-7 w-16" /> : (summary ? safeNumber(summary.warnings_by_status?.Sent, 0) : "-")}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Phân bố trạng thái cảnh báo</CardTitle>
          <CardDescription className="text-slate-600">Dùng để theo dõi tiến độ xử lý trong kỳ.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : !ready ? (
            <EmptyState title="Vui lòng chọn lớp và học kỳ" />
          ) : !summary ? (
            <EmptyState title="Chưa có dữ liệu report." />
          ) : byStatus.length === 0 ? (
            <EmptyState title="Không có cảnh báo." />
          ) : (
            <div className="space-y-2">
              {byStatus.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                  <div className="text-sm font-medium text-slate-900">{k}</div>
                  <Badge variant="outline" className="border-slate-300 text-slate-700">
                    {safeNumber(v, 0)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
