export function safeNumber(n: any, fallback = 0) {
  const num = typeof n === "number" ? n : Number(n);
  return Number.isFinite(num) ? num : fallback;
}

export function fmtNumber(n: any, digits = 2) {
  const num = safeNumber(n, NaN);
  if (!Number.isFinite(num)) return "-";
  return num.toFixed(digits);
}

export function parseMaybeNumber(s: string): number | null {
  const t = (s ?? "").trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}
