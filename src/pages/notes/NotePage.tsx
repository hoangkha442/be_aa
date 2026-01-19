import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchClassesThunk, fetchSemestersThunk, fetchDashboardThunk, listNotesThunk, createNoteThunk } from "@/store/slices/advisorSlice";

export default function NotesPage() {
  const dispatch = useAppDispatch();
  const { selectedClassId, selectedSemesterId, dashboard, notes, status, error } = useAppSelector((s: any) => s.advisor);

  const [studentId, setStudentId] = useState<string>("");
  const [content, setContent] = useState("");

  useEffect(() => {
    dispatch(fetchClassesThunk());
    dispatch(fetchSemestersThunk());
  }, [dispatch]);

  useEffect(() => {
    if (selectedClassId) {
      dispatch(fetchDashboardThunk({ class_id: selectedClassId, semester_id: selectedSemesterId ?? undefined, page: 1, limit: 50 }));
    }
  }, [dispatch, selectedClassId, selectedSemesterId]);

  const rows = (dashboard?.students?.data ?? dashboard?.students ?? []) as any[];

  const loadNotes = () => {
    if (!studentId) return;
    dispatch(listNotesThunk(studentId));
  };

  const createNote = async () => {
    if (!studentId) return alert("Chọn sinh viên");
    if (!content.trim()) return alert("Nhập nội dung");
    await dispatch(createNoteThunk({ student_id: studentId, content }));
    setContent("");
    dispatch(listNotesThunk(studentId));
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Ghi chú cố vấn</h2>

      {error && <div style={{ color: "crimson" }}>{String(error)}</div>}
      {status === "loading" && <div>Loading...</div>}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <select value={studentId} onChange={(e) => setStudentId(e.target.value)} style={{ padding: 8, minWidth: 320 }}>
          <option value="">Chọn sinh viên</option>
          {rows.map((r: any) => (
            <option key={r.student?.id} value={r.student?.id}>
              {r.student?.student_code} - {r.student?.full_name}
            </option>
          ))}
        </select>

        <button onClick={loadNotes} style={{ padding: 8, cursor: "pointer" }}>
          Tải ghi chú
        </button>
      </div>

      <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Nội dung ghi chú..."
          style={{ padding: 10, minHeight: 110 }}
        />
        <button onClick={createNote} style={{ padding: 10, cursor: "pointer" }}>
          Tạo ghi chú
        </button>
      </div>

      <div style={{ border: "1px solid #ddd", padding: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Danh sách ghi chú</div>
        <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{JSON.stringify(notes, null, 2)}</pre>
      </div>
    </div>
  );
}
