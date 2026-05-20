/**
 * Payment methods aligned with backend `PaymentMethod` enum:
 * mtn_momo | airtel | cash | bank | other
 */

export const PAYMENT_METHODS = [
  {
    id: "mtn_momo",
    label: "MTN MoMo",
    shortLabel: "MTN",
    sub: "Pay with your MTN Mobile Money wallet",
    logo: "mtn",
    apiValue: "mtn_momo",
  },
  {
    id: "airtel",
    label: "Airtel Money",
    shortLabel: "Airtel",
    sub: "Pay with your Airtel Money wallet",
    logo: "airtel",
    apiValue: "airtel",
  },
  {
    id: "card",
    label: "Visa / Mastercard",
    shortLabel: "Card",
    sub: "Debit or credit card (recorded as other until gateway is live)",
    logo: "visa",
    apiValue: "other",
  },
  {
    id: "bank",
    label: "Bank transfer",
    shortLabel: "Bank",
    sub: "Transfer to landlord bank account",
    logo: "bank",
    apiValue: "bank",
  },
  {
    id: "cash",
    label: "Cash",
    shortLabel: "Cash",
    sub: "Paid in person",
    logo: "cash",
    apiValue: "cash",
  },
  {
    id: "sui",
    label: "Sui Wallet",
    shortLabel: "Sui",
    sub: "On-chain settlement (preview)",
    logo: "sui",
    apiValue: "other",
  },
  {
    id: "other",
    label: "Other",
    shortLabel: "Other",
    sub: "Cheque or other method",
    logo: "other",
    apiValue: "other",
  },
];

/** Methods shown on tenant “Pay rent” (mobile money + cards). */
export const TENANT_PAY_METHODS = PAYMENT_METHODS.filter((m) =>
  ["mtn_momo", "airtel", "card", "sui"].includes(m.id),
);

/** Methods for landlord record-payment forms. */
export const RECORD_PAYMENT_METHODS = PAYMENT_METHODS.filter((m) =>
  ["mtn_momo", "airtel", "cash", "bank", "other"].includes(m.id),
);

const BY_API = Object.fromEntries(
  PAYMENT_METHODS.map((m) => [m.apiValue, m]),
);
const BY_ID = Object.fromEntries(PAYMENT_METHODS.map((m) => [m.id, m]));

/** Normalize API / legacy strings to a config row. */
export function resolvePaymentMethod(raw) {
  if (!raw) return BY_ID.other;
  const key = String(raw).toLowerCase().replace(/-/g, "_");
  if (BY_ID[key]) return BY_ID[key];
  if (key === "mtn" || key === "momo_mtn" || key === "mobile_money") return BY_ID.mtn_momo;
  if (key === "momo_airtel") return BY_ID.airtel;
  if (key === "bank_transfer") return BY_ID.bank;
  if (BY_API[key]) return BY_API[key];
  return { ...BY_ID.other, id: key, label: key.replace(/_/g, " ") };
}

export function paymentMethodLabel(raw) {
  return resolvePaymentMethod(raw).label;
}

export function paymentLogoPath(logoKey) {
  return `/icons/payments/${logoKey}.svg`;
}
