import * as XLSX from "xlsx";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatFileTime(d = new Date()) {
  return (
    d.getFullYear() +
    pad2(d.getMonth() + 1) +
    pad2(d.getDate()) +
    "_" +
    pad2(d.getHours()) +
    pad2(d.getMinutes())
  );
}

function sanitizeFileName(s: string) {
  return (s ?? "")
    .replace(/[\/\\:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

type ExportReportInput = {
  classLabel: string;
  semesterLabel: string;
  summary: {
    students_total?: number;
    avg_gpa_semester?: number;
    warnings_total?: number;
    warnings_by_status?: Record<string, number>;
  };
};

export function exportAdvisorReportExcel(input: ExportReportInput) {
  const wb = XLSX.utils.book_new();

  const generatedAt = new Date();
  const filename = sanitizeFileName(
    `BaoCao_CanhBao_${input.classLabel}_${input.semesterLabel}_${formatFileTime(generatedAt)}.xlsx`
  );

  // ===== Sheet 1: Summary (AOA) =====
  const s = input.summary ?? {};
  const byStatus = s.warnings_by_status ?? {};

  const aoa: any[][] = [
    ["BÁO CÁO CẢNH BÁO SỚM"],
    [],
    ["Lớp", input.classLabel],
    ["Học kỳ", input.semesterLabel],
    ["Thời điểm xuất", generatedAt.toLocaleString("vi-VN")],
    [],
    ["CHỈ SỐ", "GIÁ TRỊ"],
    ["SV bị cảnh báo", s.students_total ?? 0],
    ["GPA TB (warned)", Number.isFinite(Number(s.avg_gpa_semester)) ? Number(s.avg_gpa_semester).toFixed(2) : "-"],
    ["Tổng cảnh báo", s.warnings_total ?? 0],
    ["Đã gửi (Sent)", byStatus["Sent"] ?? 0],
    ["Đã xem (Acknowledged)", byStatus["Acknowledged"] ?? 0],
    ["Đã xử lý (Resolved)", byStatus["Resolved"] ?? 0],
    ["Gửi lỗi (SendFailed)", byStatus["SendFailed"] ?? 0],
    ["Nháp (Draft)", byStatus["Draft"] ?? 0],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(aoa);
  wsSummary["!cols"] = [{ wch: 26 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

  // ===== Sheet 2: Warnings by Status (JSON) =====
  const rows = Object.entries(byStatus)
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0));

  const wsStatus = XLSX.utils.json_to_sheet(rows, { header: ["status", "count"] });
  wsStatus["!cols"] = [{ wch: 22 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, wsStatus, "WarningsByStatus");

  XLSX.writeFile(wb, filename);
}
