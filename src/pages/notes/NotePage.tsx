// import { useCallback, useEffect, useMemo, useState } from "react";
// import { useLocation, useNavigate, Link } from "react-router-dom";

// import { useAppDispatch, useAppSelector } from "@/store/hooks";
// import {
//   fetchClassesThunk,
//   fetchSemestersThunk,
//   setSelectedClass,
//   setSelectedSemester,
// } from "@/store/slices/advisorSlice";

// import { advisorService } from "@/services/advisor.service";

// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";

// function safeNumber(n: any, fallback = 0) {
//   const num = typeof n === "number" ? n : Number(n);
//   return Number.isFinite(num) ? num : fallback;
// }

// function getReturnTo(search: string) {
//   const p = new URLSearchParams(search);
//   return p.get("return_to");
// }

// function pickDefaultClass(classes: any[]) {
//   return classes.find((a: any) => a?.class?.id)?.class?.id ?? null;
// }

// function pickDefaultSemester(semesters: any[]) {
//   return semesters.find((s: any) => s?.is_current)?.id ?? semesters?.[0]?.id ?? null;
// }

// function warningsBadge(n: number) {
//   if (n <= 0) return <Badge variant="outline" className="border-slate-300 text-slate-700">0</Badge>;
//   if (n === 1) return <Badge className="bg-amber-50 text-amber-900 border border-amber-200">1</Badge>;
//   return <Badge className="bg-rose-50 text-rose-900 border border-rose-200">{n}</Badge>;
// }

// export default function NotesFlowPage() {
//   const dispatch = useAppDispatch();
//   const location = useLocation();
//   const navigate = useNavigate();

//   const classes = useAppSelector((s: any) => s.advisor?.classes ?? []);
//   const semesters = useAppSelector((s: any) => s.advisor?.semesters ?? []);
//   const selectedClassId = useAppSelector((s: any) => s.advisor?.selectedClassId) as string | null;
//   const selectedSemesterId = useAppSelector((s: any) => s.advisor?.selectedSemesterId) as string | null;

//   const urlParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
//   const returnTo = getReturnTo(location.search);

//   // allow deep-link: /notes?class_id=..&semester_id=..&student_id=..
//   const classIdFromUrl = urlParams.get("class_id");
//   const semesterIdFromUrl = urlParams.get("semester_id");
//   const studentIdFromUrl = urlParams.get("student_id");

//   // local UI: student search
//   const [q, setQ] = useState("");
//   const [onlyWarned, setOnlyWarned] = useState(false);

//   // local student list from dashboard search
//   const [studentLoading, setStudentLoading] = useState(false);
//   const [studentError, setStudentError] = useState<string | null>(null);
//   const [studentRows, setStudentRows] = useState<any[]>([]);
//   const [studentPage, setStudentPage] = useState(1);
//   const [studentTotalPages, setStudentTotalPages] = useState(1);

//   // selected student
//   const [studentId, setStudentId] = useState<string | null>(studentIdFromUrl);
//   const [detailLoading, setDetailLoading] = useState(false);
//   const [detailError, setDetailError] = useState<string | null>(null);
//   const [studentDetail, setStudentDetail] = useState<any>(null);

//   // notes
//   const [notesLoading, setNotesLoading] = useState(false);
//   const [notesError, setNotesError] = useState<string | null>(null);
//   const [notes, setNotes] = useState<any[]>([]);

//   // create note form
//   const [saving, setSaving] = useState(false);
//   const [noteContent, setNoteContent] = useState("");
//   const [counselingDate, setCounselingDate] = useState(""); // yyyy-mm-dd
//   const [handlingStatus, setHandlingStatus] =
//     useState<"not_contacted" | "contacted" | "monitoring" | "stable">("contacted");
//   const [warningId, setWarningId] = useState<string>("");

//   // 1) load meta
//   useEffect(() => {
//     dispatch(fetchClassesThunk(undefined));
//     dispatch(fetchSemestersThunk());
//   }, [dispatch]);

//   // 2) apply URL -> redux selections (nếu có)
//   useEffect(() => {
//     if (classIdFromUrl) dispatch(setSelectedClass(classIdFromUrl));
//     if (semesterIdFromUrl) dispatch(setSelectedSemester(semesterIdFromUrl));
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [classIdFromUrl, semesterIdFromUrl]);

//   // 3) auto select defaults
//   useEffect(() => {
//     if (!selectedClassId && classes.length) {
//       const d = pickDefaultClass(classes);
//       if (d) dispatch(setSelectedClass(d));
//     }
//   }, [classes, selectedClassId, dispatch]);

//   useEffect(() => {
//     if (!selectedSemesterId && semesters.length) {
//       const d = pickDefaultSemester(semesters);
//       if (d) dispatch(setSelectedSemester(d));
//     }
//   }, [semesters, selectedSemesterId, dispatch]);

//   const canSearchStudents = Boolean(selectedClassId && selectedSemesterId);

//   // 4) search students via dashboard API (local, không đụng redux.dashboard)
//   const loadStudents = useCallback(
//     async (opts?: { page?: number; q?: string }) => {
//       if (!selectedClassId || !selectedSemesterId) return;

//       const page = opts?.page ?? studentPage;
//       const query = (opts?.q ?? q).trim();

//       setStudentLoading(true);
//       setStudentError(null);

//       try {
//         const res = await advisorService.getDashboard({
//           class_id: selectedClassId,
//           semester_id: selectedSemesterId,
//           page,
//           limit: 20,
//           q: query || undefined,
//           warned_only: onlyWarned, 
//         });

//         const paging = res?.students ?? res; 
//         const rows = paging?.data ?? [];
//         setStudentRows(rows);
//         setStudentPage(paging?.page ?? page);
//         setStudentTotalPages(paging?.totalPages ?? 1);
//       } catch (e: any) {
//         setStudentError(e?.response?.data?.message ?? e?.message ?? "Load students failed");
//         setStudentRows([]);
//         setStudentTotalPages(1);
//       } finally {
//         setStudentLoading(false);
//       }
//     },
//     [selectedClassId, selectedSemesterId, studentPage, q, onlyWarned]
//   );

//   // refetch student list when class/semester changes
//   useEffect(() => {
//     if (!canSearchStudents) return;
//     setStudentPage(1);
//     loadStudents({ page: 1 });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedClassId, selectedSemesterId, onlyWarned]);

//   // debounce q
//   useEffect(() => {
//     if (!canSearchStudents) return;
//     const t = setTimeout(() => {
//       setStudentPage(1);
//       loadStudents({ page: 1 });
//     }, 350);
//     return () => clearTimeout(t);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [q]);

//   // 5) load selected student detail + notes
//   const loadDetail = useCallback(async () => {
//     if (!studentId || !selectedSemesterId) return;

//     setDetailLoading(true);
//     setDetailError(null);
//     try {
//       const res = await advisorService.getStudentDetail(studentId, {
//         semester_id: selectedSemesterId,
//         include_grades: false,
//       });
//       setStudentDetail(res);
//     } catch (e: any) {
//       setDetailError(e?.response?.data?.message ?? e?.message ?? "Load student detail failed");
//       setStudentDetail(null);
//     } finally {
//       setDetailLoading(false);
//     }
//   }, [studentId, selectedSemesterId]);

//   const loadNotes = useCallback(async () => {
//     if (!studentId) return;
//     setNotesLoading(true);
//     setNotesError(null);
//     try {
//       const res = await advisorService.listNotes(studentId);
//       const rows = res?.data ?? res?.items ?? res ?? [];
//       setNotes(rows);
//     } catch (e: any) {
//       setNotesError(e?.response?.data?.message ?? e?.message ?? "Load notes failed");
//       setNotes([]);
//     } finally {
//       setNotesLoading(false);
//     }
//   }, [studentId]);

//   useEffect(() => {
//     if (!studentId) return;
//     loadDetail();
//     loadNotes();

//     // sync URL để user copy link “đúng flow”
//     const next = new URLSearchParams(location.search);
//     if (selectedClassId) next.set("class_id", selectedClassId);
//     if (selectedSemesterId) next.set("semester_id", selectedSemesterId);
//     next.set("student_id", studentId);
//     if (returnTo) next.set("return_to", returnTo);
//     navigate({ pathname: "/notes", search: next.toString() }, { replace: true });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [studentId]);

//   const student = studentDetail?.student ?? null;
//   const snapshot = studentDetail?.snapshot ?? null;
//   const warnings = (studentDetail?.warnings ?? []) as any[];

//   const importantSummary = useMemo(() => {
//     const warned = safeNumber(warnings?.length, 0);
//     const gpa = snapshot?.gpa_semester;
//     return { warned, gpa };
//   }, [warnings, snapshot]);

//   const onBack = () => {
//     if (returnTo) {
//       navigate(decodeURIComponent(returnTo));
//       return;
//     }
//     navigate(-1);
//   };

//   const onCreateNote = async () => {
//     if (!studentId || !noteContent.trim()) return;
//     setSaving(true);
//     try {
//       await advisorService.createNote({
//         student_id: studentId,
//         warning_id: warningId ? warningId : undefined,
//         content: noteContent.trim(),
//         counseling_date: counselingDate ? counselingDate : undefined,
//         handling_status: handlingStatus,
//       });

//       setNoteContent("");
//       setCounselingDate("");
//       setWarningId("");
//       setHandlingStatus("contacted");

//       await loadNotes();
//       await loadDetail();
//     } catch (e: any) {
//       setNotesError(e?.response?.data?.message ?? e?.message ?? "Create note failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="space-y-4">
//       {/* Header + Back */}
//       <div className="flex items-start justify-between gap-3">
//         <div>
//           <div className="text-xl font-semibold text-slate-900">Ghi chú tư vấn</div>
//           <div className="text-sm text-slate-600">
//             Chọn lớp/học kỳ → chọn sinh viên → xem & tạo ghi chú (có thể gắn cảnh báo).
//           </div>
//         </div>
//         <div className="flex items-center gap-2">
//           <Button variant="outline" className="border-slate-300" onClick={onBack}>
//             Quay lại
//           </Button>
//           <Button variant="outline" className="border-slate-300" asChild>
//             <Link to="/dashboard">Dashboard</Link>
//           </Button>
//         </div>
//       </div>

//       <Separator />

//       {/* Context bar */}
//       <Card className="border-slate-200/70">
//         <CardHeader className="pb-3">
//           <CardTitle className="text-base">Bộ lọc dữ liệu</CardTitle>
//           <CardDescription className="text-slate-600">
//             Luôn chọn lớp/học kỳ để notes và cảnh báo đồng bộ.
//           </CardDescription>
//         </CardHeader>

//         <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-4">
//           <div>
//             <div className="text-xs font-medium text-slate-600 mb-1">Lớp</div>
//             <select
//               className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
//               value={selectedClassId ?? ""}
//               onChange={(e) => {
//                 setStudentId(null);
//                 dispatch(setSelectedClass(e.target.value));
//               }}
//             >
//               {classes.map((a: any) => (
//                 <option key={a.assignment_id ?? a?.class?.id} value={a?.class?.id}>
//                   {a?.class?.class_code} — {a?.class?.class_name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <div className="text-xs font-medium text-slate-600 mb-1">Học kỳ</div>
//             <select
//               className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
//               value={selectedSemesterId ?? ""}
//               onChange={(e) => {
//                 setStudentId(null);
//                 dispatch(setSelectedSemester(e.target.value));
//               }}
//             >
//               {semesters.map((s: any) => (
//                 <option key={s.id} value={s.id}>
//                   {s.semester_code} — {s.name}
//                   {s.is_current ? " (hiện tại)" : ""}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <div className="text-xs font-medium text-slate-600 mb-1">Tìm sinh viên</div>
//             <Input
//               value={q}
//               onChange={(e) => setQ(e.target.value)}
//               placeholder="Tên hoặc MSSV..."
//               className="bg-white"
//               disabled={!canSearchStudents}
//             />
//           </div>

//           <div className="flex items-end justify-between gap-2">
//             <label className="flex items-center gap-2 text-sm text-slate-700">
//               <input
//                 type="checkbox"
//                 checked={onlyWarned}
//                 onChange={(e) => setOnlyWarned(e.target.checked)}
//               />
//               Chỉ SV có cảnh báo
//             </label>
//             <Button
//               variant="outline"
//               className="border-slate-300"
//               disabled={!canSearchStudents || studentLoading}
//               onClick={() => loadStudents({ page: 1 })}
//             >
//               Reload
//             </Button>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Main layout */}
//       <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
//         {/* Left: student picker + list */}
//         <Card className="border-slate-200/70 md:col-span-1">
//           <CardHeader className="pb-3">
//             <CardTitle className="text-base">Chọn sinh viên</CardTitle>
//             <CardDescription className="text-slate-600">
//               Danh sách theo lớp/học kỳ (có thể lọc).
//             </CardDescription>
//           </CardHeader>

//           <CardContent className="space-y-2">
//             {studentError && (
//               <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
//                 {studentError}
//               </div>
//             )}

//             {!canSearchStudents ? (
//               <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-600">
//                 Vui lòng chọn lớp và học kỳ trước.
//               </div>
//             ) : studentLoading ? (
//               <div className="space-y-2">
//                 <Skeleton className="h-10 w-full" />
//                 <Skeleton className="h-10 w-full" />
//                 <Skeleton className="h-10 w-full" />
//               </div>
//             ) : studentRows.length === 0 ? (
//               <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-600">
//                 Không có sinh viên phù hợp.
//               </div>
//             ) : (
//               <>
//                 <div className="space-y-2">
//                   {studentRows.map((r: any) => {
//                     const st = r?.student ?? {};
//                     const sn = r?.snapshot ?? {};
//                     const warned = safeNumber(r?.warnings_total, 0);

//                     const active = String(st.id) === String(studentId);
//                     const tone =
//                       warned >= 2 ? "border-rose-200 bg-rose-50/40" :
//                       warned === 1 ? "border-amber-200 bg-amber-50/30" :
//                       "border-slate-200 bg-white";

//                     return (
//                       <button
//                         key={st.id}
//                         type="button"
//                         onClick={() => setStudentId(String(st.id))}
//                         className={[
//                           "w-full text-left rounded-lg border p-3 transition-colors",
//                           tone,
//                           active ? "ring-2 ring-slate-900/20" : "hover:bg-slate-50",
//                         ].join(" ")}
//                       >
//                         <div className="flex items-start justify-between gap-2">
//                           <div className="min-w-0">
//                             <div className="text-sm font-medium text-slate-900 truncate">
//                               {st.full_name ?? "-"}
//                             </div>
//                             <div className="text-xs text-slate-500 truncate">
//                               {st.student_code ?? "-"} • GPA: {sn?.gpa_semester ?? "-"}
//                             </div>
//                           </div>
//                           <div className="shrink-0">{warningsBadge(warned)}</div>
//                         </div>
//                       </button>
//                     );
//                   })}
//                 </div>

//                 <div className="flex items-center justify-between pt-2">
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     className="border-slate-300"
//                     disabled={studentPage <= 1 || studentLoading}
//                     onClick={() => loadStudents({ page: Math.max(1, studentPage - 1) })}
//                   >
//                     Trước
//                   </Button>
//                   <div className="text-xs text-slate-600">
//                     Trang {studentPage}/{Math.max(1, studentTotalPages)}
//                   </div>
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     className="border-slate-300"
//                     disabled={studentPage >= studentTotalPages || studentLoading}
//                     onClick={() => loadStudents({ page: Math.min(studentTotalPages, studentPage + 1) })}
//                   >
//                     Sau
//                   </Button>
//                 </div>
//               </>
//             )}
//           </CardContent>
//         </Card>

//         {/* Right: selected student detail + notes */}
//         <div className="md:col-span-2 space-y-3">
//           {/* Student summary (nhấn mạnh) */}
//           <Card className="border-slate-200/70">
//             <CardHeader className="pb-3">
//               <div className="flex items-start justify-between gap-3">
//                 <div>
//                   <CardTitle className="text-base">Thông tin sinh viên</CardTitle>
//                   <CardDescription className="text-slate-600">
//                     Snapshot và cảnh báo trong học kỳ đang chọn.
//                   </CardDescription>
//                 </div>

//                 {studentId && selectedSemesterId && (
//                   <div className="flex items-center gap-2">
//                     <Button variant="outline" className="border-slate-300" asChild>
//                       <Link
//                         to={`/students/${studentId}?semester_id=${encodeURIComponent(selectedSemesterId)}&return_to=${encodeURIComponent(location.pathname + location.search)}`}
//                       >
//                         Chi tiết
//                       </Link>
//                     </Button>
//                     <Button variant="outline" className="border-slate-300" asChild>
//                       <Link
//                         to={`/students/${studentId}/timeline?semester_id=${encodeURIComponent(selectedSemesterId)}&return_to=${encodeURIComponent(location.pathname + location.search)}`}
//                       >
//                         Timeline
//                       </Link>
//                     </Button>
//                   </div>
//                 )}
//               </div>
//             </CardHeader>

//             <CardContent>
//               {!studentId ? (
//                 <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-600">
//                   Chọn một sinh viên ở cột bên trái để xem chi tiết & ghi chú.
//                 </div>
//               ) : detailLoading ? (
//                 <div className="space-y-2">
//                   <Skeleton className="h-6 w-64" />
//                   <Skeleton className="h-4 w-96" />
//                 </div>
//               ) : detailError ? (
//                 <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
//                   {detailError}
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
//                     <div>
//                       <div className="text-lg font-semibold text-slate-900">
//                         {student?.full_name ?? "-"}
//                       </div>
//                       <div className="text-sm text-slate-600">
//                         MSSV: <span className="font-medium text-slate-900">{student?.student_code ?? "-"}</span>
//                         {" • "}
//                         Lớp: <span className="font-medium text-slate-900">{student?.class?.class_code ?? "-"}</span>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-2">
//                       <Badge className="bg-slate-50 text-slate-900 border border-slate-200">
//                         Warning: {importantSummary.warned}
//                       </Badge>
//                       <Badge className="bg-indigo-50 text-indigo-900 border border-indigo-200">
//                         GPA HK: {snapshot?.gpa_semester ?? "-"}
//                       </Badge>
//                     </div>
//                   </div>

//                   {warnings?.length > 0 && (
//                     <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-3">
//                       <div className="text-sm font-medium text-slate-900">
//                         Cảnh báo trong kỳ (nhấn mạnh)
//                       </div>
//                       <div className="mt-2 space-y-1">
//                         {warnings.slice(0, 4).map((w: any) => (
//                           <div key={w.id} className="text-sm text-slate-700">
//                             <span className="font-medium">#{w.id}</span>{" "}
//                             {w?.rule?.rule_code ?? ""} — {w?.rule?.rule_name ?? "Warning"}{" "}
//                             <span className="text-slate-500">({w.status})</span>
//                           </div>
//                         ))}
//                         {warnings.length > 4 && (
//                           <div className="text-xs text-slate-500">
//                             +{warnings.length - 4} cảnh báo khác (xem “Chi tiết/Timeline”)
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Notes */}
//           <Card className="border-slate-200/70">
//             <CardHeader className="pb-3">
//               <CardTitle className="text-base">Ghi chú tư vấn</CardTitle>
//               <CardDescription className="text-slate-600">
//                 Tạo ghi chú mới (có thể gắn warning) và xem lịch sử.
//               </CardDescription>
//             </CardHeader>

//             <CardContent className="space-y-4">
//               {(notesError || (notesError && !notesLoading)) && (
//                 <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
//                   {notesError}
//                 </div>
//               )}

//               {/* Create note */}
//               <div className="rounded-lg border border-slate-200 p-3 space-y-2">
//                 <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
//                   <div className="md:col-span-2">
//                     <div className="text-xs font-medium text-slate-600 mb-1">Nội dung</div>
//                     <Textarea
//                       value={noteContent}
//                       onChange={(e) => setNoteContent(e.target.value)}
//                       placeholder="Nhập ghi chú tư vấn..."
//                       className="bg-white"
//                       disabled={!studentId || saving}
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <div>
//                       <div className="text-xs font-medium text-slate-600 mb-1">Ngày tư vấn</div>
//                       <Input
//                         type="date"
//                         value={counselingDate}
//                         onChange={(e) => setCounselingDate(e.target.value)}
//                         className="bg-white"
//                         disabled={!studentId || saving}
//                       />
//                     </div>

//                     <div>
//                       <div className="text-xs font-medium text-slate-600 mb-1">Gắn warning</div>
//                       <select
//                         className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
//                         value={warningId}
//                         onChange={(e) => setWarningId(e.target.value)}
//                         disabled={!studentId || saving}
//                       >
//                         <option value="">(không gắn)</option>
//                         {warnings?.map((w: any) => (
//                           <option key={w.id} value={String(w.id)}>
//                             #{w.id} — {w?.rule?.rule_code ?? w?.rule?.rule_name ?? "Warning"}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div>
//                       <div className="text-xs font-medium text-slate-600 mb-1">Trạng thái xử lý</div>
//                       <select
//                         className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
//                         value={handlingStatus}
//                         onChange={(e) => setHandlingStatus(e.target.value as any)}
//                         disabled={!studentId || saving}
//                       >
//                         <option value="not_contacted">Chưa liên hệ</option>
//                         <option value="contacted">Đã liên hệ</option>
//                         <option value="monitoring">Theo dõi</option>
//                         <option value="stable">Ổn định</option>
//                       </select>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex justify-end">
//                   <Button
//                     className="bg-slate-900 text-slate-50 hover:bg-slate-800"
//                     disabled={!studentId || saving || !noteContent.trim()}
//                     onClick={onCreateNote}
//                   >
//                     Tạo ghi chú
//                   </Button>
//                 </div>
//               </div>

//               {/* Notes list */}
//               {!studentId ? (
//                 <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-600">
//                   Chọn sinh viên để xem notes.
//                 </div>
//               ) : notesLoading ? (
//                 <div className="space-y-2">
//                   <Skeleton className="h-10 w-full" />
//                   <Skeleton className="h-10 w-full" />
//                 </div>
//               ) : notes.length === 0 ? (
//                 <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-600">
//                   Chưa có ghi chú.
//                 </div>
//               ) : (
//                 <div className="space-y-2">
//                   {notes.map((n: any) => (
//                     <div key={n.id} className="rounded-lg border border-slate-200 p-3">
//                       <div className="flex items-center justify-between gap-2">
//                         <div className="text-sm font-medium text-slate-900">
//                           {n?.advisor?.full_name ?? "Advisor"}
//                         </div>
//                         <Badge variant="outline" className="border-slate-300 text-slate-700">
//                           {n.handling_status ?? "-"}
//                         </Badge>
//                       </div>
//                       <div className="mt-1 text-sm text-slate-700">{n.content}</div>
//                       <div className="mt-1 text-xs text-slate-500">
//                         warning_id: {n.warning_id ?? "-"} • counseling_date: {n.counseling_date ?? "-"}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/pages/notes/NotesPage.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { advisorService } from "@/services/advisor.service";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import AdvisorScopeBar from "@/feature/AdvisorScopeBar";
import BackButton from "@/feature/BackButton";
import NotesPanel from "@/feature/NotesPanel";
import StudentSummaryCard from "@/feature/StudentSummaryCard";
import EmptyState from "@/feature/EmptyState";

import { useAdvisorScope } from "@/hooks/useAdvisorScope";
import { useQueryParamString } from "@/hooks/useQueryParam";
import { safeNumber } from "@/utils/numbers";

function makeCleanReturnTo(pathname: string, search: string) {
  const sp = new URLSearchParams(search);
  sp.delete("return_to");
  const qs = sp.toString();
  return encodeURIComponent(pathname + (qs ? `?${qs}` : ""));
}

function warningsBadge(n: number) {
  if (n <= 0) return <Badge variant="outline" className="border-slate-300 text-slate-700">0</Badge>;
  if (n === 1) return <Badge className="bg-amber-50 text-amber-900 border border-amber-200">1</Badge>;
  return <Badge className="bg-rose-50 text-rose-900 border border-rose-200">{n}</Badge>;
}

export default function NotesPage() {
  const loc = useLocation();
  const returnTo = useMemo(() => makeCleanReturnTo(loc.pathname, loc.search), [loc.pathname, loc.search]);

  const { classes, semesters, classId, semesterId, setClassId, setSemesterId, ready } = useAdvisorScope();
  const [studentIdParam, setStudentIdParam] = useQueryParamString("student_id", "");

  const studentId = studentIdParam ? String(studentIdParam) : null;

  // picker UI
  const [q, setQ] = useState("");
  const [onlyWarned, setOnlyWarned] = useState(true);

  const [studentLoading, setStudentLoading] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);
  const [studentRows, setStudentRows] = useState<any[]>([]);
  const [studentPage, setStudentPage] = useState(1);
  const [studentTotalPages, setStudentTotalPages] = useState(1);

  // workspace
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [studentDetail, setStudentDetail] = useState<any>(null);

  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const api: any = advisorService;

  const loadStudents = useCallback(
    async (opts?: { page?: number; q?: string }) => {
      if (!classId || !semesterId) return;

      const page = opts?.page ?? studentPage;
      const query = (opts?.q ?? q).trim();

      setStudentLoading(true);
      setStudentError(null);

      try {
        const res = await api.getDashboard({
          class_id: classId,
          semester_id: semesterId,
          page,
          limit: 20,
          q: query || undefined,
          warned_only: onlyWarned,
        });

        const paging = res?.students ?? res;
        const rows = paging?.data ?? [];
        setStudentRows(rows);
        setStudentPage(paging?.page ?? page);
        setStudentTotalPages(paging?.totalPages ?? 1);
      } catch (e: any) {
        setStudentError(e?.response?.data?.message ?? e?.message ?? "Load students failed");
        setStudentRows([]);
        setStudentTotalPages(1);
      } finally {
        setStudentLoading(false);
      }
    },
    [api, classId, semesterId, studentPage, q, onlyWarned]
  );

  const loadDetail = useCallback(async () => {
    if (!studentId || !semesterId) return;
    setDetailLoading(true);
    setDetailError(null);
    try {
      const res = await api.getStudentDetail(studentId, {
        semester_id: semesterId,
        include_grades: false,
      });
      setStudentDetail(res);
    } catch (e: any) {
      setDetailError(e?.response?.data?.message ?? e?.message ?? "Load student detail failed");
      setStudentDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, [api, studentId, semesterId]);

  const loadNotes = useCallback(async () => {
    if (!studentId) return;
    setNotesLoading(true);
    setNotesError(null);
    try {
      const res = await api.listNotes(studentId);
      const rows = res?.data ?? res?.items ?? res ?? [];
      setNotes(rows);
    } catch (e: any) {
      setNotesError(e?.response?.data?.message ?? e?.message ?? "Load notes failed");
      setNotes([]);
    } finally {
      setNotesLoading(false);
    }
  }, [api, studentId]);

  // scope changed -> refresh list + clear selected student
  useEffect(() => {
    if (!ready) return;
    setStudentPage(1);
    setStudentIdParam(""); // clear student selection when scope changes
    loadStudents({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, classId, semesterId, onlyWarned]);

  // debounce q
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      setStudentPage(1);
      loadStudents({ page: 1 });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // student selected -> load workspace
  useEffect(() => {
    if (!studentId) {
      setStudentDetail(null);
      setNotes([]);
      return;
    }
    loadDetail();
    loadNotes();
  }, [studentId, loadDetail, loadNotes]);

  const student = studentDetail?.student ?? null;
  const snapshot = studentDetail?.snapshot ?? null;
  const warnings = (studentDetail?.warnings ?? []) as any[];

  const semesterLabel = useMemo(() => {
    const s = semesters.find((x: any) => String(x?.id) === String(semesterId));
    if (!s) return "";
    return `${s.semester_code} — ${s.name}`;
  }, [semesters, semesterId]);

  const onCreateNote = useCallback(
    async (payload: { content: string; counseling_date?: string; handling_status: any; warning_id?: string }) => {
      if (!studentId) return;
      setSaving(true);
      setNotesError(null);
      try {
        await api.createNote({
          student_id: studentId,
          content: payload.content,
          counseling_date: payload.counseling_date,
          handling_status: payload.handling_status,
          warning_id: payload.warning_id,
        });
        await Promise.all([loadNotes(), loadDetail()]);
      } catch (e: any) {
        setNotesError(e?.response?.data?.message ?? e?.message ?? "Create note failed");
      } finally {
        setSaving(false);
      }
    },
    [api, studentId, loadNotes, loadDetail]
  );

  const studentDetailHref =
    studentId && semesterId
      ? `/students/${encodeURIComponent(studentId)}?semester_id=${encodeURIComponent(semesterId)}&return_to=${returnTo}`
      : "#";

  const studentTimelineHref =
    studentId && semesterId
      ? `/students/${encodeURIComponent(studentId)}/timeline?semester_id=${encodeURIComponent(semesterId)}&return_to=${returnTo}`
      : "#";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xl font-semibold text-slate-900">Ghi chú tư vấn</div>
          <div className="text-sm text-slate-600">Chọn lớp/học kỳ → chọn sinh viên → xem & tạo ghi chú.</div>
        </div>
        <div className="flex items-center gap-2">
          <BackButton />
          <Button variant="outline" className="border-slate-300" asChild>
            <Link to="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>

      <Separator />

      <AdvisorScopeBar
        classes={classes}
        semesters={semesters}
        classId={classId}
        semesterId={semesterId}
        onChangeClassId={(id) => {
          setStudentIdParam("");
          setClassId(id);
        }}
        onChangeSemesterId={(id) => {
          setStudentIdParam("");
          setSemesterId(id);
        }}
        bottomSlot={
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="text-xs font-medium text-slate-600 mb-1">Tìm sinh viên</div>
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tên hoặc MSSV..."
                className="bg-white"
                disabled={!ready}
              />
            </div>

            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={onlyWarned} onChange={(e) => setOnlyWarned(e.target.checked)} />
                Chỉ SV có cảnh báo
              </label>
            </div>

            <div className="flex items-end justify-end">
              <Button
                variant="outline"
                className="border-slate-300"
                disabled={!ready || studentLoading}
                onClick={() => loadStudents({ page: 1 })}
              >
                Reload
              </Button>
            </div>
          </div>
        }
      />

      {/* Main */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {/* Left picker */}
        <Card className="border-slate-200/70 md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Chọn sinh viên</CardTitle>
            <CardDescription className="text-slate-600">Danh sách theo scope. Click để mở workspace.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-2">
            {studentError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {studentError}
              </div>
            )}

            {!ready ? (
              <EmptyState title="Vui lòng chọn lớp và học kỳ" description="Scope là bắt buộc để notes đồng bộ đúng." />
            ) : studentLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : studentRows.length === 0 ? (
              <EmptyState title="Không có sinh viên phù hợp" description="Thử đổi bộ lọc hoặc tắt 'chỉ SV có cảnh báo'." />
            ) : (
              <>
                <div className="space-y-2">
                  {studentRows.map((r: any) => {
                    const st = r?.student ?? {};
                    const sn = r?.snapshot ?? {};
                    const warned = safeNumber(r?.warnings_total, 0);

                    const active = String(st?.id) === String(studentId);
                    const tone =
                      warned >= 2 ? "border-rose-200 bg-rose-50/40" :
                      warned === 1 ? "border-amber-200 bg-amber-50/30" :
                      "border-slate-200 bg-white";

                    return (
                      <button
                        key={st?.id ?? st?.student_code}
                        type="button"
                        onClick={() => setStudentIdParam(String(st?.id))}
                        className={[
                          "w-full text-left rounded-lg border p-3 transition-colors",
                          tone,
                          active ? "ring-2 ring-slate-900/20" : "hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-slate-900 truncate">{st?.full_name ?? "-"}</div>
                            <div className="text-xs text-slate-500 truncate">
                              {st?.student_code ?? "-"} • GPA: {sn?.gpa_semester ?? "-"}
                            </div>
                          </div>
                          <div className="shrink-0">{warningsBadge(warned)}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-300"
                    disabled={studentPage <= 1 || studentLoading}
                    onClick={() => loadStudents({ page: Math.max(1, studentPage - 1) })}
                  >
                    Trước
                  </Button>
                  <div className="text-xs text-slate-600">
                    Trang {studentPage}/{Math.max(1, studentTotalPages)}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-300"
                    disabled={studentPage >= studentTotalPages || studentLoading}
                    onClick={() => loadStudents({ page: Math.min(studentTotalPages, studentPage + 1) })}
                  >
                    Sau
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Right workspace */}
        <div className="md:col-span-2 space-y-3">
          <Card className="border-slate-200/70">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">Workspace</CardTitle>
                  <CardDescription className="text-slate-600">Notes gắn theo sinh viên, trong scope học kỳ.</CardDescription>
                </div>

                {studentId && semesterId && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="border-slate-300" asChild>
                      <Link to={studentDetailHref}>Chi tiết</Link>
                    </Button>
                    <Button variant="outline" className="border-slate-300" asChild>
                      <Link to={studentTimelineHref}>Timeline</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {!studentId ? (
                <EmptyState title="Chọn một sinh viên" description="Click một sinh viên bên trái để xem snapshot + warnings + notes." />
              ) : detailLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-64" />
                  <Skeleton className="h-4 w-96" />
                </div>
              ) : detailError ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {detailError}
                </div>
              ) : (
                <StudentSummaryCard
                  student={student}
                  snapshot={snapshot}
                  warningsCount={warnings?.length ?? 0}
                  semesterLabel={semesterLabel}
                />
              )}
            </CardContent>
          </Card>

          <NotesPanel
            loading={notesLoading}
            saving={saving}
            notes={notes}
            warningsForAttach={warnings}
            error={notesError}
            onCreate={onCreateNote}
          />
        </div>
      </div>
    </div>
  );
}
