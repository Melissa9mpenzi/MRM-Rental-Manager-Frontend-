/** Pie chart slices for Verification Overview — from API only. */

export function resolveVerificationBreakdown(apiRows) {
  const rows = Array.isArray(apiRows) ? apiRows : [];
  return rows
    .map((r) => ({
      name: String(r.name || "").trim(),
      value: Math.max(0, Number(r.value) || 0),
      color: r.color || "#64748b",
    }))
    .filter((x) => x.name && x.value > 0);
}
