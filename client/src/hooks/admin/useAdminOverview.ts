import { useQuery } from "@tanstack/react-query";
import { fetchAdminOverview } from "@/lib/admin/service";

export function useAdminOverview() {
  return useQuery({
    queryKey: ["admin", "overview"],
    queryFn: fetchAdminOverview,
    staleTime: 60_000,
  });
}
