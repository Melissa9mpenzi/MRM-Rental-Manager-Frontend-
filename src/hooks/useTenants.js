import { useQuery } from "@tanstack/react-query";
import { tenantsApi } from "../api/tenantsApi";

/**
 * Landlord tenant list from the API. Uses the same query-key shape as {@link TenantsPage}
 * when `unitId` is omitted so cache invalidation stays consistent.
 *
 * @param {{ search?: string, status?: string, unitId?: number }} [params]
 */
export function useTenants(params = {}) {
  const { search = "", status = "all", unitId } = params;
  const queryKey =
    unitId != null
      ? ["tenants", search, status || "all", unitId]
      : ["tenants", search, status || "all"];

  return useQuery({
    queryKey,
    queryFn: () =>
      tenantsApi.list({
        ...(status && status !== "all" ? { status } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(unitId != null ? { unit_id: unitId } : {}),
      }),
  });
}
