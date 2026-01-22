import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export function useQueryParamString(key: string, fallback = "") {
  const [sp, setSp] = useSearchParams();
  const value = sp.get(key) ?? fallback;

  const setValue = (next: string, opts?: { replace?: boolean }) => {
    const n = new URLSearchParams(sp);
    if (!next) n.delete(key);
    else n.set(key, next);
    setSp(n, { replace: opts?.replace ?? true });
  };

  return [value, setValue] as const;
}

export function useQueryParamNumber(key: string, fallback: number) {
  const [sp, setSp] = useSearchParams();
  const value = useMemo(() => {
    const raw = sp.get(key);
    const n = raw === null ? NaN : Number(raw);
    return Number.isFinite(n) ? n : fallback;
  }, [sp, key, fallback]);

  const setValue = (next: number, opts?: { replace?: boolean }) => {
    const n = new URLSearchParams(sp);
    if (!Number.isFinite(next) || next === fallback) n.delete(key);
    else n.set(key, String(next));
    setSp(n, { replace: opts?.replace ?? true });
  };

  return [value, setValue] as const;
}
