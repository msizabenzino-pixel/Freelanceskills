import { Button } from "@/components/ui/button";
import { Inbox } from "lucide-react";

export function AdminEmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-xl border border-dashed p-10 text-center bg-card">
      <Inbox className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
