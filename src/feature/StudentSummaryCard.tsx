import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fmtNumber, safeNumber } from "@/utils/numbers";

export default function StudentSummaryCard({
  student,
  snapshot,
  warningsCount,
  semesterLabel,
  rightSlot,
}: {
  student: any;
  snapshot: any;
  warningsCount: number;
  semesterLabel?: string;
  rightSlot?: React.ReactNode;
}) {
  const warned = safeNumber(warningsCount, 0);
  return (
    <Card className="border-slate-200/70">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Thông tin sinh viên</CardTitle>
            <CardDescription className="text-slate-600">
              {semesterLabel ? `Kỳ: ${semesterLabel}` : "Snapshot & cảnh báo theo học kỳ."}
            </CardDescription>
          </div>
          {rightSlot}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <div className="text-lg font-semibold text-slate-900">{student?.full_name ?? "-"}</div>
          <div className="text-sm text-slate-600">
            MSSV: <span className="font-medium text-slate-900">{student?.student_code ?? "-"}</span>
            {" • "}
            Lớp: <span className="font-medium text-slate-900">{student?.class?.class_code ?? "-"}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-amber-50 text-amber-900 border border-amber-200">Warning: {warned}</Badge>
          <Badge className="bg-indigo-50 text-indigo-900 border border-indigo-200">
            GPA HK: {snapshot ? fmtNumber(snapshot.gpa_semester, 2) : "-"}
          </Badge>
          <Badge variant="outline" className="border-slate-300 text-slate-700">
            GPA TL: {snapshot ? fmtNumber(snapshot.gpa_cumulative, 2) : "-"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
