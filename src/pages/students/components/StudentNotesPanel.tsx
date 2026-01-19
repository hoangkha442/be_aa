import { useState } from "react";
import { advisorService } from "@/services/advisor.service";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function fmtDate(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("vi-VN");
}

export default function StudentNotesPanel({
  studentId,
  notes,
  loading,
  onCreated,
}: {
  studentId: string;
  notes: any[];
  loading?: boolean;
  onCreated: () => void;
}) {
  const [openForm, setOpenForm] = useState(false);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const create = async () => {
    if (!content.trim()) {
      setErr("Nội dung không được rỗng");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      await advisorService.createNote({
        student_id: studentId,
        content: content.trim(),
        handling_status: "not_contacted",
      });
      setContent("");
      setOpenForm(false);
      onCreated();
    } catch (e: any) {
      setErr(String(e?.message ?? "Create note failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-slate-200/70">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base text-slate-900">Ghi chú tư vấn</CardTitle>
          <Button
            size="sm"
            className="bg-slate-900 text-slate-50 hover:bg-slate-800"
            disabled={loading}
            onClick={() => setOpenForm((v) => !v)}
          >
            {openForm ? "Đóng" : "Tạo note"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {openForm && (
          <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
            <div className="text-xs font-medium text-slate-600">Nội dung</div>
            <textarea
              className="w-full min-h-22.5 rounded-md border border-slate-200 bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ghi chú về tư vấn/trao đổi..."
            />
            {err && <div className="text-xs text-rose-700">{err}</div>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" className="border-slate-300" onClick={() => setOpenForm(false)} disabled={saving}>
                Huỷ
              </Button>
              <Button className="bg-slate-900 text-slate-50 hover:bg-slate-800" onClick={create} disabled={saving}>
                Lưu
              </Button>
            </div>
          </div>
        )}

        {notes?.length ? (
          <div className="space-y-2">
            {notes.map((n: any) => (
              <div key={n.id} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm font-medium text-slate-900 line-clamp-2">
                    {n.content}
                  </div>
                  <Badge variant="outline" className="border-slate-300 text-slate-700">
                    {fmtDate(n.counseling_date ?? n.created_at)}
                  </Badge>
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  Trạng thái: {n.handling_status ?? "-"}
                  {n.warning_id ? ` • Warning: ${n.warning_id}` : ""}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-600">
            Chưa có ghi chú.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
