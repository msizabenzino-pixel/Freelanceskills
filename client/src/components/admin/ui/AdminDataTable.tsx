import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, SlidersHorizontal, MoreHorizontal, RefreshCcw } from "lucide-react";
import type { AdminEntityRow } from "@/types/admin";
import { AdminStatusBadge } from "./AdminStatusBadge";

export interface AdminColumn {
  key: string;
  label: string;
  type?: "text" | "status" | "currency" | "date" | "number";
}

export function AdminDataTable({
  title,
  description,
  rows,
  columns,
  search,
  onSearchChange,
  status,
  statuses,
  onStatusChange,
  selectedIds,
  onToggleRow,
  onToggleAll,
  onAction,
  isLoading,
  onRefresh,
}: {
  title: string;
  description: string;
  rows: AdminEntityRow[];
  columns: AdminColumn[];
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  statuses: string[];
  onStatusChange: (value: string) => void;
  selectedIds: Set<string>;
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
  onAction: (row: AdminEntityRow, action: string) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}) {
  const allSelected = useMemo(() => rows.length > 0 && rows.every((row) => selectedIds.has(row.id)), [rows, selectedIds]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const formatCell = (row: AdminEntityRow, column: AdminColumn) => {
    const value = row[column.key];
    if (column.type === "status") return <AdminStatusBadge status={String(value || row.status || "unknown")} />;
    if (column.type === "currency") return `R${Number(value || 0).toLocaleString()}`;
    if (column.type === "date") {
      const d = value instanceof Date ? value : row.createdAt;
      return d ? d.toLocaleDateString() : "-";
    }
    if (column.type === "number") return Number(value || 0).toLocaleString();
    return String(value ?? "-");
  };

  return (
    <div className="rounded-xl border bg-card">
      <div className="p-4 md:p-5 border-b space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
        <div className="grid sm:grid-cols-[1fr_180px] gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input value={search} onChange={(e) => onSearchChange(e.target.value)} className="pl-9" placeholder="Search records" />
          </div>
          <div className="flex gap-2">
            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s.replaceAll("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowAdvancedFilters((v) => !v)}
              aria-label="Toggle advanced filters"
              title="Advanced filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="rounded-lg border bg-muted/20 p-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground mr-1">Quick filters:</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange("pending")}
            >
              Pending
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange("flagged")}
            >
              Flagged
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange("active")}
            >
              Active
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                onSearchChange("");
                onStatusChange("all");
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"><Checkbox checked={allSelected} onCheckedChange={onToggleAll} /></TableHead>
              {columns.map((column) => <TableHead key={column.key}>{column.label}</TableHead>)}
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={columns.length + 2} className="h-12 animate-pulse bg-muted/20" />
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 2} className="text-center py-10 text-muted-foreground">
                  No records found for current filters.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Checkbox checked={selectedIds.has(row.id)} onCheckedChange={() => onToggleRow(row.id)} />
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell key={`${row.id}-${column.key}`} className="align-middle">
                      {formatCell(row, column)}
                    </TableCell>
                  ))}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onAction(row, "approve")}>Approve</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAction(row, "flag")}>Flag</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAction(row, "suspend")}>Suspend</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAction(row, "resolve")}>Resolve</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
