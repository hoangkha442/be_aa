import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

function safeNumber(n: any, fallback = 0) {
  const num = typeof n === "number" ? n : Number(n);
  return Number.isFinite(num) ? num : fallback;
}

function fmtNumber(n: any, digits = 2) {
  const num = safeNumber(n, NaN);
  if (!Number.isFinite(num)) return "-";
  return num.toFixed(digits);
}

function academicStatusBadge(s: string) {
  switch (s) {
    case "studying":
      return (
        <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200">
          Đang học
        </Badge>
      );
    case "paused":
      return (
        <Badge className="bg-amber-50 text-amber-800 border border-amber-200">
          Tạm dừng
        </Badge>
      );
    case "dropped":
      return (
        <Badge className="bg-rose-50 text-rose-800 border border-rose-200">
          Thôi học
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="border-slate-300 text-slate-700">
          {s || "-"}
        </Badge>
      );
  }
}

function dataStatusBadge(s: string) {
  switch (s) {
    case "ok":
      return (
        <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200">
          OK
        </Badge>
      );
    case "missing":
      return (
        <Badge className="bg-amber-50 text-amber-800 border border-amber-200">
          Thiếu dữ liệu
        </Badge>
      );
    case "error":
      return (
        <Badge className="bg-rose-50 text-rose-800 border border-rose-200">
          Lỗi
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="border-slate-300 text-slate-700">
          {s || "-"}
        </Badge>
      );
  }
}

function warningsBadge(n: number) {
  if (n <= 0) {
    return (
      <Badge variant="outline" className="border-slate-300 text-slate-700">
        0
      </Badge>
    );
  }
  if (n === 1) {
    return (
      <Badge className="bg-amber-50 text-amber-900 border border-amber-200">
        1
      </Badge>
    );
  }
  return (
    <Badge className="bg-rose-50 text-rose-900 border border-rose-200">
      {n}
    </Badge>
  );
}
type Props = {
  rows: any[];
};

export default function StudentsTable({ rows }: Props) {
  return (
    <div className="overflow-x-auto">
      {/* <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-45">Sinh viên</TableHead>
            <TableHead className="min-w-30">MSSV</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">GPA HK</TableHead>
            <TableHead className="text-right">GPA TL</TableHead>
            <TableHead className="text-right">TC đậu</TableHead>
            <TableHead className="text-right">TC rớt</TableHead>
            <TableHead className="text-right">Môn rớt</TableHead>
            <TableHead className="text-right">Cảnh báo</TableHead>
            <TableHead>Data</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row: any) => {
            const st = row?.student ?? {};
            const sn = row?.snapshot ?? {};
            const warningsTotal = safeNumber(row?.warnings_total, 0);

            return (
              <TableRow
                key={
                  st.id ?? st.student_code ?? `${st.full_name}-${Math.random()}`
                }
                className="hover:bg-slate-50/70"
              >
                <TableCell className="font-medium text-slate-900">
                  {st.full_name ?? "-"}
                </TableCell>
                <TableCell className="text-slate-700">
                  {st.student_code ?? "-"}
                </TableCell>

                <TableCell>{academicStatusBadge(st.academic_status)}</TableCell>

                <TableCell className="text-right tabular-nums">
                  {fmtNumber(sn.gpa_semester, 2)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {fmtNumber(sn.gpa_cumulative, 2)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {sn.credits_earned_semester ?? "-"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {sn.credits_failed_semester ?? "-"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {sn.failed_courses_count_semester ?? "-"}
                </TableCell>

                {/* <TableCell className="text-right tabular-nums">
                  <Badge
                    variant={warningsTotal > 0 ? "secondary" : "outline"}
                    className={
                      warningsTotal > 0
                        ? "bg-slate-900 text-slate-50"
                        : "border-slate-300 text-slate-700"
                    }
                  >
                    {warningsTotal}
                  </Badge>
                </TableCell> 

                <TableCell className="text-right tabular-nums">
                  {warningsBadge(warningsTotal)}
                </TableCell>

                <TableCell>{dataStatusBadge(sn.data_status)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table> */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-40">Sinh viên</TableHead>
            <TableHead className="min-w-30">MSSV</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">GPA HK</TableHead>
            <TableHead className="text-right">GPA TL</TableHead>
            <TableHead className="text-right">TC đậu</TableHead>
            <TableHead className="text-right">TC rớt</TableHead>
            <TableHead className="text-right">Môn rớt</TableHead>
            <TableHead className="text-right">Cảnh báo</TableHead>
            <TableHead>Data</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row: any) => {
            const st = row?.student ?? {};
            const sn = row?.snapshot ?? {};
            const warningsTotal = safeNumber(row?.warnings_total, 0);

            const rowTone =
              warningsTotal >= 2
                ? "bg-rose-50/40 hover:bg-rose-50/60"
                : warningsTotal === 1
                ? "bg-amber-50/30 hover:bg-amber-50/50"
                : "hover:bg-slate-50/70";

            return (
              <TableRow
                key={
                  st.id ??
                  st.student_code ??
                  `${st.full_name ?? "row"}-${st.student_code ?? "x"}`
                }
                className={cn(rowTone)}
              >
                <TableCell className="font-medium text-slate-900">
                  {st.full_name ?? "-"}
                </TableCell>

                <TableCell className="text-slate-700">
                  {st.student_code ?? "-"}
                </TableCell>

                <TableCell>{academicStatusBadge(st.academic_status)}</TableCell>

                <TableCell className="text-right tabular-nums">
                  {fmtNumber(sn.gpa_semester, 2)}
                </TableCell>

                <TableCell className="text-right tabular-nums">
                  {fmtNumber(sn.gpa_cumulative, 2)}
                </TableCell>

                <TableCell className="text-right tabular-nums">
                  {sn.credits_earned_semester ?? "-"}
                </TableCell>

                <TableCell className="text-right tabular-nums">
                  {sn.credits_failed_semester ?? "-"}
                </TableCell>

                <TableCell className="text-right tabular-nums">
                  {sn.failed_courses_count_semester ?? "-"}
                </TableCell>

                <TableCell className="text-right tabular-nums">
                  <Badge
                    variant={warningsTotal > 0 ? "secondary" : "outline"}
                    className={
                      warningsTotal > 0
                        ? "bg-slate-900 text-slate-50"
                        : "border-slate-300 text-slate-700"
                    }
                  >
                    {warningsTotal}
                  </Badge>
                </TableCell>

                <TableCell className="text-right tabular-nums">
                  {warningsBadge(warningsTotal)}
                </TableCell>

                <TableCell>{dataStatusBadge(sn.data_status)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
