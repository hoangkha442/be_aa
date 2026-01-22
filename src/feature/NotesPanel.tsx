import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import EmptyState from "./EmptyState";
import type { AdvisoryNote, WarningItem } from "@/services/advisor.service";

type HandlingStatus = "not_contacted" | "contacted" | "monitoring" | "stable";

export default function NotesPanel({
  loading,
  saving,
  notes,
  warningsForAttach,
  onCreate,
  error,
}: {
  loading: boolean;
  saving: boolean;
  notes: AdvisoryNote[];
  warningsForAttach?: WarningItem[];
  error?: string | null;
  onCreate: (payload: {
    content: string;
    counseling_date?: string;
    handling_status: HandlingStatus;
    warning_id?: string;
  }) => Promise<void>;
}) {
  const [content, setContent] = useState("");
  const [counselingDate, setCounselingDate] = useState("");
  const [handlingStatus, setHandlingStatus] = useState<HandlingStatus>("contacted");
  const [warningId, setWarningId] = useState("");

  const canSubmit = useMemo(() => content.trim().length > 0 && !saving, [content, saving]);

  return (
    <Card className="border-slate-200/70">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Ghi chú tư vấn</CardTitle>
        <CardDescription className="text-slate-600">
          Tạo note và xem lịch sử (có thể gắn warning).
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="rounded-lg border border-slate-200 p-3 space-y-2">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="text-xs font-medium text-slate-600 mb-1">Nội dung</div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập ghi chú tư vấn..."
                className="bg-white"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <div>
                <div className="text-xs font-medium text-slate-600 mb-1">Ngày tư vấn</div>
                <Input
                  type="date"
                  value={counselingDate}
                  onChange={(e) => setCounselingDate(e.target.value)}
                  className="bg-white"
                  disabled={saving}
                />
              </div>

              <div>
                <div className="text-xs font-medium text-slate-600 mb-1">Gắn warning</div>
                <select
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
                  value={warningId}
                  onChange={(e) => setWarningId(e.target.value)}
                  disabled={saving}
                >
                  <option value="">(không gắn)</option>
                  {(warningsForAttach ?? []).map((w) => (
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
                  value={handlingStatus}
                  onChange={(e) => setHandlingStatus(e.target.value as HandlingStatus)}
                  disabled={saving}
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
              disabled={!canSubmit}
              onClick={async () => {
                const text = content.trim();
                if (!text) return;

                await onCreate({
                  content: text,
                  counseling_date: counselingDate ? counselingDate : undefined,
                  handling_status: handlingStatus,
                  warning_id: warningId ? warningId : undefined,
                });

                setContent("");
                setCounselingDate("");
                setWarningId("");
                setHandlingStatus("contacted");
              }}
            >
              Tạo ghi chú
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : notes.length === 0 ? (
          <EmptyState title="Chưa có ghi chú." />
        ) : (
          <div className="space-y-2">
            {notes.map((n) => (
              <div key={n.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium text-slate-900">{n?.advisor?.full_name ?? "Advisor"}</div>
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
  );
}
