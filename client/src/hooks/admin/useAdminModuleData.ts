import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminModuleList } from "@/lib/admin/service";
import type { AdminModuleKey, AdminQueryInput } from "@/types/admin";

export function useAdminModuleData(module: AdminModuleKey, filters: AdminQueryInput) {
  const query = useQuery({
    queryKey: ["admin", "module", module, filters],
    queryFn: () => fetchAdminModuleList(module, filters),
  });

  return useMemo(
    () => ({
      ...query,
      items: query.data?.items || [],
      total: query.data?.total || 0,
      source: query.data?.source || "fallback",
      lastUpdated: query.data?.lastUpdated,
    }),
    [query]
  );
}
