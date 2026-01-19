import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RefreshCcw, Eye, Wand2, Send, CheckCheck } from "lucide-react";

const DEFAULT_CLASS = "__no_class__";
const DEFAULT_SEMESTER = "__default_semester__";

export type WarningStatusFilter =
    | "all"
    | "Draft"
    | "Sent"
    | "SendFailed"
    | "Acknowledged"
    | "Resolved";

type Props = {
    classes: any[];
    semesters: any[];
    selectedClassId: string | null;
    selectedSemesterId: string | null;

    statusFilter: WarningStatusFilter;
    loading?: boolean;
    selectedCount: number;

    onChangeClass: (classId: string) => void;
    onChangeSemester: (semesterId: string | null) => void;
    onChangeStatusFilter: (s: WarningStatusFilter) => void;

    onReload: () => void;
    onPreview: () => void;
    onGenerateDraft: () => void;
    onGenerateAndSend: () => void;
    onSendSelected: () => void;

    onBulkAcknowledge: () => void;
    onBulkResolve: () => void;
};

export default function WarningsToolbar({
    classes,
    semesters,
    selectedClassId,
    selectedSemesterId,
    statusFilter,
    loading,
    selectedCount,
    onChangeClass,
    onChangeSemester,
    onChangeStatusFilter,
    onReload,
    onPreview,
    onGenerateDraft,
    onGenerateAndSend,
    onSendSelected,
    onBulkAcknowledge,
    onBulkResolve,
}: Props) {
    const canAction = Boolean(selectedClassId) && !loading;

    return (
        <Card className="border-slate-200/70">
            <CardHeader className="pb-3">
                <CardTitle className="text-base text-slate-900">Bộ lọc & thao tác</CardTitle>
                <CardDescription className="text-slate-600">
                    Chọn lớp (bắt buộc) → Preview → Generate → Send / cập nhật trạng thái.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
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

                    {/* Status filter */}
                    <div className="space-y-1">
                        <div className="text-xs font-medium text-slate-600">Trạng thái</div>
                        <Select
                            value={statusFilter}
                            onValueChange={(v: any) => onChangeStatusFilter(v)}
                        >
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Tất cả" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="Draft">Nháp</SelectItem>
                                <SelectItem value="Sent">Đã gửi</SelectItem>
                                <SelectItem value="SendFailed">Gửi lỗi</SelectItem>
                                <SelectItem value="Acknowledged">Đã xem</SelectItem>
                                <SelectItem value="Resolved">Đã xử lý</SelectItem>
                            </SelectContent>

                        </Select>
                    </div>

                    {/* Reload */}
                    <div className="flex items-end">
                        <Button
                            className="w-full gap-2 bg-slate-900 text-slate-50 hover:bg-slate-800"
                            disabled={!canAction}
                            onClick={onReload}
                        >
                            <RefreshCcw className="h-4 w-4" />
                            Reload
                        </Button>
                    </div>
                </div>

                {/* Actions row */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="border-slate-300 gap-2" disabled={!canAction} onClick={onPreview}>
                            <Eye className="h-4 w-4" />
                            Preview
                        </Button>

                        <Button variant="outline" className="border-slate-300 gap-2" disabled={!canAction} onClick={onGenerateDraft}>
                            <Wand2 className="h-4 w-4" />
                            Generate Draft
                        </Button>

                        <Button className="gap-2 bg-slate-900 text-slate-50 hover:bg-slate-800" disabled={!canAction} onClick={onGenerateAndSend}>
                            <Send className="h-4 w-4" />
                            Generate + Send
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-slate-300 text-slate-700">
                            Đã chọn: {selectedCount}
                        </Badge>

                        <Button
                            variant="outline"
                            className="border-slate-300 gap-2"
                            disabled={!canAction || selectedCount === 0}
                            onClick={onSendSelected}
                        >
                            <Send className="h-4 w-4" />
                            Send selected
                        </Button>

                        <Button
                            variant="outline"
                            className="border-slate-300 gap-2"
                            disabled={!canAction || selectedCount === 0}
                            onClick={onBulkAcknowledge}
                        >
                            <CheckCheck className="h-4 w-4" />
                            Bulk Acknowledge
                        </Button>

                        <Button
                            variant="outline"
                            className="border-slate-300 gap-2"
                            disabled={!canAction || selectedCount === 0}
                            onClick={onBulkResolve}
                        >
                            <CheckCheck className="h-4 w-4" />
                            Bulk Resolve
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
