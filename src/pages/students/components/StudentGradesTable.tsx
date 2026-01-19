import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

function fmt(v: any) {
  return v == null || v === "" ? "-" : String(v);
}

export default function StudentGradesTable({
  grades,
  loading,
}: {
  grades: any[];
  loading?: boolean;
}) {
  return (
    <Card className="border-slate-200/70">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-slate-900">Bảng điểm (học kỳ đang chọn)</CardTitle>
      </CardHeader>

      <CardContent>
        {loading && !grades?.length ? (
          <div className="text-sm text-slate-600">Đang tải...</div>
        ) : grades?.length ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-52">Môn</TableHead>
                  <TableHead className="text-right">TC</TableHead>
                  <TableHead className="text-right">Lần</TableHead>
                  <TableHead className="text-right">Điểm 10</TableHead>
                  <TableHead className="text-right">Điểm 4</TableHead>
                  <TableHead>Chữ</TableHead>
                  <TableHead>Đậu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.map((g: any) => (
                  <TableRow key={g.id} className="hover:bg-slate-50/70">
                    <TableCell className="text-slate-900">
                      <div className="font-medium">
                        {fmt(g?.course?.course_code)} — {fmt(g?.course?.course_name)}
                      </div>
                      <div className="text-xs text-slate-600">{fmt(g?.course?.course_type)}</div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{fmt(g?.course?.credits)}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmt(g?.attempt_no)}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmt(g?.score_10)}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmt(g?.score_4)}</TableCell>
                    <TableCell>{fmt(g?.letter_grade)}</TableCell>
                    <TableCell>
                      {g?.is_pass === true ? (
                        <Badge className="bg-emerald-50 text-emerald-900 border border-emerald-200">Đậu</Badge>
                      ) : g?.is_pass === false ? (
                        <Badge className="bg-rose-50 text-rose-900 border border-rose-200">Rớt</Badge>
                      ) : (
                        <Badge variant="outline" className="border-slate-300 text-slate-700">-</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-600">
            Không có dữ liệu điểm trong học kỳ này.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
