import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import WarningStatusBadge from "./WarningStatusBadge";
import EmptyState from "./EmptyState";
import type { WarningItem } from "@/services/advisor.service";

export default function WarningsPanel({
  loading,
  saving,
  warnings,
  onUpdateStatus,
}: {
  loading: boolean;
  saving: boolean;
  warnings: WarningItem[];
  onUpdateStatus: (warningId: string, status: "Acknowledged" | "Resolved") => void;
}) {
  return (
    <Card className="border-slate-200/70">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Cảnh báo trong học kỳ</CardTitle>
        <CardDescription className="text-slate-600">
          Xử lý nhanh: Acknowledge / Resolve.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : warnings.length === 0 ? (
          <EmptyState title="Không có cảnh báo trong học kỳ này." />
        ) : (
          <div className="space-y-2">
            {warnings.map((w) => {
              const canAck = w.status !== "Acknowledged" && w.status !== "Resolved";
              const canResolve = w.status !== "Resolved";
              return (
                <div
                  key={w.id}
                  className="rounded-lg border border-slate-200 bg-white p-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <WarningStatusBadge status={String(w.status)} />
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {w?.rule?.rule_name ?? w?.rule?.rule_code ?? "Warning"}
                      </div>
                      <div className="text-xs text-slate-500">#{w.id}</div>
                    </div>
                    <div className="mt-1 text-sm text-slate-700">{w.reason_text ?? "-"}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      detected: <span className="font-medium text-slate-700">{String(w.detected_value ?? "-")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-300"
                      disabled={!canAck || saving}
                      onClick={() => onUpdateStatus(String(w.id), "Acknowledged")}
                    >
                      Acknowledge
                    </Button>
                    <Button
                      size="sm"
                      className="bg-slate-900 text-slate-50 hover:bg-slate-800"
                      disabled={!canResolve || saving}
                      onClick={() => onUpdateStatus(String(w.id), "Resolved")}
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
