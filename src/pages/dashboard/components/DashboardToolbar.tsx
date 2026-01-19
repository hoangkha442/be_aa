import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCcw, Info } from "lucide-react";
import { StatusBadge, type LoadStatus } from "@/pages/dashboard/components/StatusBadge";

const DEFAULT_CLASS = "__no_class__";
const DEFAULT_SEMESTER = "__default_semester__";

type Props = {
  classes: any[];
  semesters: any[];
  selectedClassId: string | null;
  selectedSemesterId: string | null;
  status?: LoadStatus;
  onChangeClass: (classId: string) => void;
  onChangeSemester: (semesterId: string | null) => void;
  onReload: () => void;
};

export default function DashboardToolbar({
  classes,
  semesters,
  selectedClassId,
  selectedSemesterId,
  status,
  onChangeClass,
  onChangeSemester,
  onReload,
}: Props) {
  const canReload = Boolean(selectedClassId) && status !== "loading";

  return (
    <Card className="border-slate-200/70">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-slate-900">
          <Info className="h-4 w-4 text-slate-700" />
          Bộ lọc dữ liệu
        </CardTitle>
        <CardDescription className="text-slate-600">
          Chọn lớp (bắt buộc) và học kỳ (tuỳ chọn).
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* Class */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-600">Lớp</div>
            <Select
              value={selectedClassId ?? DEFAULT_CLASS}
              onValueChange={(v) => {
                if (v === DEFAULT_CLASS) return;
                onChangeClass(v);
              }}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Chọn lớp" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={DEFAULT_CLASS} disabled>
                  Chọn lớp
                </SelectItem>

                {classes.map((a: any) => {
                  const id = a?.class?.id;
                  if (!id) return null;
                  return (
                    <SelectItem key={a.assignment_id ?? id} value={id}>
                      {a?.class?.class_code} — {a?.class?.class_name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Semester */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-600">Học kỳ</div>
            <Select
              value={selectedSemesterId ?? DEFAULT_SEMESTER}
              onValueChange={(v) => onChangeSemester(v === DEFAULT_SEMESTER ? null : v)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="(mặc định)" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={DEFAULT_SEMESTER}>(mặc định)</SelectItem>
                {semesters.map((s: any) => {
                  const id = s?.id;
                  if (!id) return null;
                  return (
                    <SelectItem key={id} value={id}>
                      {s?.semester_code} — {s?.name}
                      {s?.is_current ? " (hiện tại)" : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Status + Reload */}
          <div className="flex items-end">
            <div className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs text-slate-600">Trạng thái</div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <StatusBadge status={status || "idle"} hasSelection={Boolean(selectedClassId)} />
                <Button
                  onClick={onReload}
                  disabled={!canReload}
                  className="gap-2 bg-slate-900 text-slate-50 hover:bg-slate-800"
                  size="sm"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Reload
                </Button>
              </div>
            </div>
          </div>
        </div>

        {!selectedClassId && (
          <div className="text-xs text-slate-500">
            * Chưa chọn lớp: Dashboard chưa thể tải dữ liệu.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
