import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, X } from "lucide-react";

export type StudentFilterState = {
  q: string;
  academicStatus: "all" | "studying" | "leave" | "dropout" | "graduated"; // ✅ match backend
  dataStatus: "all" | "ok" | "missing" | "error";
  warningMode: "all" | "none" | "has" | "gte2";
  gpaMin: string;
  gpaMax: string;
  failedCoursesMin: string;
  sort: "name_asc" | "gpa_desc" | "gpa_asc" | "warnings_desc" | "warnings_asc";
};

type Props = {
  value: StudentFilterState;
  onChange: (next: StudentFilterState) => void;
  shownCount: number;
  totalCount: number;
};

export const DEFAULT_FILTERS: StudentFilterState = {
  q: "",
  academicStatus: "all",
  dataStatus: "all",
  warningMode: "all",
  gpaMin: "",
  gpaMax: "",
  failedCoursesMin: "",
  sort: "name_asc",
};

function setField<T extends keyof StudentFilterState>(state: StudentFilterState, key: T, value: StudentFilterState[T]) {
  return { ...state, [key]: value };
}

export default function StudentFilters({ value, onChange, shownCount, totalCount }: Props) {
  const hasActive =
    value.q.trim() ||
    value.academicStatus !== "all" ||
    value.dataStatus !== "all" ||
    value.warningMode !== "all" ||
    value.gpaMin.trim() ||
    value.gpaMax.trim() ||
    value.failedCoursesMin.trim() ||
    value.sort !== "name_asc";

  return (
    <Card className="border-slate-200/70">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2 text-slate-900">
            <Filter className="h-4 w-4 text-slate-700" />
            Bộ lọc danh sách sinh viên
          </CardTitle>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-slate-300 text-slate-700">
              Hiển thị {shownCount}/{totalCount}
            </Badge>
            <Button
              type="button"
              variant="outline"
              className="border-slate-300"
              size="sm"
              onClick={() => onChange(DEFAULT_FILTERS)}
              disabled={!hasActive}
            >
              <X className="h-4 w-4 mr-1" />
              Xoá lọc
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-6">
        <div className="md:col-span-2 space-y-1">
          <div className="text-xs font-medium text-slate-600">Tìm kiếm</div>
          <Input
            value={value.q}
            onChange={(e) => onChange(setField(value, "q", e.target.value))}
            placeholder="Tên hoặc MSSV..."
            className="bg-white"
          />
        </div>

        <div className="space-y-1">
          <div className="text-xs font-medium text-slate-600">Học vụ</div>
          <Select value={value.academicStatus} onValueChange={(v: any) => onChange(setField(value, "academicStatus", v))}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="studying">Đang học</SelectItem>
              <SelectItem value="leave">Tạm nghỉ</SelectItem>
              <SelectItem value="dropout">Thôi học</SelectItem>
              <SelectItem value="graduated">Tốt nghiệp</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <div className="text-xs font-medium text-slate-600">Data</div>
          <Select value={value.dataStatus} onValueChange={(v: any) => onChange(setField(value, "dataStatus", v))}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="ok">OK</SelectItem>
              <SelectItem value="missing">Thiếu dữ liệu</SelectItem>
              <SelectItem value="error">Lỗi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <div className="text-xs font-medium text-slate-600">Cảnh báo</div>
          <Select value={value.warningMode} onValueChange={(v: any) => onChange(setField(value, "warningMode", v))}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="none">0 cảnh báo</SelectItem>
              <SelectItem value="has">Có cảnh báo (≥1)</SelectItem>
              <SelectItem value="gte2">≥2 cảnh báo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <div className="text-xs font-medium text-slate-600">Sắp xếp</div>
          <Select value={value.sort} onValueChange={(v: any) => onChange(setField(value, "sort", v))}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Tên A→Z" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name_asc">Tên A → Z</SelectItem>
              <SelectItem value="gpa_desc">GPA HK giảm dần</SelectItem>
              <SelectItem value="gpa_asc">GPA HK tăng dần</SelectItem>
              <SelectItem value="warnings_desc">Cảnh báo giảm dần</SelectItem>
              <SelectItem value="warnings_asc">Cảnh báo tăng dần</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <div className="text-xs font-medium text-slate-600">GPA HK min</div>
          <Input
            value={value.gpaMin}
            onChange={(e) => onChange(setField(value, "gpaMin", e.target.value))}
            placeholder="vd: 1.5"
            inputMode="decimal"
            className="bg-white"
          />
        </div>

        <div className="space-y-1">
          <div className="text-xs font-medium text-slate-600">GPA HK max</div>
          <Input
            value={value.gpaMax}
            onChange={(e) => onChange(setField(value, "gpaMax", e.target.value))}
            placeholder="vd: 3.2"
            inputMode="decimal"
            className="bg-white"
          />
        </div>

        <div className="space-y-1">
          <div className="text-xs font-medium text-slate-600">Môn rớt ≥</div>
          <Input
            value={value.failedCoursesMin}
            onChange={(e) => onChange(setField(value, "failedCoursesMin", e.target.value))}
            placeholder="vd: 1"
            inputMode="numeric"
            className="bg-white"
          />
        </div>
      </CardContent>
    </Card>
  );
}
