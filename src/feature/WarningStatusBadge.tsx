import { Badge } from "@/components/ui/badge";

export default function WarningStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "Draft":
      return <Badge variant="outline" className="border-slate-300 text-slate-700">Draft</Badge>;
    case "Sent":
      return <Badge className="bg-sky-50 text-sky-900 border border-sky-200">Sent</Badge>;
    case "SendFailed":
      return <Badge className="bg-rose-50 text-rose-900 border border-rose-200">SendFailed</Badge>;
    case "Acknowledged":
      return <Badge className="bg-amber-50 text-amber-900 border border-amber-200">Acknowledged</Badge>;
    case "Resolved":
      return <Badge className="bg-emerald-50 text-emerald-900 border border-emerald-200">Resolved</Badge>;
    default:
      return <Badge variant="outline" className="border-slate-300 text-slate-700">{status || "-"}</Badge>;
  }
}
