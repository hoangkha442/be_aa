// import { useMemo, useState } from "react";
// import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";

// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Separator } from "@/components/ui/separator";

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// import { fmtNumber, safeNumber } from "@/utils/numbers";

// type SemesterLite = {
//   id?: string;
//   semester_code?: string;
//   name?: string;
//   start_date?: string;
//   end_date?: string;
// };

// type GradeItem = {
//   id: string;
//   attempt_no?: number;
//   score_10?: number | null;
//   letter_grade?: string | null;
//   score_4?: number | null;
//   is_pass?: boolean | null;
//   updated_at?: string | null;

//   // optional remark fields (tuỳ backend)
//   note?: string | null;
//   remark?: string | null;
//   comment?: string | null;

//   course?: {
//     course_code?: string;
//     course_name?: string;
//     credits?: number | null;
//   };
// };

// type SnapshotItem = {
//   gpa_semester?: number | null;
//   gpa_cumulative?: number | null;
//   credits_earned_semester?: number | null;
//   credits_failed_semester?: number | null;
//   failed_courses_count_semester?: number | null;
// };

// function fmtDateTime(v?: string | null) {
//   if (!v) return "-";
//   const d = new Date(v);
//   if (Number.isNaN(d.getTime())) return "-";
//   return d.toLocaleString("vi-VN");
// }

// function getAcademicYearLabel(startIso?: string, endIso?: string) {
//   const s = startIso ? new Date(startIso) : null;
//   const e = endIso ? new Date(endIso) : null;

//   if (s && !Number.isNaN(s.getTime())) {
//     const y1 = s.getFullYear();
//     if (e && !Number.isNaN(e.getTime())) {
//       const y2 = e.getFullYear();
//       return `${y1}-${Math.max(y1 + 1, y2)}`;
//     }
//     return `${y1}-${y1 + 1}`;
//   }
//   return "-";
// }

// // Ưu tiên is_pass; fallback theo letter_grade/score
// function detectPass(g: GradeItem) {
//   if (typeof g.is_pass === "boolean") return g.is_pass;

//   const letter = String(g.letter_grade ?? "").toUpperCase();
//   if (letter === "F") return false;

//   const s10 = typeof g.score_10 === "number" ? g.score_10 : null;
//   if (s10 !== null) return s10 >= 5;

//   const s4 = typeof g.score_4 === "number" ? g.score_4 : null;
//   if (s4 !== null) return s4 > 0;

//   return null; // unknown
// }

// export default function SemesterGradesTable({
//   loading,
//   focusSemester,
//   grades,
//   snapshot,
//   showSummary = true,
// }: {
//   loading: boolean;
//   focusSemester?: SemesterLite | null;
//   grades: GradeItem[];
//   snapshot?: SnapshotItem | null;
//   showSummary?: boolean;
// }) {
//   const [openId, setOpenId] = useState<string | null>(null);

//   const academicYear = useMemo(
//     () => getAcademicYearLabel(focusSemester?.start_date, focusSemester?.end_date),
//     [focusSemester?.start_date, focusSemester?.end_date]
//   );

//   const semesterLabel = useMemo(() => {
//     if (!focusSemester) return "-";
//     const code = focusSemester.semester_code ?? "-";
//     const name = focusSemester.name ?? "";
//     return `${code}${name ? ` — ${name}` : ""}`;
//   }, [focusSemester]);

//   const rows = useMemo(() => grades ?? [], [grades]);

//   return (
//     <Card className="border-slate-200/70">
//       <CardHeader className="pb-3">
//         <CardTitle className="text-base">Điểm học kỳ</CardTitle>
//         <CardDescription className="text-slate-600">
//           Bảng điểm theo học kỳ (UI theo dạng bảng như portal, nhưng giữ tone của website).
//         </CardDescription>
//       </CardHeader>

//       <CardContent className="space-y-3">
//         {loading ? (
//           <Skeleton className="h-10 w-full" />
//         ) : rows.length === 0 ? (
//           <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-600">
//             Không có dữ liệu điểm trong học kỳ này.
//           </div>
//         ) : (
//           <div className="overflow-x-auto rounded-lg border border-slate-200">
//             <Table>
//               <TableHeader>
//                 <TableRow className="bg-slate-900 hover:bg-slate-900">
//                   <TableHead className="text-slate-50 w-12">STT</TableHead>
//                   <TableHead className="text-slate-50 min-w-40">Mã môn học</TableHead>
//                   <TableHead className="text-slate-50 min-w-72">Tên môn học</TableHead>
//                   <TableHead className="text-slate-50 text-right w-20">Số TC</TableHead>
//                   <TableHead className="text-slate-50 text-right w-28">Điểm hệ 10</TableHead>
//                   <TableHead className="text-slate-50 text-right w-24">Điểm hệ 4</TableHead>
//                   <TableHead className="text-slate-50 w-24">Điểm chữ</TableHead>
//                   <TableHead className="text-slate-50 w-24">Kết quả</TableHead>
//                   <TableHead className="text-slate-50 min-w-48">Ghi chú</TableHead>
//                   <TableHead className="text-slate-50 w-24 text-right">Chi tiết</TableHead>
//                 </TableRow>
//               </TableHeader>

//               <TableBody>
//                 {/* group rows giống ảnh */}
//                 <TableRow className="bg-rose-50">
//                   <TableCell colSpan={10} className="font-semibold text-slate-900">
//                     Năm học: {academicYear}
//                   </TableCell>
//                 </TableRow>

//                 <TableRow className="bg-sky-100">
//                   <TableCell colSpan={10} className="font-semibold text-slate-900">
//                     Học kỳ: {semesterLabel}
//                   </TableCell>
//                 </TableRow>

//                 {rows.map((g, idx) => {
//                   const pass = detectPass(g);
//                   const open = openId === g.id;

//                   const note =
//                     g.note ?? g.remark ?? g.comment ?? "-";

//                   return (
//                     <>
//                       <TableRow key={g.id} className="hover:bg-slate-50/70">
//                         <TableCell className="text-slate-700">{idx + 1}</TableCell>

//                         <TableCell className="font-medium text-slate-900">
//                           {g.course?.course_code ?? "-"}
//                         </TableCell>

//                         <TableCell className="text-slate-900">
//                           {g.course?.course_name ?? "-"}
//                         </TableCell>

//                         <TableCell className="text-right tabular-nums text-slate-900">
//                           {g.course?.credits ?? "-"}
//                         </TableCell>

//                         <TableCell className="text-right tabular-nums text-slate-900">
//                           {typeof g.score_10 === "number" ? fmtNumber(g.score_10, 1) : "-"}
//                         </TableCell>

//                         <TableCell className="text-right tabular-nums text-slate-900">
//                           {typeof g.score_4 === "number" ? fmtNumber(g.score_4, 2) : "-"}
//                         </TableCell>

//                         <TableCell>
//                           <Badge variant="outline" className="border-slate-300 text-slate-700">
//                             {g.letter_grade ?? "-"}
//                           </Badge>
//                         </TableCell>

//                         <TableCell>
//                           {pass === true ? (
//                             <div className="inline-flex items-center gap-1 text-emerald-700">
//                               <CheckCircle2 className="h-4 w-4" />
//                               <span className="text-sm font-medium">Đậu</span>
//                             </div>
//                           ) : pass === false ? (
//                             <div className="inline-flex items-center gap-1 text-rose-700">
//                               <XCircle className="h-4 w-4" />
//                               <span className="text-sm font-medium">Rớt</span>
//                             </div>
//                           ) : (
//                             <Badge variant="outline" className="border-slate-300 text-slate-700">
//                               -
//                             </Badge>
//                           )}
//                         </TableCell>

//                         <TableCell className="text-slate-700">
//                           <div className="line-clamp-1">{note}</div>
//                         </TableCell>

//                         <TableCell className="text-right">
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             className="border-slate-300"
//                             onClick={() => setOpenId(open ? null : g.id)}
//                           >
//                             {open ? (
//                               <span className="inline-flex items-center gap-1">
//                                 Ẩn <ChevronUp className="h-4 w-4" />
//                               </span>
//                             ) : (
//                               <span className="inline-flex items-center gap-1">
//                                 Xem <ChevronDown className="h-4 w-4" />
//                               </span>
//                             )}
//                           </Button>
//                         </TableCell>
//                       </TableRow>

//                       {open && (
//                         <TableRow key={`${g.id}-detail`} className="bg-slate-50/50">
//                           <TableCell colSpan={10}>
//                             <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
//                               <div className="text-sm text-slate-700">
//                                 <span className="text-slate-500">Lần học:</span>{" "}
//                                 <span className="font-medium text-slate-900">{g.attempt_no ?? 1}</span>
//                               </div>

//                               <div className="text-sm text-slate-700">
//                                 <span className="text-slate-500">Cập nhật:</span>{" "}
//                                 <span className="font-medium text-slate-900">{fmtDateTime(g.updated_at ?? null)}</span>
//                               </div>

//                               <div className="text-sm text-slate-700">
//                                 <span className="text-slate-500">Mã bản ghi:</span>{" "}
//                                 <span className="font-medium text-slate-900">#{g.id}</span>
//                               </div>
//                             </div>

//                             <Separator className="my-3" />

//                             <div className="text-sm text-slate-700">
//                               <span className="text-slate-500">Ghi chú:</span>{" "}
//                               <span className="text-slate-900">{note}</span>
//                             </div>
//                           </TableCell>
//                         </TableRow>
//                       )}
//                     </>
//                   );
//                 })}
//               </TableBody>
//             </Table>
//           </div>
//         )}

//         {/* summary block giống ảnh (nền vàng) */}
//         {showSummary && snapshot && !loading && (
//           <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
//             <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
//               <div className="space-y-1 text-sm text-slate-800">
//                 <div>• Tín chỉ đạt học kỳ: <b>{safeNumber(snapshot.credits_earned_semester, 0)}</b></div>
//                 <div>• Tín chỉ rớt học kỳ: <b>{safeNumber(snapshot.credits_failed_semester, 0)}</b></div>
//                 <div>• GPA học kỳ (hệ 4): <b>{fmtNumber(snapshot.gpa_semester, 2)}</b></div>
//               </div>

//               <div className="space-y-1 text-sm text-slate-800">
//                 <div>• GPA tích lũy (hệ 4): <b>{fmtNumber(snapshot.gpa_cumulative, 2)}</b></div>
//                 <div>• Số môn rớt học kỳ: <b>{safeNumber(snapshot.failed_courses_count_semester, 0)}</b></div>
//               </div>
//             </div>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }


import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, ChevronDown } from "lucide-react";
import { fmtNumber, safeNumber } from "@/utils/numbers";

export type SemesterLike = {
  semester_code?: string | null;
  name?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_current?: boolean | null;
} | null;

export type SnapshotLike = {
  credits_earned_semester?: number | null;
  credits_failed_semester?: number | null;
  failed_courses_count_semester?: number | null;
  gpa_semester?: number | null;
  gpa_cumulative?: number | null;
  data_status?: string | null;
} | null;

/**
 * ✅ Type “mềm”: chấp nhận null/optional giống data thực tế từ API
 * => tránh lỗi "Type GradeItem[] is not assignable to ..."
 */
export type GradeLike = {
  id: string;
  attempt_no?: number | null;
  score_10?: number | null;
  score_4?: number | null;
  letter_grade?: string | null;
  is_pass?: boolean | null;
  note?: string | null;
  updated_at?: string | null;
  course?: {
    course_code?: string | null;
    course_name?: string | null;
    credits?: number | null;
    course_type?: string | null;
  } | null;
};

type Props = {
  loading: boolean;
  semester: SemesterLike;
  grades: GradeLike[];
  snapshot?: SnapshotLike;
  showSummary?: boolean;
  title?: string;
  description?: string;
};


function fmtDateTime(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("vi-VN");
}

function academicYearFromSemester(semester: SemesterLike) {
  if (!semester) return "-";
  const ys = semester.start_date ? new Date(semester.start_date).getFullYear() : NaN;
  const ye = semester.end_date ? new Date(semester.end_date).getFullYear() : NaN;

  if (Number.isFinite(ys) && Number.isFinite(ye) && ye !== ys) return `${ys}-${ye}`;
  if (Number.isFinite(ys)) return `${ys}-${ys + 1}`;
  return "-";
}

function courseTypeLabel(t?: string | null) {
  const v = String(t ?? "").toLowerCase();
  if (!v) return null;
  if (v === "required") return "Bắt buộc";
  if (v === "elective") return "Tự chọn";
  if (v === "outside" || v === "external") return "Ngoài CT";
  return t ?? null;
}

export default function SemesterGradesTable({
  loading,
  semester,
  grades,
  snapshot = null,
  showSummary = true,
  title = "Điểm học kỳ",
  description = "Bảng điểm theo học kỳ đang xem.",
}: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  const yearLabel = useMemo(() => academicYearFromSemester(semester), [semester]);
  const semesterLabel = useMemo(() => {
    if (!semester) return "-";
    const code = semester.semester_code ?? "-";
    const name = semester.name ?? "";
    return name ? `${code} — ${name}` : code;
  }, [semester]);

  const totalCredits = useMemo(() => {
    const earned = safeNumber(snapshot?.credits_earned_semester, 0);
    const failed = safeNumber(snapshot?.credits_failed_semester, 0);
    return earned + failed;
  }, [snapshot]);

  return (
    <Card className="border-slate-200/70">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="text-slate-600">{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Header giống ảnh mẫu: Năm học + Học kỳ */}
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <div className="bg-rose-50 px-3 py-2 text-sm font-semibold text-slate-900">
            Năm học: {loading ? <span className="opacity-60">...</span> : yearLabel}
          </div>
          <div className="bg-sky-50 px-3 py-2 text-sm font-semibold text-slate-900 flex items-center justify-between gap-2">
            <div className="min-w-0 truncate">
              Học kỳ: {loading ? <span className="opacity-60">...</span> : semesterLabel}
            </div>
            {semester?.is_current ? (
              <Badge className="bg-slate-900 text-slate-50">Hiện tại</Badge>
            ) : null}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-900 hover:bg-slate-900">
                  <TableHead className="text-slate-50 w-12">STT</TableHead>
                  <TableHead className="text-slate-50 min-w-36">Mã môn học</TableHead>
                  <TableHead className="text-slate-50 min-w-64">Tên môn học</TableHead>
                  <TableHead className="text-slate-50 w-16 text-right">Số TC</TableHead>
                  <TableHead className="text-slate-50 w-28 text-right">Điểm hệ 10</TableHead>
                  <TableHead className="text-slate-50 w-28 text-right">Điểm hệ 4</TableHead>
                  <TableHead className="text-slate-50 w-20 text-center">Điểm chữ</TableHead>
                  <TableHead className="text-slate-50 w-24 text-center">Kết quả</TableHead>
                  <TableHead className="text-slate-50 min-w-44">Ghi chú</TableHead>
                  <TableHead className="text-slate-50 w-20 text-center">Chi tiết</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10}>
                      <div className="space-y-2 py-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : grades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-sm text-slate-600 py-6 text-center">
                      Không có dữ liệu điểm.
                    </TableCell>
                  </TableRow>
                ) : (
                  grades.flatMap((g, idx) => {
                    const isOpen = openId === g.id;
                    const code = g.course?.course_code ?? "-";
                    const name = g.course?.course_name ?? "-";
                    const credits = g.course?.credits ?? null;
                    const ctLabel = courseTypeLabel(g.course?.course_type);

                    const pass = g.is_pass === true;
                    const fail = g.is_pass === false;

                    const rowTone =
                      fail ? "bg-rose-50/30" : pass ? "bg-white" : "bg-slate-50/20";

                    return [
                      (
                        <TableRow key={g.id} className={cn("hover:bg-slate-50", rowTone)}>
                          <TableCell className="text-slate-700">{idx + 1}</TableCell>

                          <TableCell className="font-medium text-slate-900">{code}</TableCell>

                          <TableCell className="text-slate-900">
                            <div className="font-medium">{name}</div>
                            <div className="text-xs text-slate-500">
                              Lần học: {g.attempt_no ?? 1}
                              {ctLabel ? ` • ${ctLabel}` : ""}
                            </div>
                          </TableCell>

                          <TableCell className="text-right tabular-nums text-slate-900">
                            {credits ?? "-"}
                          </TableCell>

                          <TableCell className="text-right tabular-nums text-slate-900">
                            {g.score_10 ?? "-"}
                          </TableCell>

                          <TableCell className="text-right tabular-nums text-slate-900">
                            {g.score_4 ?? "-"}
                          </TableCell>

                          <TableCell className="text-center font-medium text-slate-900">
                            {g.letter_grade ?? "-"}
                          </TableCell>

                          <TableCell className="text-center">
                            {pass ? (
                              <CheckCircle2 className="h-5 w-5 inline-block text-emerald-600" />
                            ) : fail ? (
                              <XCircle className="h-5 w-5 inline-block text-rose-600" />
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </TableCell>

                          <TableCell className="text-slate-700">
                            {g.note ? (
                              <span className="text-sm">{g.note}</span>
                            ) : ctLabel ? (
                              <Badge variant="outline" className="border-slate-300 text-slate-700">
                                {ctLabel}
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>

                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setOpenId(isOpen ? null : g.id)}
                            >
                              <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen ? "rotate-180" : "")} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ),

                      isOpen ? (
                        <TableRow key={`${g.id}-detail`} className="bg-slate-50/40">
                          <TableCell colSpan={10}>
                            <div className="p-3 text-sm text-slate-700 space-y-1">
                              <div>
                                <span className="text-slate-500">Cập nhật:</span>{" "}
                                <span className="font-medium text-slate-900">
                                  {fmtDateTime(g.updated_at ?? null)}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="border-slate-300 text-slate-700">
                                  Điểm 10: {g.score_10 ?? "-"}
                                </Badge>
                                <Badge variant="outline" className="border-slate-300 text-slate-700">
                                  Điểm 4: {g.score_4 ?? "-"}
                                </Badge>
                                <Badge variant="outline" className="border-slate-300 text-slate-700">
                                  Chữ: {g.letter_grade ?? "-"}
                                </Badge>
                                <Badge variant="outline" className="border-slate-300 text-slate-700">
                                  TC: {credits ?? "-"}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : null,
                    ].filter(Boolean) as any[];
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary block giống ảnh mẫu */}
          {showSummary ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-slate-200 bg-amber-50/50 p-3">
              <div className="space-y-1 text-sm text-slate-900">
                <div>- Số tín chỉ đạt học kỳ: <span className="font-semibold">{snapshot?.credits_earned_semester ?? "-"}</span></div>
                <div>- Số tín chỉ rớt học kỳ: <span className="font-semibold">{snapshot?.credits_failed_semester ?? "-"}</span></div>
                <div>- Tổng số tín chỉ học kỳ: <span className="font-semibold">{Number.isFinite(totalCredits) ? totalCredits : "-"}</span></div>
                <div>- Số môn rớt học kỳ: <span className="font-semibold">{snapshot?.failed_courses_count_semester ?? "-"}</span></div>
              </div>

              <div className="space-y-1 text-sm text-slate-900">
                <div>- GPA học kỳ: <span className="font-semibold">{fmtNumber(snapshot?.gpa_semester, 2)}</span></div>
                <div>- GPA tích lũy: <span className="font-semibold">{fmtNumber(snapshot?.gpa_cumulative, 2)}</span></div>
                {snapshot?.data_status && snapshot.data_status !== "ok" ? (
                  <div>- Data status: <span className="font-semibold">{String(snapshot.data_status)}</span></div>
                ) : null}
                <div className="text-xs text-slate-600 mt-1">
                  * GPA hiển thị theo số liệu snapshot hệ thống trả về.
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
