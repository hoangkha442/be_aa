import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchClassesThunk, setSelectedClass } from "@/store/slices/advisorSlice";

export default function ClassesPage() {
  const dispatch = useAppDispatch();
  const { classes, selectedClassId, status, error } = useAppSelector((s: any) => s.advisor);

  useEffect(() => {
    dispatch(fetchClassesThunk());
  }, [dispatch]);

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Lớp được phân công</h2>

      {error && <div style={{ color: "crimson" }}>{String(error)}</div>}
      {status === "loading" && <div>Loading...</div>}

      <div style={{ display: "grid", gap: 10 }}>
        {classes.map((a: any) => (
          <div
            key={a.assignment_id}
            style={{
              border: "1px solid #ddd",
              padding: 12,
              background: a.class?.id === selectedClassId ? "#f5f7ff" : "white",
              cursor: "pointer",
            }}
            onClick={() => dispatch(setSelectedClass(a.class?.id ?? null))}
          >
            <div style={{ fontWeight: 700 }}>
              {a.class?.class_code} — {a.class?.class_name}
            </div>
            <div style={{ opacity: 0.8 }}>
              Ngành: {a.class?.major_name} | Khóa: {a.class?.cohort_year} | Trạng thái: {a.class?.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
