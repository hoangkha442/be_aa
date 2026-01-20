import { useCallback, useEffect, useMemo, useState } from "react";
import { advisorService } from "@/services/advisor.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchClassesThunk, fetchSemestersThunk, setSelectedClass, setSelectedSemester } from "@/store/slices/advisorSlice";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

function statusBadge(s: string) {
  const cls =
    s === "Resolved" ? "bg-emerald-50 text-emerald-900 border border-emerald-200" :
    s === "Acknowledged" ? "bg-amber-50 text-amber-900 border border-amber-200" :
    s === "Sent" ? "bg-sky-50 text-sky-900 border border-sky-200" :
    s === "SendFailed" ? "bg-rose-50 text-rose-900 border border-rose-200" :
    "border-slate-300 text-slate-700";
  return <Badge variant={s === "Draft" ? "outline" : "default"} className={cls}>{s}</Badge>;
}

export default function WarningsPage() {
  const dispatch = useAppDispatch();
  const classes = useAppSelector((s: any) => s.advisor?.classes ?? []);
  const semesters = useAppSelector((s: any) => s.advisor?.semesters ?? []);
  const selectedClassId = useAppSelector((s: any) => s.advisor?.selectedClassId) as string | null;
  const selectedSemesterId = useAppSelector((s: any) => s.advisor?.selectedSemesterId) as string | null;

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resp, setResp] = useState<any>(null);

  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    dispatch(fetchClassesThunk(undefined));
    dispatch(fetchSemestersThunk());
  }, [dispatch]);

  useEffect(() => {
    if (selectedClassId) return;
    const first = classes.find((a: any) => a?.class?.id)?.class?.id;
    if (first) dispatch(setSelectedClass(first));
  }, [classes, selectedClassId, dispatch]);

  useEffect(() => {
    if (selectedSemesterId) return;
    const cur = semesters.find((s: any) => s?.is_current)?.id ?? semesters?.[0]?.id;
    if (cur) dispatch(setSelectedSemester(cur));
  }, [semesters, selectedSemesterId, dispatch]);

  const canFetch = Boolean(selectedClassId && selectedSemesterId);

  const load = useCallback(async () => {
    if (!selectedClassId || !selectedSemesterId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await advisorService.listWarnings({
        class_id: selectedClassId,
        semester_id: selectedSemesterId,
        status: statusFilter === "all" ? undefined : statusFilter,
        page,
        limit,
      });
      setResp(res);
      setSelectedIds({});
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? "Load warnings failed");
    } finally {
      setLoading(false);
    }
  }, [selectedClassId, selectedSemesterId, statusFilter, page, limit]);

  useEffect(() => {
    if (!canFetch) return;
    load();
  }, [canFetch, load]);

  const rows: any[] = resp?.data ?? resp?.items ?? [];
  const total = resp?.total ?? rows.length;
  const totalPages = resp?.totalPages ?? 1;

  const checkedIds = useMemo(() => Object.entries(selectedIds).filter(([, v]) => v).map(([k]) => k), [selectedIds]);

  const toggleAll = (val: boolean) => {
    const next: Record<string, boolean> = {};
    rows.forEach((r: any) => { next[String(r.id)] = val; });
    setSelectedIds(next);
  };

  const onUpdateOne = async (warningId: string, status: "Draft" | "Acknowledged" | "Resolved") => {
    setSaving(true);
    setError(null);
    try {
      await advisorService.updateWarningStatus(warningId, status);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? "Update warning failed");
    } finally {
      setSaving(false);
    }
  };

  const onBulk = async (status: "Draft" | "Acknowledged" | "Resolved") => {
    if (checkedIds.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      await advisorService.bulkUpdateWarningStatus({ ids: checkedIds, status });
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? "Bulk update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold text-slate-900">Cảnh báo sớm</div>
        <div className="text-sm text-slate-600">Xem danh sách warnings theo lớp/học kỳ và cập nhật trạng thái.</div>
      </div>
      <Separator />

      <Card className="border-slate-200/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Bộ lọc</CardTitle>
          <CardDescription className="text-slate-600">Chọn lớp/học kỳ (bắt buộc) và trạng thái (tuỳ chọn).</CardDescription>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Lớp</div>
            <select
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
              value={selectedClassId ?? ""}
              onChange={(e) => { setPage(1); dispatch(setSelectedClass(e.target.value)); }}
            >
              {classes.map((a: any) => (
                <option key={a.assignment_id ?? a?.class?.id} value={a?.class?.id}>
                  {a?.class?.class_code} — {a?.class?.class_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Học kỳ</div>
            <select
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
              value={selectedSemesterId ?? ""}
              onChange={(e) => { setPage(1); dispatch(setSelectedSemester(e.target.value)); }}
            >
              {semesters.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.semester_code} — {s.name}{s.is_current ? " (hiện tại)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Status</div>
            <select
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
              value={statusFilter}
              onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
            >
              <option value="all">Tất cả</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="SendFailed">SendFailed</option>
              <option value="Acknowledged">Acknowledged</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <Button variant="outline" className="border-slate-300" onClick={load} disabled={!canFetch || loading || saving}>
              Reload
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <Card className="border-slate-200/70">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Danh sách warnings</CardTitle>
              <CardDescription className="text-slate-600">
                {loading ? "Đang tải..." : `Tổng ${total} • Trang ${page}/${totalPages}`}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" className="border-slate-300" disabled={saving || checkedIds.length === 0} onClick={() => onBulk("Acknowledged")}>
                Bulk Ack
              </Button>
              <Button className="bg-slate-900 text-slate-50 hover:bg-slate-800" disabled={saving || checkedIds.length === 0} onClick={() => onBulk("Resolved")}>
                Bulk Resolve
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-600">
              Không có warnings phù hợp.
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={checkedIds.length === rows.length} onChange={(e) => toggleAll(e.target.checked)} />
                <span className="text-slate-600">Chọn tất cả</span>
                <span className="text-slate-500">({checkedIds.length} đã chọn)</span>

                <div className="ml-auto flex items-center gap-2">
                  <select
                    className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
                    value={limit}
                    onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  >
                    {[10, 20, 50, 100].map((x) => <option key={x} value={x}>{x}/trang</option>)}
                  </select>
                  <Button variant="outline" className="border-slate-300" disabled={page <= 1} onClick={() => setPage(page - 1)}>Trước</Button>
                  <Button variant="outline" className="border-slate-300" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Sau</Button>
                </div>
              </div>

              {rows.map((w: any) => (
                <div key={w.id} className="rounded-lg border border-slate-200 p-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(selectedIds[String(w.id)])}
                      onChange={(e) => setSelectedIds((prev) => ({ ...prev, [String(w.id)]: e.target.checked }))}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        {statusBadge(String(w.status))}
                        <div className="text-sm font-medium text-slate-900">
                          {w?.rule?.rule_code ?? w?.rule_code ?? "RULE"} — {w?.rule?.rule_name ?? w?.rule_name ?? "Warning"}
                        </div>
                        <div className="text-xs text-slate-500">#{w.id}</div>
                      </div>
                      <div className="mt-1 text-sm text-slate-700">{w.reason_text ?? "-"}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        SV: {w?.student?.student_code ?? w?.student_code ?? "-"} • detected: {String(w.detected_value ?? "-")}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-300"
                      disabled={saving || w.status === "Acknowledged" || w.status === "Resolved"}
                      onClick={() => onUpdateOne(String(w.id), "Acknowledged")}
                    >
                      Ack
                    </Button>
                    <Button
                      size="sm"
                      className="bg-slate-900 text-slate-50 hover:bg-slate-800"
                      disabled={saving || w.status === "Resolved"}
                      onClick={() => onUpdateOne(String(w.id), "Resolved")}
                    >
                      Resolve
                    </Button>

                    {/* link nhanh qua chi tiết SV trong đúng semester */}
                    {w?.student?.id && selectedSemesterId && (
                      <Button size="sm" variant="outline" className="border-slate-300" asChild>
                        <a href={`/students/${w.student.id}?semester_id=${encodeURIComponent(selectedSemesterId)}`}>SV</a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
