import { Badge } from "@/components/ui/badge";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  open: "bg-sky-100 text-sky-700 border-sky-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  flagged: "bg-red-100 text-red-700 border-red-200",
  suspended: "bg-red-100 text-red-700 border-red-200",
  failed: "bg-red-100 text-red-700 border-red-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
  in_review: "bg-violet-100 text-violet-700 border-violet-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-slate-100 text-slate-700 border-slate-200",
  enabled: "bg-emerald-100 text-emerald-700 border-emerald-200",
  disabled: "bg-slate-100 text-slate-700 border-slate-200",
};

export function AdminStatusBadge({ status }: { status?: string }) {
  const value = (status || "unknown").toLowerCase();
  const cls = STATUS_STYLES[value] || "bg-slate-100 text-slate-700 border-slate-200";
  return <Badge className={`capitalize border ${cls}`}>{value.replaceAll("_", " ")}</Badge>;
}
