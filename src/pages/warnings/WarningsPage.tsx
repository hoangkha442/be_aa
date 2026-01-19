import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchClassesThunk,
  fetchSemestersThunk,
  previewWarningsThunk,
  listWarningsThunk,
  generateWarningsThunk,
  sendWarningsThunk,
  clearPreview,
} from "@/store/slices/advisorSlice";

export default function WarningsPage() {
  const dispatch = useAppDispatch();
  const { selectedClassId, selectedSemesterId, preview, warnings, status, error } = useAppSelector((s: any) => s.advisor);

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedWarningIds, setSelectedWarningIds] = useState<string[]>([]);

  useEffect(() => {
    dispatch(fetchClassesThunk());
    dispatch(fetchSemestersThunk());
  }, [dispatch]);

  useEffect(() => {
    if (selectedClassId) {
      dispatch(
        listWarningsThunk({
          class_id: selectedClassId,
          semester_id: selectedSemesterId ?? undefined,
          status: statusFilter || undefined,
          page: 1,
          limit: 20,
        }),
      );
    }
  }, [dispatch, selectedClassId, selectedSemesterId, statusFilter]);

  const onPreview = () => {
    if (!selectedClassId) return;
    dispatch(clearPreview());
    dispatch(previewWarningsThunk({ class_id: selectedClassId, semester_id: selectedSemesterId ?? undefined }));
  };

  const onGenerateDraft = () => {
    if (!selectedClassId) return;
    dispatch(
      generateWarningsThunk({
        class_id: selectedClassId,
        semester_id: selectedSemesterId ?? undefined,
        create_status: "Draft",
      }),
    ).then(() => {
      dispatch(
        listWarningsThunk({
          class_id: selectedClassId,
          semester_id: selectedSemesterId ?? undefined,
          status: statusFilter || undefined,
          page: 1,
          limit: 20,
        }),
      );
    });
  };

  const onGenerateAndSend = () => {
    if (!selectedClassId) return;
    dispatch(
      generateWarningsThunk({
        class_id: selectedClassId,
        semester_id: selectedSemesterId ?? undefined,
        create_status: "Sent",
        send_channel: "in_app",
      }),
    ).then(() => {
      dispatch(
        listWarningsThunk({
          class_id: selectedClassId,
          semester_id: selectedSemesterId ?? undefined,
          status: statusFilter || undefined,
          page: 1,
          limit: 20,
        }),
      );
    });
  };

  const onSendSelected = () => {
    if (!selectedWarningIds.length) return;
    dispatch(sendWarningsThunk({ warning_ids: selectedWarningIds, channel: "in_app" })).then(() => {
      setSelectedWarningIds([]);
      if (selectedClassId) {
        dispatch(
          listWarningsThunk({
            class_id: selectedClassId,
            semester_id: selectedSemesterId ?? undefined,
            status: statusFilter || undefined,
            page: 1,
            limit: 20,
          }),
        );
      }
    });
  };

  const list = (warnings?.data ?? warnings ?? []) as any[];

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Cảnh báo học tập</h2>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <button onClick={onPreview} style={{ padding: 8, cursor: "pointer" }}>
          Preview
        </button>
        <button onClick={onGenerateDraft} style={{ padding: 8, cursor: "pointer" }}>
          Generate Draft
        </button>
        <button onClick={onGenerateAndSend} style={{ padding: 8, cursor: "pointer" }}>
          Generate & Send (in_app)
        </button>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: 8 }}>
          <option value="">Tất cả trạng thái</option>
          <option value="Draft">Draft</option>
          <option value="Sent">Sent</option>
          <option value="SendFailed">SendFailed</option>
          <option value="Resolved">Resolved</option>
          <option value="Acknowledged">Acknowledged</option>
        </select>

        <button onClick={onSendSelected} style={{ padding: 8, cursor: "pointer" }}>
          Send selected
        </button>
      </div>

      {error && <div style={{ color: "crimson" }}>{String(error)}</div>}
      {status === "loading" && <div>Loading...</div>}

      {preview && (
        <div style={{ border: "1px solid #ddd", padding: 12, marginBottom: 12 }}>
          <div style={{ fontWeight: 700 }}>Preview result</div>
          <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{JSON.stringify(preview, null, 2)}</pre>
        </div>
      )}

      <div style={{ border: "1px solid #ddd" }}>
        <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 120px 140px", padding: 10, fontWeight: 700, borderBottom: "1px solid #ddd" }}>
          <div></div>
          <div>Sinh viên / Lý do</div>
          <div>Trạng thái</div>
          <div>Gửi</div>
        </div>

        {list.map((w: any) => {
          const id = w.id ?? w.warning_id;
          const checked = selectedWarningIds.includes(id);

          return (
            <div key={id} style={{ display: "grid", gridTemplateColumns: "40px 1fr 120px 140px", padding: 10, borderBottom: "1px solid #eee" }}>
              <div>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedWarningIds((prev) => [...prev, id]);
                    else setSelectedWarningIds((prev) => prev.filter((x) => x !== id));
                  }}
                />
              </div>

              <div>
                <div style={{ fontWeight: 700 }}>
                  {w.student?.student_code ?? "-"} — {w.student?.full_name ?? "-"}
                </div>
                <div style={{ opacity: 0.85 }}>{w.reason_text ?? "-"}</div>
              </div>

              <div>{w.status ?? "-"}</div>

              <div style={{ opacity: 0.85 }}>
                {w.send?.status ?? w.send_status ?? "-"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
