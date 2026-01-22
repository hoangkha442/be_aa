import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DEFAULT_CLASS = "__no_class__";

type Props = {
  title?: string;
  description?: string;

  classes: any[];
  semesters: any[];

  classId: string | null;
  semesterId: string | null;

  onChangeClassId: (id: string) => void;
  onChangeSemesterId: (id: string) => void;

  rightSlot?: React.ReactNode;
  bottomSlot?: React.ReactNode;
};

export default function AdvisorScopeBar({
  title = "Bộ lọc dữ liệu",
  description = "Chọn lớp và học kỳ để làm việc theo đúng luồng.",
  classes,
  semesters,
  classId,
  semesterId,
  onChangeClassId,
  onChangeSemesterId,
  rightSlot,
  bottomSlot,
}: Props) {
  return (
    <Card className="border-slate-200/70">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base text-slate-900">{title}</CardTitle>
            <CardDescription className="text-slate-600">{description}</CardDescription>
          </div>
          {rightSlot}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-600">Lớp</div>
            <Select
              value={classId ?? DEFAULT_CLASS}
              onValueChange={(v) => {
                if (v === DEFAULT_CLASS) return;
                onChangeClassId(v);
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

          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-600">Học kỳ</div>
            <Select
              value={semesterId ?? ""}
              onValueChange={(v) => {
                if (!v) return;
                onChangeSemesterId(v);
              }}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Chọn học kỳ" />
              </SelectTrigger>

              <SelectContent>
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
        </div>

        {bottomSlot}
      </CardContent>
    </Card>
  );
}
