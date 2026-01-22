// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { cn } from "@/lib/utils";
// import { Link } from "react-router-dom";

// function safeNumber(n: any, fallback = 0) {
//   const num = typeof n === "number" ? n : Number(n);
//   return Number.isFinite(num) ? num : fallback;
// }

// function fmtNumber(n: any, digits = 2) {
//   const num = safeNumber(n, NaN);
//   if (!Number.isFinite(num)) return "-";
//   return num.toFixed(digits);
// }

// function academicStatusBadge(s: string) {
//   switch (s) {
//     case "studying":
//       return (
//         <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200">
//           Đang học
//         </Badge>
//       );
//     case "leave":
//       return (
//         <Badge className="bg-amber-50 text-amber-800 border border-amber-200">
//           Tạm nghỉ
//         </Badge>
//       );
//     case "dropout":
//       return (
//         <Badge className="bg-rose-50 text-rose-800 border border-rose-200">
//           Thôi học
//         </Badge>
//       );
//     case "graduated":
//       return (
//         <Badge className="bg-slate-100 text-slate-800 border border-slate-200">
//           Tốt nghiệp
//         </Badge>
//       );
//     default:
//       return (
//         <Badge variant="outline" className="border-slate-300 text-slate-700">
//           {s || "-"}
//         </Badge>
//       );
//   }
// }

// function dataStatusBadge(s: string) {
//   const norm = s === "missing_data" ? "missing" : s;
//   switch (norm) {
//     case "ok":
//       return (
//         <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200">
//           OK
//         </Badge>
//       );
//     case "missing":
//       return (
//         <Badge className="bg-amber-50 text-amber-800 border border-amber-200">
//           Thiếu dữ liệu
//         </Badge>
//       );
//     case "error":
//       return (
//         <Badge className="bg-rose-50 text-rose-800 border border-rose-200">
//           Lỗi
//         </Badge>
//       );
//     default:
//       return (
//         <Badge variant="outline" className="border-slate-300 text-slate-700">
//           {s || "-"}
//         </Badge>
//       );
//   }
// }

// function warningsBadge(n: number) {
//   if (n <= 0) {
//     return (
//       <Badge variant="outline" className="border-slate-300 text-slate-700">
//         0
//       </Badge>
//     );
//   }
//   if (n === 1) {
//     return (
//       <Badge className="bg-amber-50 text-amber-900 border border-amber-200">
//         1
//       </Badge>
//     );
//   }
//   return (
//     <Badge className="bg-rose-50 text-rose-900 border border-rose-200">
//       {n}
//     </Badge>
//   );
// }

// type Props = {
//   rows: any[];
//   semesterId: string; // ✅ thêm prop này

//   loading?: boolean;
//   page: number;
//   limit: number;
//   total: number;
//   totalPages: number;

//   onChangePage: (p: number) => void;
//   onChangeLimit: (l: number) => void;
// };

// export default function StudentsTable({
//   rows,
//   semesterId,
//   loading,
//   page,
//   limit,
//   total,
//   totalPages,
//   onChangePage,
//   onChangeLimit,
// }: Props) {
//   return (
//     <div className="space-y-3">
//       <div className="overflow-x-auto">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead className="min-w-40">Sinh viên</TableHead>
//               <TableHead className="min-w-30">MSSV</TableHead>
//               <TableHead>Học vụ</TableHead>
//               <TableHead className="text-right">GPA HK</TableHead>
//               <TableHead className="text-right">GPA TL</TableHead>
//               <TableHead className="text-right">TC đậu</TableHead>
//               <TableHead className="text-right">TC rớt</TableHead>
//               <TableHead className="text-right">Môn rớt</TableHead>
//               <TableHead className="text-right">Cảnh báo</TableHead>
//               <TableHead>Data</TableHead>
//             </TableRow>
//           </TableHeader>

//           <TableBody>
//             {loading && (
//               <TableRow>
//                 <TableCell colSpan={10} className="text-slate-600">
//                   Đang tải...
//                 </TableCell>
//               </TableRow>
//             )}

//             {!loading &&
//               rows.map((row: any) => {
//                 const st = row?.student ?? {};
//                 const sn = row?.snapshot ?? {};
//                 const warningsTotal = safeNumber(row?.warnings_total, 0);

//                 const rowTone =
//                   warningsTotal >= 2
//                     ? "bg-rose-50/40 hover:bg-rose-50/60"
//                     : warningsTotal === 1
//                     ? "bg-amber-50/30 hover:bg-amber-50/50"
//                     : "hover:bg-slate-50/70";

//                 return (
//                   <TableRow
//                     key={st.id ?? st.student_code ?? `${st.full_name}-x`}
//                     className={cn(rowTone)}
//                   >
//                     <TableCell className="font-medium text-slate-900">
//                       {st?.id ? (
//                         <Link
//                           to={`/students/${st.id}?semester_id=${encodeURIComponent(
//                             semesterId
//                           )}`} // ✅ giữ học kỳ khi vào detail/timeline
//                           className="hover:underline hover:underline-offset-4"
//                         >
//                           {st.full_name ?? "-"}
//                         </Link>
//                       ) : (
//                         <span>{st.full_name ?? "-"}</span>
//                       )}
//                     </TableCell>

//                     <TableCell className="text-slate-700">
//                       {st.student_code ?? "-"}
//                     </TableCell>

//                     <TableCell>
//                       {academicStatusBadge(st.academic_status)}
//                     </TableCell>

//                     <TableCell className="text-right tabular-nums">
//                       {fmtNumber(sn.gpa_semester, 2)}
//                     </TableCell>

//                     <TableCell className="text-right tabular-nums">
//                       {fmtNumber(sn.gpa_cumulative, 2)}
//                     </TableCell>

//                     <TableCell className="text-right tabular-nums">
//                       {sn.credits_earned_semester ?? "-"}
//                     </TableCell>

//                     <TableCell className="text-right tabular-nums">
//                       {sn.credits_failed_semester ?? "-"}
//                     </TableCell>

//                     <TableCell className="text-right tabular-nums">
//                       {sn.failed_courses_count_semester ?? "-"}
//                     </TableCell>

//                     <TableCell className="text-right tabular-nums">
//                       {warningsBadge(warningsTotal)}
//                     </TableCell>

//                     <TableCell>
//                       {dataStatusBadge(String(sn.data_status ?? ""))}
//                     </TableCell>
//                   </TableRow>
//                 );
//               })}
//           </TableBody>
//         </Table>
//       </div>

//       <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
//         <div className="text-xs text-slate-600">
//           Tổng {total} • Trang {page}/{Math.max(1, totalPages)}
//         </div>

//         <div className="flex items-center gap-2">
//           <select
//             className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
//             value={limit}
//             onChange={(e) => onChangeLimit(Number(e.target.value))}
//           >
//             {[10, 20, 50, 100].map((x) => (
//               <option key={x} value={x}>
//                 {x}/trang
//               </option>
//             ))}
//           </select>

//           <Button
//             size="sm"
//             variant="outline"
//             className="border-slate-300"
//             disabled={page <= 1}
//             onClick={() => onChangePage(page - 1)}
//           >
//             Trước
//           </Button>

//           <Button
//             size="sm"
//             variant="outline"
//             className="border-slate-300"
//             disabled={page >= totalPages}
//             onClick={() => onChangePage(page + 1)}
//           >
//             Sau
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { cn } from "@/lib/utils";
// import { fmtNumber, safeNumber } from "@/utils/numbers";
// import { Link } from "react-router-dom";

// function academicStatusBadge(s: string) {
//   switch (s) {
//     case "studying":
//       return <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200">Đang học</Badge>;
//     case "leave":
//       return <Badge className="bg-amber-50 text-amber-800 border border-amber-200">Tạm nghỉ</Badge>;
//     case "dropout":
//       return <Badge className="bg-rose-50 text-rose-800 border border-rose-200">Thôi học</Badge>;
//     case "graduated":
//       return <Badge className="bg-slate-100 text-slate-800 border border-slate-200">Tốt nghiệp</Badge>;
//     default:
//       return <Badge variant="outline" className="border-slate-300 text-slate-700">{s || "-"}</Badge>;
//   }
// }

// function dataStatusBadge(s: string) {
//   const norm = s === "missing_data" ? "missing" : s;
//   switch (norm) {
//     case "ok":
//       return <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200">OK</Badge>;
//     case "missing":
//       return <Badge className="bg-amber-50 text-amber-800 border border-amber-200">Thiếu dữ liệu</Badge>;
//     case "error":
//       return <Badge className="bg-rose-50 text-rose-800 border border-rose-200">Lỗi</Badge>;
//     default:
//       return <Badge variant="outline" className="border-slate-300 text-slate-700">{s || "-"}</Badge>;
//   }
// }

// function warningsBadge(n: number) {
//   if (n <= 0) return <Badge variant="outline" className="border-slate-300 text-slate-700">0</Badge>;
//   if (n === 1) return <Badge className="bg-amber-50 text-amber-900 border border-amber-200">1</Badge>;
//   return <Badge className="bg-rose-50 text-rose-900 border border-rose-200">{n}</Badge>;
// }

// type Props = {
//   rows: any[];
//   semesterId: string;
//   loading?: boolean;

//   page: number;
//   pageSize: number;
//   total: number;
//   totalPages: number;

//   returnTo: string;

//   onChangePage: (p: number) => void;
//   onChangePageSize: (n: number) => void;
// };

// export default function StudentsTable({
//   rows,
//   semesterId,
//   loading,
//   page,
//   pageSize,
//   total,
//   totalPages,
//   returnTo,
//   onChangePage,
//   onChangePageSize,
// }: Props) {
//   return (
//     <div className="space-y-3">
//       <div className="overflow-x-auto">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead className="min-w-56">Sinh viên</TableHead>
//               <TableHead className="min-w-28">MSSV</TableHead>
//               <TableHead>Học vụ</TableHead>
//               <TableHead className="text-right">GPA HK</TableHead>
//               <TableHead className="text-right">GPA TL</TableHead>
//               <TableHead className="text-right">Môn rớt</TableHead>
//               <TableHead className="text-right">Cảnh báo</TableHead>
//               <TableHead>Data</TableHead>
//               <TableHead className="min-w-56">Thao tác</TableHead>
//             </TableRow>
//           </TableHeader>

//           <TableBody>
//             {loading && (
//               <TableRow>
//                 <TableCell colSpan={9} className="text-slate-600">Đang tải...</TableCell>
//               </TableRow>
//             )}

//             {!loading &&
//               rows.map((row: any) => {
//                 const st = row?.student ?? {};
//                 const sn = row?.snapshot ?? {};
//                 const warningsTotal = safeNumber(row?.warnings_total, 0);

//                 const rowTone =
//                   warningsTotal >= 2 ? "bg-rose-50/40 hover:bg-rose-50/60"
//                   : warningsTotal === 1 ? "bg-amber-50/30 hover:bg-amber-50/50"
//                   : "hover:bg-slate-50/70";

//                 const studentUrl =
//                   `/students/${st.id}?semester_id=${encodeURIComponent(semesterId)}&return_to=${encodeURIComponent(returnTo)}`;

//                 const timelineUrl =
//                   `/students/${st.id}/timeline?semester_id=${encodeURIComponent(semesterId)}&return_to=${encodeURIComponent(returnTo)}`;

//                 const notesUrl =
//                   `/notes?student_id=${encodeURIComponent(st.id)}&semester_id=${encodeURIComponent(semesterId)}&return_to=${encodeURIComponent(returnTo)}`;

//                 return (
//                   <TableRow key={st.id ?? st.student_code ?? `${st.full_name}-x`} className={cn(rowTone)}>
//                     <TableCell className="font-medium text-slate-900">
//                       {st?.id ? (
//                         <Link to={studentUrl} className="hover:underline hover:underline-offset-4">
//                           {st.full_name ?? "-"}
//                         </Link>
//                       ) : (
//                         <span>{st.full_name ?? "-"}</span>
//                       )}
//                     </TableCell>

//                     <TableCell className="text-slate-700">{st.student_code ?? "-"}</TableCell>
//                     <TableCell>{academicStatusBadge(st.academic_status)}</TableCell>

//                     <TableCell className="text-right tabular-nums">{fmtNumber(sn.gpa_semester, 2)}</TableCell>
//                     <TableCell className="text-right tabular-nums">{fmtNumber(sn.gpa_cumulative, 2)}</TableCell>
//                     <TableCell className="text-right tabular-nums">{sn.failed_courses_count_semester ?? "-"}</TableCell>
//                     <TableCell className="text-right tabular-nums">{warningsBadge(warningsTotal)}</TableCell>
//                     <TableCell>{dataStatusBadge(String(sn.data_status ?? ""))}</TableCell>

//                     <TableCell>
//                       <div className="flex flex-wrap items-center gap-2">
//                         <Button size="sm" variant="outline" className="border-slate-300" asChild>
//                           <Link to={studentUrl}>Chi tiết</Link>
//                         </Button>
//                         <Button size="sm" variant="outline" className="border-slate-300" asChild>
//                           <Link to={timelineUrl}>Timeline</Link>
//                         </Button>
//                         <Button size="sm" className="bg-slate-900 text-slate-50 hover:bg-slate-800" asChild>
//                           <Link to={notesUrl}>Notes</Link>
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 );
//               })}
//           </TableBody>
//         </Table>
//       </div>

//       <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
//         <div className="text-xs text-slate-600">
//           Tổng {total} • Trang {page}/{Math.max(1, totalPages)}
//         </div>

//         <div className="flex items-center gap-2">
//           <select
//             className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
//             value={pageSize}
//             onChange={(e) => onChangePageSize(Number(e.target.value))}
//           >
//             {[10, 20, 50, 100].map((x) => (
//               <option key={x} value={x}>{x}/trang</option>
//             ))}
//           </select>

//           <Button size="sm" variant="outline" className="border-slate-300" disabled={page <= 1} onClick={() => onChangePage(page - 1)}>
//             Trước
//           </Button>
//           <Button size="sm" variant="outline" className="border-slate-300" disabled={page >= totalPages} onClick={() => onChangePage(page + 1)}>
//             Sau
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }


// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { cn } from "@/lib/utils";
// import { Link } from "react-router-dom";

// function safeNumber(n: any, fallback = 0) {
//   const num = typeof n === "number" ? n : Number(n);
//   return Number.isFinite(num) ? num : fallback;
// }
// function fmtNumber(n: any, digits = 2) {
//   const num = safeNumber(n, NaN);
//   if (!Number.isFinite(num)) return "-";
//   return num.toFixed(digits);
// }

// function academicStatusBadge(s: string) {
//   switch (s) {
//     case "studying":
//       return <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200">Đang học</Badge>;
//     case "paused":
//     case "leave":
//       return <Badge className="bg-amber-50 text-amber-800 border border-amber-200">Tạm dừng</Badge>;
//     case "dropped":
//     case "dropout":
//       return <Badge className="bg-rose-50 text-rose-800 border border-rose-200">Thôi học</Badge>;
//     default:
//       return (
//         <Badge variant="outline" className="border-slate-300 text-slate-700">
//           {s || "-"}
//         </Badge>
//       );
//   }
// }

// function dataStatusBadge(s: string) {
//   const norm = s === "missing_data" ? "missing" : s;
//   switch (norm) {
//     case "ok":
//       return <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200">OK</Badge>;
//     case "missing":
//       return <Badge className="bg-amber-50 text-amber-800 border border-amber-200">Thiếu</Badge>;
//     case "error":
//       return <Badge className="bg-rose-50 text-rose-800 border border-rose-200">Lỗi</Badge>;
//     default:
//       return (
//         <Badge variant="outline" className="border-slate-300 text-slate-700">
//           {s || "-"}
//         </Badge>
//       );
//   }
// }

// function warningsBadge(n: number) {
//   if (n <= 0) return <Badge variant="outline" className="border-slate-300 text-slate-700">0</Badge>;
//   if (n === 1) return <Badge className="bg-amber-50 text-amber-900 border border-amber-200">1</Badge>;
//   return <Badge className="bg-rose-50 text-rose-900 border border-rose-200">{n}</Badge>;
// }

// type Props = {
//   rows: any[];
//   loading?: boolean;

//   semesterId: string;
//   returnTo: string; // đã encodeURIComponent sẵn

//   page: number;
//   pageSize: number;
//   total: number;
//   totalPages: number;

//   onChangePage: (p: number) => void;
//   onChangePageSize: (n: number) => void;
// };

// export default function StudentsTable({
//   rows,
//   loading,
//   semesterId,
//   returnTo,
//   page,
//   pageSize,
//   total,
//   totalPages,
//   onChangePage,
//   onChangePageSize,
// }: Props) {
//   return (
//     <div className="space-y-3">
//       <div className="overflow-x-auto">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead className="min-w-56">Sinh viên</TableHead>
//               <TableHead className="min-w-32">MSSV</TableHead>
//               <TableHead>Học vụ</TableHead>
//               <TableHead className="text-right">GPA HK</TableHead>
//               <TableHead className="text-right">GPA TL</TableHead>
//               <TableHead className="text-right">TC đậu</TableHead>
//               <TableHead className="text-right">TC rớt</TableHead>
//               <TableHead className="text-right">Môn rớt</TableHead>
//               <TableHead className="text-right">Cảnh báo</TableHead>
//               <TableHead>Data</TableHead>
//               <TableHead className="text-right">Hành động</TableHead>
//             </TableRow>
//           </TableHeader>

//           <TableBody>
//             {loading && (
//               <TableRow>
//                 <TableCell colSpan={11} className="text-slate-600">
//                   Đang tải...
//                 </TableCell>
//               </TableRow>
//             )}

//             {!loading &&
//               rows.map((row: any) => {
//                 const st = row?.student ?? {};
//                 const sn = row?.snapshot ?? {};
//                 const warningsTotal = safeNumber(row?.warnings_total, 0);

//                 const rowTone =
//                   warningsTotal >= 2
//                     ? "bg-rose-50/40 hover:bg-rose-50/60"
//                     : warningsTotal === 1
//                     ? "bg-amber-50/30 hover:bg-amber-50/50"
//                     : "hover:bg-slate-50/70";

//                 const sid = String(st?.id ?? "");
//                 const detailHref = `/students/${encodeURIComponent(sid)}?semester_id=${encodeURIComponent(
//                   semesterId
//                 )}&return_to=${returnTo}`;
//                 const timelineHref = `/students/${encodeURIComponent(
//                   sid
//                 )}/timeline?semester_id=${encodeURIComponent(semesterId)}&return_to=${returnTo}`;

//                 return (
//                   <TableRow key={sid || st.student_code} className={cn(rowTone)}>
//                     <TableCell className="font-medium text-slate-900">
//                       {sid ? (
//                         <Link to={detailHref} className="hover:underline hover:underline-offset-4">
//                           {st.full_name ?? "-"}
//                         </Link>
//                       ) : (
//                         <span>{st.full_name ?? "-"}</span>
//                       )}
//                     </TableCell>

//                     <TableCell className="text-slate-700">{st.student_code ?? "-"}</TableCell>

//                     <TableCell>{academicStatusBadge(String(st.academic_status ?? ""))}</TableCell>

//                     <TableCell className="text-right tabular-nums">{fmtNumber(sn.gpa_semester, 2)}</TableCell>
//                     <TableCell className="text-right tabular-nums">{fmtNumber(sn.gpa_cumulative, 2)}</TableCell>

//                     <TableCell className="text-right tabular-nums">{sn.credits_earned_semester ?? "-"}</TableCell>
//                     <TableCell className="text-right tabular-nums">{sn.credits_failed_semester ?? "-"}</TableCell>
//                     <TableCell className="text-right tabular-nums">{sn.failed_courses_count_semester ?? "-"}</TableCell>

//                     <TableCell className="text-right tabular-nums">{warningsBadge(warningsTotal)}</TableCell>

//                     <TableCell>{dataStatusBadge(String(sn.data_status ?? ""))}</TableCell>

//                     <TableCell className="text-right">
//                       <div className="flex items-center justify-end gap-2">
//                         <Button size="sm" className="bg-slate-900 text-slate-50 hover:bg-slate-800" asChild>
//                           <Link to={detailHref}>Xử lý</Link>
//                         </Button>
//                         <Button size="sm" variant="outline" className="border-slate-300" asChild>
//                           <Link to={timelineHref}>Timeline</Link>
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 );
//               })}
//           </TableBody>
//         </Table>
//       </div>

//       <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
//         <div className="text-xs text-slate-600">
//           Tổng {total} • Trang {page}/{Math.max(1, totalPages)}
//         </div>

//         <div className="flex items-center gap-2">
//           <select
//             className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
//             value={pageSize}
//             onChange={(e) => onChangePageSize(Number(e.target.value))}
//           >
//             {[10, 20, 50, 100].map((x) => (
//               <option key={x} value={x}>
//                 {x}/trang
//               </option>
//             ))}
//           </select>

//           <Button size="sm" variant="outline" className="border-slate-300" disabled={page <= 1} onClick={() => onChangePage(page - 1)}>
//             Trước
//           </Button>

//           <Button size="sm" variant="outline" className="border-slate-300" disabled={page >= totalPages} onClick={() => onChangePage(page + 1)}>
//             Sau
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }


import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

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
      return <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200">Đang học</Badge>;
    case "paused":
    case "leave":
      return <Badge className="bg-amber-50 text-amber-800 border border-amber-200">Tạm dừng</Badge>;
    case "dropped":
    case "dropout":
      return <Badge className="bg-rose-50 text-rose-800 border border-rose-200">Thôi học</Badge>;
    default:
      return (
        <Badge variant="outline" className="border-slate-300 text-slate-700">
          {s || "-"}
        </Badge>
      );
  }
}

function dataStatusBadge(s: string) {
  const norm = s === "missing_data" ? "missing" : s;
  switch (norm) {
    case "ok":
      return <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200">OK</Badge>;
    case "missing":
      return <Badge className="bg-amber-50 text-amber-800 border border-amber-200">Thiếu</Badge>;
    case "error":
      return <Badge className="bg-rose-50 text-rose-800 border border-rose-200">Lỗi</Badge>;
    default:
      return (
        <Badge variant="outline" className="border-slate-300 text-slate-700">
          {s || "-"}
        </Badge>
      );
  }
}

function warningsBadge(n: number) {
  if (n <= 0) return <Badge variant="outline" className="border-slate-300 text-slate-700">0</Badge>;
  if (n === 1) return <Badge className="bg-amber-50 text-amber-900 border border-amber-200">1</Badge>;
  return <Badge className="bg-rose-50 text-rose-900 border border-rose-200">{n}</Badge>;
}

type Props = {
  rows: any[];
  loading?: boolean;

  semesterId: string;
  returnTo: string; // đã encodeURIComponent sẵn

  page: number;
  pageSize: number;
  total: number;
  totalPages: number;

  onChangePage: (p: number) => void;
  onChangePageSize: (n: number) => void;
};

export default function StudentsTable({
  rows,
  loading,
  semesterId,
  returnTo,
  page,
  pageSize,
  total,
  totalPages,
  onChangePage,
  onChangePageSize,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-56">Sinh viên</TableHead>
              <TableHead className="min-w-32">MSSV</TableHead>
              <TableHead>Học vụ</TableHead>
              <TableHead className="text-right">GPA HK</TableHead>
              <TableHead className="text-right">GPA TL</TableHead>
              <TableHead className="text-right">TC đậu</TableHead>
              <TableHead className="text-right">TC rớt</TableHead>
              <TableHead className="text-right">Môn rớt</TableHead>
              <TableHead className="text-right">Cảnh báo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={11} className="text-slate-600">
                  Đang tải...
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              rows.map((row: any) => {
                const st = row?.student ?? {};
                const sn = row?.snapshot ?? {};
                const warningsTotal = safeNumber(row?.warnings_total, 0);

                const rowTone =
                  warningsTotal >= 2
                    ? "bg-rose-50/40 hover:bg-rose-50/60"
                    : warningsTotal === 1
                    ? "bg-amber-50/30 hover:bg-amber-50/50"
                    : "hover:bg-slate-50/70";

                const sid = String(st?.id ?? "");
                const detailHref = `/students/${encodeURIComponent(sid)}?semester_id=${encodeURIComponent(
                  semesterId
                )}&return_to=${returnTo}`;
                const timelineHref = `/students/${encodeURIComponent(
                  sid
                )}/timeline?semester_id=${encodeURIComponent(semesterId)}&return_to=${returnTo}`;

                return (
                  <TableRow key={sid || st.student_code} className={cn(rowTone)}>
                    <TableCell className="font-medium text-slate-900">
                      {sid ? (
                        <Link to={detailHref} className="hover:underline hover:underline-offset-4">
                          {st.full_name ?? "-"}
                        </Link>
                      ) : (
                        <span>{st.full_name ?? "-"}</span>
                      )}
                    </TableCell>

                    <TableCell className="text-slate-700">{st.student_code ?? "-"}</TableCell>

                    <TableCell>{academicStatusBadge(String(st.academic_status ?? ""))}</TableCell>

                    <TableCell className="text-right tabular-nums">{fmtNumber(sn.gpa_semester, 2)}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmtNumber(sn.gpa_cumulative, 2)}</TableCell>

                    <TableCell className="text-right tabular-nums">{sn.credits_earned_semester ?? "-"}</TableCell>
                    <TableCell className="text-right tabular-nums">{sn.credits_failed_semester ?? "-"}</TableCell>
                    <TableCell className="text-right tabular-nums">{sn.failed_courses_count_semester ?? "-"}</TableCell>

                    <TableCell className="text-right tabular-nums">{warningsBadge(warningsTotal)}</TableCell>

                    <TableCell>{dataStatusBadge(String(sn.data_status ?? ""))}</TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" className="bg-slate-900 text-slate-50 hover:bg-slate-800" asChild>
                          <Link to={detailHref}>Xử lý</Link>
                        </Button>
                        <Button size="sm" variant="outline" className="border-slate-300" asChild>
                          <Link to={timelineHref}>Timeline</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="text-xs text-slate-600">
          Tổng {total} • Trang {page}/{Math.max(1, totalPages)}
        </div>

        <div className="flex items-center gap-2">
          <select
            className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
            value={pageSize}
            onChange={(e) => onChangePageSize(Number(e.target.value))}
          >
            {[10, 20, 50, 100].map((x) => (
              <option key={x} value={x}>
                {x}/trang
              </option>
            ))}
          </select>

          <Button size="sm" variant="outline" className="border-slate-300" disabled={page <= 1} onClick={() => onChangePage(page - 1)}>
            Trước
          </Button>

          <Button size="sm" variant="outline" className="border-slate-300" disabled={page >= totalPages} onClick={() => onChangePage(page + 1)}>
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}
