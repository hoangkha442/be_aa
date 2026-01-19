import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchClassesThunk,
  fetchSemestersThunk,
  setSelectedClass,
  setSelectedSemester,
} from "@/store/slices/advisorSlice";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import { advisorService } from "@/services/advisor.service";
import type { WarningStatusFilter } from "@/pages/warnings/components/WarningsToolbar";
import WarningsToolbar from "@/pages/warnings/components/WarningsToolbar";
import WarningsTable from "@/pages/warnings/components/WarningsTable";
import PreviewWarningsDialog from "@/pages/warnings/components/PreviewWarningsDialog";

function safeNumber(n: any, fallback = 0) {
  const num = typeof n === "number" ? n : Number(n);
  return Number.isFinite(num) ? num : fallback;
}

type WarningRow = {
  id: string;
  status: "Draft" | "Sent" | "SendFailed" | "Acknowledged" | "Resolved" | string;
  detected_value: number | null;
  reason_text: string;
  student: { id: string; student_code: string; full_name: string };
  rule: { id: string; rule_code: string; rule_name: string };
  send?: { channel?: string | null; status?: string | null; error?: string | null; sent_at?: string | null };
  created_at?: string;
  updated_at?: string;
};

type PagingResp<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function WarningsPage() {
  const dispatch = useAppDispatch();
  const advisor = useAppSelector((s: any) => s.advisor);

  const classes: any[] = advisor?.classes ?? [];
  const semesters: any[] = advisor?.semesters ?? [];
  const selectedClassId: string | null = advisor?.selectedClassId ?? null;
  const selectedSemesterId: string | null = advisor?.selectedSemesterId ?? null;

  // local state for warnings
  const [statusFilter, setStatusFilter] = useState<WarningStatusFilter>("all");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [paging, setPaging] = useState<PagingResp<WarningRow> | null>(null);

  // selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // preview dialog
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // top message
  const [message, setMessage] = useState<string | null>(null);

  // load meta once
  useEffect(() => {
    dispatch(fetchClassesThunk());
    dispatch(fetchSemestersThunk());
  }, [dispatch]);

  // auto select first class if none
  useEffect(() => {
    if (selectedClassId) return;
    const first = classes.find((a: any) => a?.class?.id)?.class?.id;
    if (first) dispatch(setSelectedClass(first));
  }, [classes, selectedClassId, dispatch]);

  // auto select current semester if none (optional)
  useEffect(() => {
    if (selectedSemesterId) return;
    const current = semesters.find((s: any) => s?.is_current)?.id ?? semesters?.[0]?.id;
    if (current) dispatch(setSelectedSemester(current));
  }, [semesters, selectedSemesterId, dispatch]);

  const fetchWarnings = useCallback(async () => {
    if (!selectedClassId) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await advisorService.listWarnings({
        class_id: selectedClassId,
        semester_id: selectedSemesterId ?? undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        page,
        limit,
      });

      // assume buildPaginationResponse shape
      setPaging(res);
      setSelectedIds([]); // reset selection after reload
    } catch (e: any) {
      setError(String(e?.message ?? "Load warnings failed"));
    } finally {
      setLoading(false);
    }
  }, [selectedClassId, selectedSemesterId, statusFilter, page, limit]);

  // refetch when filters change
  useEffect(() => {
    if (!selectedClassId) return;
    fetchWarnings();
  }, [fetchWarnings, selectedClassId]);

  const rows: WarningRow[] = useMemo(() => paging?.data ?? [], [paging]);
  const total = safeNumber(paging?.total, rows.length);
  const totalPages = safeNumber(paging?.totalPages, 1);

  const selectedCount = selectedIds.length;

  const onPreview = useCallback(async () => {
    if (!selectedClassId) return;
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewData(null);

    try {
      const res = await advisorService.previewWarnings({
        class_id: selectedClassId,
        semester_id: selectedSemesterId ?? undefined,
      });
      setPreviewData(res);
    } catch (e: any) {
      setPreviewData({ error: String(e?.message ?? "Preview failed") });
    } finally {
      setPreviewLoading(false);
    }
  }, [selectedClassId, selectedSemesterId]);

  const onGenerateDraft = useCallback(async () => {
    if (!selectedClassId) return;
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      await advisorService.generateWarnings({
        class_id: selectedClassId,
        semester_id: selectedSemesterId ?? undefined,
        create_status: "Draft",
      });
      setMessage("Đã generate warnings (Draft).");
      setPage(1);
      await fetchWarnings();
    } catch (e: any) {
      setError(String(e?.message ?? "Generate draft failed"));
    } finally {
      setLoading(false);
    }
  }, [selectedClassId, selectedSemesterId, fetchWarnings]);

  const onGenerateAndSend = useCallback(async () => {
    if (!selectedClassId) return;
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      await advisorService.generateWarnings({
        class_id: selectedClassId,
        semester_id: selectedSemesterId ?? undefined,
        create_status: "Sent",
        send_channel: "in_app",
      });
      setMessage("Đã generate + gửi warnings.");
      setPage(1);
      await fetchWarnings();
    } catch (e: any) {
      setError(String(e?.message ?? "Generate & send failed"));
    } finally {
      setLoading(false);
    }
  }, [selectedClassId, selectedSemesterId, fetchWarnings]);

  const onSendSelected = useCallback(async () => {
    if (!selectedCount) return;
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      await advisorService.sendWarnings({
        warning_ids: selectedIds,
        channel: "in_app",
      });
      setMessage(`Đã gửi ${selectedCount} cảnh báo.`);
      await fetchWarnings();
    } catch (e: any) {
      setError(String(e?.message ?? "Send warnings failed"));
    } finally {
      setLoading(false);
    }
  }, [selectedIds, selectedCount, fetchWarnings]);

  const onBulkStatus = useCallback(
    async (status: "Acknowledged" | "Resolved") => {
      if (!selectedCount) return;
      setLoading(true);
      setMessage(null);
      setError(null);

      try {
        await advisorService.bulkUpdateWarningStatus({
          ids: selectedIds,
          status,
        });
        setMessage(`Đã cập nhật trạng thái ${selectedCount} warning -> ${status}.`);
        await fetchWarnings();
      } catch (e: any) {
        setError(String(e?.message ?? "Bulk update failed"));
      } finally {
        setLoading(false);
      }
    },
    [selectedIds, selectedCount, fetchWarnings]
  );

  const onUpdateOneStatus = useCallback(
    async (warningId: string, status: "Draft" | "Acknowledged" | "Resolved") => {
      setLoading(true);
      setMessage(null);
      setError(null);

      try {
        await advisorService.updateWarningStatus(warningId, status);
        setMessage(`Đã cập nhật warning ${warningId} -> ${status}.`);
        await fetchWarnings();
      } catch (e: any) {
        setError(String(e?.message ?? "Update status failed"));
      } finally {
        setLoading(false);
      }
    },
    [fetchWarnings]
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="space-y-2">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
            Cảnh báo sớm
          </h1>
          <p className="text-sm text-slate-600">
            Preview → Generate (Draft) → Send / Bulk status.
          </p>
        </div>
        <Separator />
      </div>

      <WarningsToolbar
        classes={classes}
        semesters={semesters}
        selectedClassId={selectedClassId}
        selectedSemesterId={selectedSemesterId}
        statusFilter={statusFilter}
        loading={loading}
        selectedCount={selectedCount}
        onChangeClass={(id: any) => {
          setPage(1);
          dispatch(setSelectedClass(id));
        }}
        onChangeSemester={(id: any) => {
          setPage(1);
          dispatch(setSelectedSemester(id));
        }}
        onChangeStatusFilter={(s: any) => {
          setPage(1);
          setStatusFilter(s);
        }}
        onReload={fetchWarnings}
        onPreview={onPreview}
        onGenerateDraft={onGenerateDraft}
        onGenerateAndSend={onGenerateAndSend}
        onSendSelected={onSendSelected}
        onBulkAcknowledge={() => onBulkStatus("Acknowledged")}
        onBulkResolve={() => onBulkStatus("Resolved")}
      />

      {message && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <Card className="border-slate-200/70">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base text-slate-900">Danh sách cảnh báo</CardTitle>
              <CardDescription className="text-slate-600">
                {paging ? (
                  <>
                    Trang {paging.page}/{paging.totalPages} • Tổng {paging.total} warnings
                  </>
                ) : (
                  "Chọn lớp để tải dữ liệu."
                )}
              </CardDescription>
            </div>

            <Badge variant="outline" className="border-slate-300 text-slate-700">
              Đã chọn: {selectedCount}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {!selectedClassId ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <div className="text-sm font-medium text-slate-900">Vui lòng chọn lớp</div>
              <div className="mt-1 text-sm text-slate-600">
                Sau khi chọn lớp, hệ thống sẽ tải danh sách cảnh báo.
              </div>
            </div>
          ) : loading && !paging ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <div className="text-sm font-medium text-slate-900">Chưa có cảnh báo</div>
              <div className="mt-1 text-sm text-slate-600">
                Hãy thử Preview hoặc Generate warnings.
              </div>
            </div>
          ) : (
            <WarningsTable
              rows={rows}
              loading={loading}
              page={page}
              limit={limit}
              total={total}
              totalPages={totalPages}
              selectedIds={selectedIds}
              onChangeSelectedIds={setSelectedIds}
              onChangePage={(p: any) => setPage(p)}
              onChangeLimit={(l: any) => {
                setLimit(l);
                setPage(1);
              }}
              onUpdateOneStatus={onUpdateOneStatus}
            />
          )}
        </CardContent>
      </Card>

      <PreviewWarningsDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        loading={previewLoading}
        data={previewData}
      />
    </div>
  );
}
