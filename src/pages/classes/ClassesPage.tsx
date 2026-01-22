import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

import { useAdvisorScope } from "@/hooks/useAdvisorScope";
import { makeReturnTo } from "@/utils/returnTo";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ClassesPage() {
  const loc = useLocation();
  const returnTo = useMemo(() => makeReturnTo(loc.pathname, loc.search), [loc.pathname, loc.search]);

  const { classes, semesters, classId, semesterId, setClassId, setSemesterId, ready } = useAdvisorScope();

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="text-xl font-semibold text-slate-900">Lớp phụ trách</div>
        <div className="text-sm text-slate-600">
          Chọn lớp để đi đúng luồng (Dashboard / Warnings / Notes). Scope (lớp/học kỳ) sẽ được mang theo.
        </div>
      </div>

      <Separator />

      <Card className="border-slate-200/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Scope hiện tại</CardTitle>
          <CardDescription className="text-slate-600">
            Chọn lớp/học kỳ để các trang khác đồng bộ.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-slate-300 text-slate-700">
            Class: {classId ?? "-"}
          </Badge>
          <Badge variant="outline" className="border-slate-300 text-slate-700">
            Semester: {semesterId ?? "-"}
          </Badge>

          <div className="ml-auto flex items-center gap-2">
            <select
              className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
              value={classId ?? ""}
              onChange={(e) => setClassId(e.target.value)}
            >
              {classes.map((a: any) => (
                <option key={a.assignment_id ?? a?.class?.id} value={a?.class?.id}>
                  {a?.class?.class_code} — {a?.class?.class_name}
                </option>
              ))}
            </select>

            <select
              className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
              value={semesterId ?? ""}
              onChange={(e) => setSemesterId(e.target.value)}
            >
              {semesters.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.semester_code} — {s.name}
                  {s.is_current ? " (hiện tại)" : ""}
                </option>
              ))}
            </select>

            <Button variant="outline" className="border-slate-300" asChild disabled={!ready}>
              <Link to={`/dashboard?class_id=${encodeURIComponent(classId ?? "")}&semester_id=${encodeURIComponent(semesterId ?? "")}&return_to=${encodeURIComponent(returnTo)}`}>
                Mở Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {classes.map((a: any) => {
          const c = a?.class ?? {};
          const isActive = String(c?.id) === String(classId);
          return (
            <Card
              key={a.assignment_id ?? c?.id}
              className={`border-slate-200/70 ${isActive ? "ring-2 ring-slate-900/10" : ""}`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-slate-900">
                  {c?.class_code ?? "-"} — {c?.class_name ?? "-"}
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Ngành: {c?.major_name ?? "-"} • Khóa: {c?.cohort_year ?? "-"} • Trạng thái: {c?.status ?? "-"}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="border-slate-300"
                  onClick={() => setClassId(String(c?.id))}
                >
                  Chọn lớp
                </Button>

                <Button className="bg-slate-900 text-slate-50 hover:bg-slate-800" asChild>
                  <Link
                    to={`/dashboard?class_id=${encodeURIComponent(String(c?.id ?? ""))}&semester_id=${encodeURIComponent(semesterId ?? "")}&return_to=${encodeURIComponent(returnTo)}`}
                  >
                    Dashboard lớp
                  </Link>
                </Button>

                <Button variant="outline" className="border-slate-300" asChild>
                  <Link
                    to={`/warnings?class_id=${encodeURIComponent(String(c?.id ?? ""))}&semester_id=${encodeURIComponent(semesterId ?? "")}&return_to=${encodeURIComponent(returnTo)}`}
                  >
                    Warnings
                  </Link>
                </Button>

                <Button variant="outline" className="border-slate-300" asChild>
                  <Link
                    to={`/notes?class_id=${encodeURIComponent(String(c?.id ?? ""))}&semester_id=${encodeURIComponent(semesterId ?? "")}&return_to=${encodeURIComponent(returnTo)}`}
                  >
                    Notes
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
