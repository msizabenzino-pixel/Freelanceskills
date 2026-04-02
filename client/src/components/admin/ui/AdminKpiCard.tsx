import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

interface AdminKpiCardProps {
  title: string;
  value: string | number;
  note?: string;
  accent?: "primary" | "success" | "warning" | "danger";
}

export function AdminKpiCard({ title, value, note, accent = "primary" }: AdminKpiCardProps) {
  const tone = {
    primary: "text-primary",
    success: "text-emerald-600",
    warning: "text-amber-600",
    danger: "text-red-600",
  }[accent];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-3">
          <p className={`text-2xl font-bold ${tone}`}>{value}</p>
          <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
        </div>
        {note && <p className="text-xs text-muted-foreground mt-2">{note}</p>}
      </CardContent>
    </Card>
  );
}
