// import { useCallback, useEffect, useMemo, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { useAppDispatch, useAppSelector } from "@/store/hooks";
// import { fetchSemestersThunk, setSelectedSemester } from "@/store/slices/advisorSlice";

// import { Separator } from "@/components/ui/separator";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";

// import { advisorService } from "@/services/advisor.service";

// import StudentInfoCard from "./components/StudentInfoCard";
// import StudentWarningsTable from "@/pages/students/components/StudentWarningsTable";
// import StudentNotesPanel from "@/pages/students/components/StudentNotesPanel";
// import StudentGradesTable from "@/pages/students/components/StudentGradesTable";

// function safeStr(v: any) {
//   return v == null ? "" : String(v);
// }

// export default function StudentDetailPage() {
//   const { id } = useParams();
//   const studentId = safeStr(id);

//   const nav = useNavigate();
//   const dispatch = useAppDispatch();
//   const advisor = useAppSelector((s: any) => s.advisor);
//   const semesters: any[] = advisor?.semesters ?? [];
//   const selectedSemesterId: string | null = advisor?.selectedSemesterId ?? null;

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [data, setData] = useState<any>(null); // response from getStudentDetail
//   const [notesReloadKey, setNotesReloadKey] = useState(0);

//   useEffect(() => {
//     dispatch(fetchSemestersThunk());
//   }, [dispatch]);

//   // auto pick current semester if none
//   useEffect(() => {
//     if (selectedSemesterId) return;
//     const cur = semesters.find((s: any) => s?.is_current)?.id ?? semesters?.[0]?.id;
//     if (cur) dispatch(setSelectedSemester(cur));
//   }, [semesters, selectedSemesterId, dispatch]);

//   const reload = useCallback(async () => {
//     if (!studentId) return;
//     setLoading(true);
//     setError(null);

//     try {
//       const res = await advisorService.getStudentDetail(studentId, {
//         semester_id: selectedSemesterId ?? undefined,
//         include_grades: true,
//       });
//       setData(res);
//     } catch (e: any) {
//       setError(String(e?.message ?? "Load student detail failed"));
//     } finally {
//       setLoading(false);
//     }
//   }, [studentId, selectedSemesterId]);

//   useEffect(() => {
//     if (!studentId) return;
//     reload();
//   }, [studentId, selectedSemesterId, reload, notesReloadKey]);

//   const student = data?.student ?? null;
//   const semester = data?.semester ?? null;
//   const snapshot = data?.snapshot ?? null;
//   const warnings = data?.warnings ?? [];
//   const notes = data?.notes ?? [];
//   const grades = data?.grades ?? [];

//   const headerTitle = useMemo(() => {
//     if (!student) return "Chi tiết sinh viên";
//     return `${student.full_name} (${student.student_code})`;
//   }, [student]);

//   return (
//     <div className="space-y-5">
//       {/* Header */}
//       <div className="space-y-2">
//         <div className="flex items-start justify-between gap-3">
//           <div>
//             <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
//               {headerTitle}
//             </h1>
//             <p className="text-sm text-slate-600">
//               Xem snapshot, cảnh báo, điểm và ghi chú tư vấn.
//             </p>
//           </div>

//           <div className="flex items-center gap-2">
//             <Badge variant="outline" className="border-slate-300 text-slate-700">
//               HK: {semester?.semester_code ?? "-"}
//             </Badge>
//             <Button variant="outline" className="border-slate-300" onClick={() => nav(-1)}>
//               Quay lại
//             </Button>
//           </div>
//         </div>
//         <Separator />
//       </div>

//       {error && (
//         <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
//           {error}
//         </div>
//       )}

//       {loading && !data ? (
//         <div className="space-y-2">
//           <Skeleton className="h-24 w-full" />
//           <Skeleton className="h-64 w-full" />
//         </div>
//       ) : !data ? (
//         <div className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-600">
//           Không có dữ liệu.
//         </div>
//       ) : (
//         <>
//           <StudentInfoCard
//             student={student}
//             semester={semester}
//             snapshot={snapshot}
//             semesters={semesters}
//             selectedSemesterId={selectedSemesterId}
//             onChangeSemester={(sid) => dispatch(setSelectedSemester(sid))}
//             loading={loading}
//           />

//           <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
//             <StudentWarningsTable
//               warnings={warnings}
//               loading={loading}
//               onAcknowledge={async (warningId) => {
//                 await advisorService.updateWarningStatus(warningId, "Acknowledged");
//                 setNotesReloadKey((x) => x + 1);
//               }}
//               onResolve={async (warningId) => {
//                 await advisorService.updateWarningStatus(warningId, "Resolved");
//                 setNotesReloadKey((x) => x + 1);
//               }}
//             />

//             <StudentNotesPanel
//               studentId={student?.id}
//               notes={notes}
//               loading={loading}
//               onCreated={() => setNotesReloadKey((x) => x + 1)}
//             />
//           </div>
//           <StudentGradesTable grades={grades} loading={loading} />
//         </>
//       )}
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { advisorService } from "@/services/advisor.service";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function fmt(n: any, digits = 2) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "-";
  return x.toFixed(digits);
}

function passBadge(isPass: boolean | null | undefined) {
  if (isPass === true)
    return <Badge className="bg-emerald-50 text-emerald-900 border border-emerald-200">Đậu</Badge>;
  if (isPass === false)
    return <Badge className="bg-rose-50 text-rose-900 border border-rose-200">Rớt</Badge>;
  return <Badge variant="outline" className="border-slate-300 text-slate-700">-</Badge>;
}

export default function StudentDetailPage() {
  const { id: studentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState<any>(null);
  const [baseDetail, setBaseDetail] = useState<any>(null);

  // cache grades theo semester
  const [gradesBySemester, setGradesBySemester] = useState<Record<string, any[]>>({});
  const [loadingSemester, setLoadingSemester] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;

    (async () => {
      setLoading(true);
      try {
        // 1) timeline: có snapshots (mỗi snapshot có semester info)
        const t = await advisorService.getStudentTimeline(studentId);

        // 2) base detail: lấy info SV + grades của focus semester (backend tự resolve)
        const d = await advisorService.getStudentDetail(studentId, { include_grades: true });

        setTimeline(t);
        setBaseDetail(d);

        // cache luôn grades của focus semester để khỏi fetch lại
        if (d?.semester?.id && Array.isArray(d?.grades)) {
          setGradesBySemester((prev) => ({ ...prev, [d.semester.id]: d.grades }));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [studentId]);

  const snapshots = useMemo(() => {
    const list = timeline?.snapshots ?? [];
    // timeline trả snapshots dạng: { semester: {...}, gpa_semester, ... }
    return Array.isArray(list) ? list : [];
  }, [timeline]);

  async function ensureGrades(semesterId: string) {
    if (!studentId) return;
    if (gradesBySemester[semesterId]) return;

    setLoadingSemester(semesterId);
    try {
      const d = await advisorService.getStudentDetail(studentId, {
        semester_id: semesterId,
        include_grades: true,
      });
      setGradesBySemester((prev) => ({ ...prev, [semesterId]: d?.grades ?? [] }));
    } finally {
      setLoadingSemester(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  const st = baseDetail?.student ?? null;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
          Chi tiết sinh viên
        </h1>
        <p className="text-sm text-slate-600">
          Hiển thị các môn đã học theo từng học kỳ (load theo nhu cầu).
        </p>
        <Separator />
      </div>

      {/* Thông tin SV */}
      <Card className="border-slate-200/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-slate-900">Thông tin</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          {!st ? (
            <div className="text-slate-600">Không có dữ liệu sinh viên</div>
          ) : (
            <>
              <div className="font-medium text-slate-900">
                {st.full_name} • {st.student_code}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>Email: {st.email ?? "-"}</div>
                <div>SĐT: {st.phone ?? "-"}</div>
                <div>Học vụ: {st.academic_status ?? "-"}</div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Môn theo học kỳ */}
      <Card className="border-slate-200/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-slate-900">Môn đã học theo học kỳ</CardTitle>
        </CardHeader>

        <CardContent>
          {snapshots.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-600">
              Chưa có snapshot học kỳ để hiển thị.
            </div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {snapshots.map((s: any) => {
                const sem = s?.semester ?? {};
                const semId = String(sem.id ?? "");
                const semTitle = `${sem.semester_code ?? ""} — ${sem.name ?? ""}`.trim();
                const grades = gradesBySemester[semId];

                return (
                  <AccordionItem key={semId} value={semId}>
                    <AccordionTrigger
                      onClick={() => {
                        if (semId) ensureGrades(semId);
                      }}
                      className="hover:no-underline"
                    >
                      <div className="flex w-full items-center justify-between pr-2">
                        <div className="text-left">
                          <div className="font-medium text-slate-900">{semTitle || "Học kỳ"}</div>
                          <div className="text-xs text-slate-600">
                            GPA HK: {fmt(s.gpa_semester)} • GPA TL: {fmt(s.gpa_cumulative)} • Môn rớt:{" "}
                            {s.failed_courses_count_semester ?? "-"}
                          </div>
                        </div>

                        <Badge variant="outline" className="border-slate-300 text-slate-700">
                          {Array.isArray(grades) ? `${grades.length} môn` : "Mở để tải"}
                        </Badge>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent>
                      {!semId ? (
                        <div className="text-sm text-slate-600">Thiếu semester_id</div>
                      ) : loadingSemester === semId && !grades ? (
                        <div className="text-sm text-slate-600">Đang tải danh sách môn...</div>
                      ) : !Array.isArray(grades) || grades.length === 0 ? (
                        <div className="text-sm text-slate-600">Không có môn/điểm cho học kỳ này.</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="min-w-32">Mã môn</TableHead>
                                <TableHead className="min-w-64">Tên môn</TableHead>
                                <TableHead className="text-right">TC</TableHead>
                                <TableHead className="text-right">Điểm 10</TableHead>
                                <TableHead className="text-right">Điểm 4</TableHead>
                                <TableHead>Chữ</TableHead>
                                <TableHead>Đậu/Rớt</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {grades.map((g: any) => (
                                <TableRow key={g.id}>
                                  <TableCell className="font-medium text-slate-900">
                                    {g.course?.course_code ?? "-"}
                                  </TableCell>
                                  <TableCell className="text-slate-700">
                                    {g.course?.course_name ?? "-"}
                                  </TableCell>
                                  <TableCell className="text-right tabular-nums">
                                    {g.course?.credits ?? "-"}
                                  </TableCell>
                                  <TableCell className="text-right tabular-nums">
                                    {g.score_10 ?? "-"}
                                  </TableCell>
                                  <TableCell className="text-right tabular-nums">
                                    {g.score_4 ?? "-"}
                                  </TableCell>
                                  <TableCell className="text-slate-700">{g.letter_grade ?? "-"}</TableCell>
                                  <TableCell>{passBadge(g.is_pass)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
