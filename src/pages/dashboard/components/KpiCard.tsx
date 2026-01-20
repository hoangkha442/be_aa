import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Tone = "sky" | "indigo" | "amber" | "emerald" | "rose";

const tone = {
  sky: { ring: "border-sky-200/60", iconBg: "bg-sky-50 text-sky-700", bar: "bg-sky-500/70" },
  indigo: { ring: "border-indigo-200/60", iconBg: "bg-indigo-50 text-indigo-700", bar: "bg-indigo-500/70" },
  amber: { ring: "border-amber-200/70", iconBg: "bg-amber-50 text-amber-800", bar: "bg-amber-500/70" },
  emerald: { ring: "border-emerald-200/70", iconBg: "bg-emerald-50 text-emerald-800", bar: "bg-emerald-500/70" },
  rose: { ring: "border-rose-200/70", iconBg: "bg-rose-50 text-rose-800", bar: "bg-rose-500/70" },
} as const;

export default function KpiCard({
  label,
  value,
  icon: Icon,
  tone: t,
}: {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  tone: Tone;
}) {
  const s = tone[t];
  return (
    <Card className={cn("relative overflow-hidden border", s.ring)}>
      <div className={cn("absolute left-0 top-0 h-full w-1.5", s.bar)} />
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-slate-600">{label}</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
          </div>
          <div className={cn("rounded-xl border p-2", s.iconBg)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
