import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type LoadStatus = "idle" | "loading" | "succeeded" | "failed";

export function StatusBadge({
  status,
  hasSelection = true,
}: {
  status: LoadStatus;
  hasSelection?: boolean;
}) {
  const s = !hasSelection
    ? { label: "Chưa chọn lớp/học kỳ", className: "bg-amber-50 text-amber-900 border border-amber-200" }
    : status === "loading"
    ? { label: "Đang tải", className: "bg-indigo-50 text-indigo-900 border border-indigo-200" }
    : status === "failed"
    ? { label: "Có lỗi", className: "bg-rose-50 text-rose-900 border border-rose-200" }
    : { label: "Sẵn sàng", className: "bg-emerald-50 text-emerald-900 border border-emerald-200" };

  return <Badge className={cn("font-medium", s.className)}>{s.label}</Badge>;
}
