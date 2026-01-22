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
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { cn } from "@/lib/utils";
// import { Link } from "react-router-dom";

// function fmtDate(v?: string | null) {
//   if (!v) return "-";
//   const d = new Date(v);
//   if (Number.isNaN(d.getTime())) return "-";
//   return d.toLocaleString("vi-VN");
// }

// function statusBadge(s: string) {
//   switch (s) {
//     case "Draft":
//       return (
//         <Badge className="bg-slate-100 text-slate-900 border border-slate-200">
//           Nháp
//         </Badge>
//       );
//     case "Sent":
//       return (
//         <Badge className="bg-emerald-50 text-emerald-900 border border-emerald-200">
//           Đã gửi
//         </Badge>
//       );
//     case "SendFailed":
//       return (
//         <Badge className="bg-rose-50 text-rose-900 border border-rose-200">
//           Gửi lỗi
//         </Badge>
//       );
//     case "Acknowledged":
//       return (
//         <Badge className="bg-amber-50 text-amber-900 border border-amber-200">
//           Đã xem
//         </Badge>
//       );
//     case "Resolved":
//       return (
//         <Badge className="bg-indigo-50 text-indigo-900 border border-indigo-200">
//           Đã xử lý
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

// type WarningRow = {
//   id: string;
//   status: string;
//   detected_value: number | null;
//   reason_text: string;
//   student: { id: string; student_code: string; full_name: string };
//   rule: { id: string; rule_code: string; rule_name: string };
//   send?: {
//     channel?: string | null;
//     status?: string | null;
//     error?: string | null;
//     sent_at?: string | null;
//   };
//   created_at?: string;
// };

// type Props = {
//   rows: WarningRow[];
//   loading?: boolean;

//   page: number;
//   limit: number;
//   total: number;
//   totalPages: number;

//   selectedIds: string[];
//   onChangeSelectedIds: (ids: string[]) => void;

//   onChangePage: (p: number) => void;
//   onChangeLimit: (l: number) => void;

//   onUpdateOneStatus: (
//     warningId: string,
//     status: "Draft" | "Acknowledged" | "Resolved",
//   ) => void;
// };

// export default function WarningsTable({
//   rows,
//   loading,
//   page,
//   limit,
//   total,
//   totalPages,
//   selectedIds,
//   onChangeSelectedIds,
//   onChangePage,
//   onChangeLimit,
//   onUpdateOneStatus,
// }: Props) {
//     const allChecked =
//     rows.length > 0 && rows.every((r) => selectedIds.includes(r.id));
//     console.log('rows: ', rows);

//   return (
//     <div className="space-y-3">
//       <div className="overflow-x-auto">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead className="w-10">
//                 <input
//                   type="checkbox"
//                   checked={allChecked}
//                   onChange={(e) => {
//                     if (e.target.checked)
//                       onChangeSelectedIds(rows.map((r) => r.id));
//                     else onChangeSelectedIds([]);
//                   }}
//                 />
//               </TableHead>
//               <TableHead className="min-w-56">Sinh viên</TableHead>
//               <TableHead className="min-w-56">Rule</TableHead>
//               <TableHead className="text-right">Detected</TableHead>
//               <TableHead>Trạng thái</TableHead>
//               <TableHead>Send</TableHead>
//               <TableHead className="min-w-40">Tạo lúc</TableHead>
//               <TableHead className="min-w-44">Cập nhật</TableHead>
//             </TableRow>
//           </TableHeader>

//           <TableBody>
//             {loading && (
//               <TableRow>
//                 <TableCell colSpan={8} className="text-slate-600">
//                   Đang tải...
//                 </TableCell>
//               </TableRow>
//             )}

//             {!loading &&
//               rows.map((r) => {
//                 const checked = selectedIds.includes(r.id);

//                 const tone =
//                   r.status === "SendFailed"
//                     ? "bg-rose-50/30 hover:bg-rose-50/50"
//                     : r.status === "Draft"
//                       ? "bg-slate-50/40 hover:bg-slate-50/60"
//                       : "hover:bg-slate-50/70";

//                 return (
//                   <TableRow key={r.id} className={cn(tone)}>
//                     <TableCell>
//                       <input
//                         type="checkbox"
//                         checked={checked}
//                         onChange={(e) => {
//                           if (e.target.checked)
//                             onChangeSelectedIds([...selectedIds, r.id]);
//                           else
//                             onChangeSelectedIds(
//                               selectedIds.filter((x) => x !== r.id),
//                             );
//                         }}
//                       />
//                     </TableCell>

//                     <TableCell className="text-slate-900">
//                       {r.student?.id ? (
//                         <Link
//                           to={`/students/${r.student.id}`}
//                           className="font-medium text-slate-900 hover:underline hover:underline-offset-4"
//                         >
//                           {r.student?.full_name ?? "-"}
//                         </Link>
//                       ) : (
//                         <div className="font-medium">
//                           {r.student?.full_name ?? "-"}
//                         </div>
//                       )}

//                       <div className="text-xs text-slate-600">
//                         {r.student?.student_code ?? "-"}
//                       </div>
//                     </TableCell>

//                     <TableCell className="text-slate-900">
//                       <div className="font-medium">
//                         {r.rule?.rule_code ?? "-"} - {r.rule?.rule_name ?? "-"}
//                       </div>
//                       <div className="text-xs text-slate-600 line-clamp-1">
//                         {r.reason_text ?? ""}
//                       </div>
//                     </TableCell>

//                     <TableCell className="text-right tabular-nums">
//                       {r.detected_value ?? "-"}
//                     </TableCell>

//                     <TableCell>
//                       <div className="flex items-center gap-2">
//                         {statusBadge(r.status)}
//                         <Select
//                           value={
//                             ["Draft", "Acknowledged", "Resolved"].includes(
//                               r.status,
//                             )
//                               ? r.status
//                               : "Draft"
//                           }
//                           onValueChange={(v: any) => onUpdateOneStatus(r.id, v)}
//                         >
//                           <SelectTrigger className="h-8 w-40 bg-white">
//                             <SelectValue />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="Draft">Nháp</SelectItem>
//                             <SelectItem value="Acknowledged">Đã xem</SelectItem>
//                             <SelectItem value="Resolved">Đã xử lý</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>
//                     </TableCell>

//                     <TableCell className="text-slate-700">
//                       <div className="text-xs">
//                         {r.send?.status ? `${r.send.status}` : "-"}
//                         {r.send?.channel ? ` • ${r.send.channel}` : ""}
//                       </div>
//                       <div className="text-xs text-slate-500">
//                         {fmtDate(r.send?.sent_at ?? null)}
//                       </div>
//                     </TableCell>

//                     <TableCell className="text-slate-700 text-sm">
//                       {fmtDate(r.created_at ?? null)}
//                     </TableCell>

//                     <TableCell className="text-slate-700">
//                       <div className="text-xs text-slate-500">
//                         * Reload để xem updated_at mới nhất
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 );
//               })}
//           </TableBody>
//         </Table>
//       </div>

//       {/* Pagination */}
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

// src/pages/warnings/components/WarningsTable.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

function fmtDate(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("vi-VN");
}

function statusBadge(s: string) {
  switch (s) {
    case "Draft":
      return <Badge className="bg-slate-100 text-slate-900 border border-slate-200">Nháp</Badge>;
    case "Sent":
      return <Badge className="bg-emerald-50 text-emerald-900 border border-emerald-200">Đã gửi</Badge>;
    case "SendFailed":
      return <Badge className="bg-rose-50 text-rose-900 border border-rose-200">Gửi lỗi</Badge>;
    case "Acknowledged":
      return <Badge className="bg-amber-50 text-amber-900 border border-amber-200">Đã xem</Badge>;
    case "Resolved":
      return <Badge className="bg-indigo-50 text-indigo-900 border border-indigo-200">Đã xử lý</Badge>;
    default:
      return <Badge variant="outline" className="border-slate-300 text-slate-700">{s || "-"}</Badge>;
  }
}

type WarningRow = {
  id: string;
  status: string;
  detected_value: number | null;
  reason_text: string;
  student: { id: string; student_code: string; full_name: string };
  rule: { id: string; rule_code: string; rule_name: string };
  send?: { channel?: string | null; status?: string | null; error?: string | null; sent_at?: string | null };
  created_at?: string;
};

type Props = {
  rows: WarningRow[];
  loading?: boolean;

  page: number;
  limit: number;
  total: number;
  totalPages: number;

  selectedIds: string[];
  onChangeSelectedIds: (ids: string[]) => void;

  onChangePage: (p: number) => void;
  onChangeLimit: (l: number) => void;

  onUpdateOneStatus: (warningId: string, status: "Draft" | "Acknowledged" | "Resolved") => void;

  // NEW
  semesterId?: string;
  returnTo?: string; // đã encodeURIComponent sẵn
};

export default function WarningsTable({
  rows,
  loading,
  page,
  limit,
  total,
  totalPages,
  selectedIds,
  onChangeSelectedIds,
  onChangePage,
  onChangeLimit,
  onUpdateOneStatus,
  semesterId,
  returnTo,
}: Props) {
  const allChecked = rows.length > 0 && rows.every((r) => selectedIds.includes(r.id));

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={(e) => {
                    if (e.target.checked) onChangeSelectedIds(rows.map((r) => r.id));
                    else onChangeSelectedIds([]);
                  }}
                />
              </TableHead>
              <TableHead className="min-w-56">Sinh viên</TableHead>
              <TableHead className="min-w-56">Rule</TableHead>
              <TableHead className="text-right">Detected</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Send</TableHead>
              <TableHead className="min-w-40">Tạo lúc</TableHead>
              <TableHead className="min-w-44">Cập nhật</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={8} className="text-slate-600">Đang tải...</TableCell>
              </TableRow>
            )}

            {!loading &&
              rows.map((r) => {
                const checked = selectedIds.includes(r.id);

                const tone =
                  r.status === "SendFailed" ? "bg-rose-50/30 hover:bg-rose-50/50" :
                  r.status === "Draft" ? "bg-slate-50/40 hover:bg-slate-50/60" :
                  "hover:bg-slate-50/70";

                const studentHref =
                  r.student?.id
                    ? `/students/${encodeURIComponent(r.student.id)}${
                        semesterId ? `?semester_id=${encodeURIComponent(semesterId)}${returnTo ? `&return_to=${returnTo}` : ""}` : ""
                      }`
                    : "#";

                return (
                  <TableRow key={r.id} className={cn(tone)}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) onChangeSelectedIds([...selectedIds, r.id]);
                          else onChangeSelectedIds(selectedIds.filter((x) => x !== r.id));
                        }}
                      />
                    </TableCell>

                    <TableCell className="text-slate-900">
                      {r.student?.id ? (
                        <Link to={studentHref} className="font-medium text-slate-900 hover:underline hover:underline-offset-4">
                          {r.student?.full_name ?? "-"}
                        </Link>
                      ) : (
                        <div className="font-medium">{r.student?.full_name ?? "-"}</div>
                      )}
                      <div className="text-xs text-slate-600">{r.student?.student_code ?? "-"}</div>
                    </TableCell>

                    <TableCell className="text-slate-900">
                      <div className="font-medium">
                        {r.rule?.rule_code ?? "-"} - {r.rule?.rule_name ?? "-"}
                      </div>
                      <div className="text-xs text-slate-600 line-clamp-1">{r.reason_text ?? ""}</div>
                    </TableCell>

                    <TableCell className="text-right tabular-nums">{r.detected_value ?? "-"}</TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        {statusBadge(r.status)}
                        <Select
                          value={["Draft", "Acknowledged", "Resolved"].includes(r.status) ? r.status : "Draft"}
                          onValueChange={(v: any) => onUpdateOneStatus(r.id, v)}
                        >
                          <SelectTrigger className="h-8 w-40 bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Draft">Nháp</SelectItem>
                            <SelectItem value="Acknowledged">Đã xem</SelectItem>
                            <SelectItem value="Resolved">Đã xử lý</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>

                    <TableCell className="text-slate-700">
                      <div className="text-xs">
                        {r.send?.status ? `${r.send.status}` : "-"}
                        {r.send?.channel ? ` • ${r.send.channel}` : ""}
                      </div>
                      <div className="text-xs text-slate-500">{fmtDate(r.send?.sent_at ?? null)}</div>
                    </TableCell>

                    <TableCell className="text-slate-700 text-sm">{fmtDate(r.created_at ?? null)}</TableCell>

                    <TableCell className="text-slate-700">
                      <div className="text-xs text-slate-500">* Reload để xem updated_at mới nhất</div>
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
          <select className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm" value={limit} onChange={(e) => onChangeLimit(Number(e.target.value))}>
            {[10, 20, 50, 100].map((x) => (
              <option key={x} value={x}>{x}/trang</option>
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
