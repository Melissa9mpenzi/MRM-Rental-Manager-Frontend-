export const LEAD_STAGES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "viewing", label: "Viewing" },
  { value: "negotiating", label: "Negotiating" },
  { value: "closed", label: "Closed" },
  { value: "lost", label: "Lost" },
];

export const CLIENT_TYPES = [
  { value: "renter", label: "Renter" },
  { value: "buyer", label: "Buyer" },
  { value: "landlord", label: "Landlord" },
];

export const EVENT_TYPES = [
  { value: "viewing", label: "Viewing" },
  { value: "callback", label: "Callback" },
  { value: "handover", label: "Handover" },
  { value: "other", label: "Other" },
];

export const DEAL_STATUSES = [
  { value: "open", label: "Open" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

export const COMMISSION_STATUSES = [
  { value: "accrued", label: "Accrued" },
  { value: "paid", label: "Paid" },
  { value: "held", label: "On hold" },
];

export function fmtUgx(n) {
  const v = Number(n || 0);
  return `UGX ${v.toLocaleString()}`;
}

export function fmtDt(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}
