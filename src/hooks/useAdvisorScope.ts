import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchClassesThunk, fetchSemestersThunk, setSelectedClass, setSelectedSemester } from "@/store/slices/advisorSlice";

function pickDefaultClass(classes: any[]) {
  return classes.find((a: any) => a?.class?.id)?.class?.id ?? null;
}
function pickDefaultSemester(semesters: any[]) {
  return semesters.find((s: any) => s?.is_current)?.id ?? semesters?.[0]?.id ?? null;
}

export function useAdvisorScope() {
  const dispatch = useAppDispatch();
  const [sp, setSp] = useSearchParams();

  const classes = useAppSelector((s: any) => s.advisor?.classes ?? []);
  const semesters = useAppSelector((s: any) => s.advisor?.semesters ?? []);
  const reduxClassId = useAppSelector((s: any) => s.advisor?.selectedClassId) as string | null;
  const reduxSemesterId = useAppSelector((s: any) => s.advisor?.selectedSemesterId) as string | null;

  const urlClassId = sp.get("class_id");
  const urlSemesterId = sp.get("semester_id");

  const classId = urlClassId ?? reduxClassId ?? null;
  const semesterId = urlSemesterId ?? reduxSemesterId ?? null;

  useEffect(() => {
    dispatch(fetchClassesThunk(undefined));
    dispatch(fetchSemestersThunk());
  }, [dispatch]);

  // auto defaults + sync URL
  useEffect(() => {
    if (!classes.length || !semesters.length) return;

    const nextClass = classId ?? pickDefaultClass(classes);
    const nextSemester = semesterId ?? pickDefaultSemester(semesters);
    if (!nextClass || !nextSemester) return;

    if (nextClass !== reduxClassId) dispatch(setSelectedClass(nextClass));
    if (nextSemester !== reduxSemesterId) dispatch(setSelectedSemester(nextSemester));

    const next = new URLSearchParams(sp);
    if (!next.get("class_id")) next.set("class_id", nextClass);
    if (!next.get("semester_id")) next.set("semester_id", nextSemester);

    if (next.toString() !== sp.toString()) setSp(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes, semesters]);

  const setClassId = (id: string) => {
    dispatch(setSelectedClass(id));
    const next = new URLSearchParams(sp);
    next.set("class_id", id);
    setSp(next, { replace: true });
  };

  const setSemesterId = (id: string) => {
    dispatch(setSelectedSemester(id));
    const next = new URLSearchParams(sp);
    next.set("semester_id", id);
    setSp(next, { replace: true });
  };

  return {
    classes,
    semesters,
    classId,
    semesterId,
    setClassId,
    setSemesterId,
    ready: Boolean(classId && semesterId),
  };
}
