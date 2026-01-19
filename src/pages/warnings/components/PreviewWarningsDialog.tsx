import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  loading: boolean;
  data: any;
};

export default function PreviewWarningsDialog({ open, onOpenChange, loading, data }: Props) {
  const error = data?.error;

  const triggered: any[] = data?.triggered ?? [];
  const total = data?.triggered_total ?? triggered.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Preview cảnh báo (FR-08)</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {String(error)}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-700">
                Tổng triggered: <span className="font-semibold text-slate-900">{total}</span>
              </div>
              <Badge variant="outline" className="border-slate-300 text-slate-700">
                {data?.semester?.semester_code ?? "-"} — {data?.semester?.name ?? "-"}
              </Badge>
            </div>

            <div className="max-h-105 overflow-auto rounded-lg border border-slate-200">
              <div className="divide-y">
                {triggered.length === 0 ? (
                  <div className="p-4 text-sm text-slate-600">Không có sinh viên bị trigger rule.</div>
                ) : (
                  triggered.map((t: any, idx: number) => (
                    <div key={idx} className="p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium text-slate-900">
                            {t?.student?.full_name ?? "-"}{" "}
                            <span className="text-slate-600 font-normal">
                              ({t?.student?.student_code ?? "-"})
                            </span>
                          </div>
                          <div className="text-sm text-slate-700">
                            {t?.rule?.rule_code ?? "-"} — {t?.rule?.rule_name ?? "-"}
                          </div>
                          <div className="text-xs text-slate-600 mt-1">
                            {t?.reason_text ?? ""}
                          </div>
                        </div>

                        <Badge className="bg-slate-900 text-slate-50">
                          detected: {t?.detected_value ?? "-"}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
