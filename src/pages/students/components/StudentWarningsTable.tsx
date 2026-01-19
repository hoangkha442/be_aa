import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

function statusBadge(s: string) {
  switch (s) {
    case "Draft":
      return <Badge className="bg-slate-100 text-slate-900 border border-slate-200">Nháp</Badge>;
    case "Sent":
      return <Badge className="bg-emerald-50 text-emerald-900 border border-emerald-200">Đã gửi</Badge>;
    case "SendFailed":
      return <Badge className="bg-rose-50 text-rose-900 border border-rose-200">Gửi lỗi</Badge>;
    case "Acknowledged":
      return <Badge className="bg-amber-50 text-amber-900 border border-amber-200">Đã xem</Badge>;
    case "Resolved":
      return <Badge className="bg-indigo-50 text-indigo-900 border border-indigo-200">Đã xử lý</Badge>;
    default:
      return <Badge variant="outline" className="border-slate-300 text-slate-700">{s || "-"}</Badge>;
  }
}

function fmtDate(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString("vi-VN");
}

export default function StudentWarningsTable({
  warnings,
  loading,
  onAcknowledge,
  onResolve,
}: {
  warnings: any[];
  loading?: boolean;
  onAcknowledge: (warningId: string) => Promise<void>;
  onResolve: (warningId: string) => Promise<void>;
}) {
  return (
    <Card className="border-slate-200/70">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-slate-900">Cảnh báo</CardTitle>
      </CardHeader>

      <CardContent>
        {warnings?.length ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-56">Rule</TableHead>
                  <TableHead className="text-right">Detected</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Gửi</TableHead>
                  <TableHead className="min-w-44 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warnings.map((w: any) => (
                  <TableRow key={w.id} className="hover:bg-slate-50/70">
                    <TableCell className="text-slate-900">
                      <div className="font-medium">
                        {w?.rule?.rule_code ?? "-"} — {w?.rule?.rule_name ?? "-"}
                      </div>
                      <div className="text-xs text-slate-600 line-clamp-1">{w?.reason_text ?? ""}</div>
                    </TableCell>

                    <TableCell className="text-right tabular-nums">
                      {w?.detected_value ?? "-"}
                    </TableCell>

                    <TableCell>{statusBadge(w?.status)}</TableCell>

                    <TableCell className="text-xs text-slate-700">
                      <div>{w?.send?.status ?? "-"}</div>
                      <div className="text-slate-500">{fmtDate(w?.send?.sent_at ?? null)}</div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="inline-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-300"
                          disabled={loading || w?.status === "Acknowledged" || w?.status === "Resolved"}
                          onClick={() => onAcknowledge(w.id)}
                        >
                          Đã xem
                        </Button>
                        <Button
                          size="sm"
                          className="bg-slate-900 text-slate-50 hover:bg-slate-800"
                          disabled={loading || w?.status === "Resolved"}
                          onClick={() => onResolve(w.id)}
                        >
                          Đã xử lý
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-600">
            Không có cảnh báo trong học kỳ này.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
