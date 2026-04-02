import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Clock3, Info, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/admin/useAdminAuth";
import { useAdminModuleData } from "@/hooks/admin/useAdminModuleData";
import { ADMIN_MODULES, hasPermission } from "@/lib/admin/permissions";
import { applyAdminAction, availableStatusesForModule } from "@/lib/admin/service";
import { AdminDataTable } from "@/components/admin/ui/AdminDataTable";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import type { AdminEntityRow, AdminModuleKey } from "@/types/admin";
import { ADMIN_MODULE_COLUMNS } from "./moduleConfig";

export function AdminModulePage({ module }: { module: AdminModuleKey }) {
  const moduleMeta = useMemo(() => ADMIN_MODULES.find((m) => m.key === module), [module]);
  const { identity, permissions } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeRow, setActiveRow] = useState<AdminEntityRow | null>(null);

  const dataQuery = useAdminModuleData(module, {
    search,
    status: status === "all" ? "" : status,
    page: 1,
    pageSize: 30,
    sortBy: "createdAt",
    sortDirection: "desc",
  });

  const canManage = moduleMeta?.managePermission
    ? hasPermission(permissions, moduleMeta.managePermission)
    : false;

  const actionMutation = useMutation({
    mutationFn: async ({ row, action }: { row: AdminEntityRow; action: string }) => {
      if (!identity?.uid) throw new Error("Missing admin identity.");
      return applyAdminAction({ module, rowId: row.id, action, actorId: identity.uid });
    },
    onSuccess: (_result, variables) => {
      toast({ title: "Action completed", description: `${variables.action} applied to ${variables.row.title || variables.row.id}.` });
      queryClient.invalidateQueries({ queryKey: ["admin", "module", module] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
    onError: (error: Error) => {
      toast({ title: "Action failed", description: error.message, variant: "destructive" });
    },
  });

  const columns = ADMIN_MODULE_COLUMNS[module];

  if (!moduleMeta) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-destructive">Unknown admin module: {module}</CardContent>
      </Card>
    );
  }

  const statusOptions = availableStatusesForModule(module);

  const handleToggleAll = () => {
    if (selectedIds.size === dataQuery.items.length) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(dataQuery.items.map((item) => item.id)));
  };

  const handleToggleRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectedRows = dataQuery.items.filter((row) => selectedIds.has(row.id));

  return (
    <div className="space-y-5">
      <section className="grid xl:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{moduleMeta.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{moduleMeta.description}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid sm:grid-cols-4 gap-3 text-sm">
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-muted-foreground">Total</p>
                  <p className="text-xl font-semibold">{dataQuery.total}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-muted-foreground">Visible Rows</p>
                  <p className="text-xl font-semibold">{dataQuery.items.length}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-muted-foreground">Selected</p>
                  <p className="text-xl font-semibold">{selectedIds.size}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-muted-foreground">Data Source</p>
                  <p className="text-xl font-semibold capitalize">{dataQuery.source}</p>
                </div>
              </div>

              {selectedRows.length > 0 && (
                <div className="rounded-lg border p-3 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">Bulk actions:</span>
                  <Button size="sm" variant="outline" disabled={!canManage || actionMutation.isPending} onClick={() => selectedRows.forEach((row) => actionMutation.mutate({ row, action: "approve" }))}>Approve</Button>
                  <Button size="sm" variant="outline" disabled={!canManage || actionMutation.isPending} onClick={() => selectedRows.forEach((row) => actionMutation.mutate({ row, action: "flag" }))}>Flag</Button>
                  <Button size="sm" variant="outline" disabled={!canManage || actionMutation.isPending} onClick={() => selectedRows.forEach((row) => actionMutation.mutate({ row, action: "suspend" }))}>Suspend</Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>Clear Selection</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {dataQuery.isError ? (
            <Card>
              <CardContent className="py-10 text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-destructive mx-auto" />
                <p className="font-semibold text-destructive">Failed to load module data</p>
                <Button variant="outline" onClick={() => dataQuery.refetch()}>Retry</Button>
              </CardContent>
            </Card>
          ) : (
            <AdminDataTable
              title={`${moduleMeta.title} Records`}
              description="Search, filter, inspect, and apply admin actions"
              rows={dataQuery.items}
              columns={columns}
              search={search}
              onSearchChange={setSearch}
              status={status}
              statuses={statusOptions}
              onStatusChange={setStatus}
              selectedIds={selectedIds}
              onToggleAll={handleToggleAll}
              onToggleRow={handleToggleRow}
              onAction={(row, action) => {
                if (!canManage) {
                  toast({ title: "Permission required", description: "Your role cannot apply this action.", variant: "destructive" });
                  return;
                }
                setActiveRow(row);
                actionMutation.mutate({ row, action });
              }}
              isLoading={dataQuery.isLoading}
              onRefresh={() => dataQuery.refetch()}
            />
          )}

          {!dataQuery.isLoading && dataQuery.items.length === 0 && (
            <AdminEmptyState
              title={`No ${moduleMeta.title.toLowerCase()} records`}
              description="There are no records matching the selected filters."
              actionLabel="Reset Filters"
              onAction={() => {
                setSearch("");
                setStatus("all");
              }}
            />
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Module Operations</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p className="text-muted-foreground">Operational checklist</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Search + filter pipeline active</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Bulk action architecture enabled</div>
                <div className="flex items-center gap-2"><Info className="w-4 h-4 text-primary" /> Hybrid data source: {dataQuery.source}</div>
                <div className="flex items-center gap-2"><Clock3 className="w-4 h-4 text-muted-foreground" /> Last update: {dataQuery.lastUpdated?.toLocaleTimeString() || "-"}</div>
              </div>
              {!canManage && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-800 flex gap-2">
                  <ShieldAlert className="w-4 h-4 mt-0.5" />
                  <span>Your role is read-only for this module.</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Detail Panel</CardTitle>
            </CardHeader>
            <CardContent>
              {activeRow ? (
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">{activeRow.title || activeRow.id}</p>
                  <p className="text-muted-foreground">{activeRow.subtitle || "No summary available"}</p>
                  <Separator />
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Status</span>
                    <span><AdminStatusBadge status={String(activeRow.status || "unknown")} /></span>
                    <span className="text-muted-foreground">Location</span>
                    <span>{String(activeRow.location || "-")}</span>
                    <span className="text-muted-foreground">Amount</span>
                    <span>{activeRow.amount ? `R${Number(activeRow.amount).toLocaleString()}` : "-"}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Select or action a row to inspect details.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {actionMutation.isPending && (
        <div className="fixed bottom-4 right-4 rounded-lg border bg-card px-4 py-2 shadow-lg flex items-center gap-2 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Applying admin action...
        </div>
      )}
    </div>
  );
}
