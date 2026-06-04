/**
 * Supported payment methods (no cash).
 * Backend `PaymentMethod`: mtn_momo | airtel | bank | sui | pesapal | card | other (legacy)
 */

export const PAYMENT_METHODS = [
  {
    id: "mtn_momo",
    label: "MTN MoMo",
    shortLabel: "MTN",
    sub: "Pay with MTN Mobile Money",
    logo: "mtn",
    apiValue: "mtn_momo",
  },
  {
    id: "airtel",
    label: "Airtel Money",
    shortLabel: "Airtel",
    sub: "Pay with Airtel Money",
    logo: "airtel",
    apiValue: "airtel",
  },
  {
    id: "pesapal",
    label: "Card / Pesapal",
    shortLabel: "Pesapal",
    sub: "Visa, Mastercard, and Pesapal checkout",
    logo: "visa",
    apiValue: "pesapal",
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
    id: "sui",
    label: "Sui Wallet",
    shortLabel: "Sui",
    sub: "On-chain payment with digital receipt",
    logo: "sui",
    apiValue: "sui",
  },
];

/** Tenant “Pay rent” — MoMo, Airtel, Pesapal card, Sui. */
export const TENANT_PAY_METHODS = PAYMENT_METHODS.filter((m) =>
  ["mtn_momo", "airtel", "pesapal", "sui"].includes(m.id),
);

/** Landlord record payment — same rails, no cash. */
export const RECORD_PAYMENT_METHODS = PAYMENT_METHODS.filter((m) =>
  ["mtn_momo", "airtel", "pesapal", "bank", "sui"].includes(m.id),
);

const BY_API = Object.fromEntries(PAYMENT_METHODS.map((m) => [m.apiValue, m]));
const BY_ID = Object.fromEntries(PAYMENT_METHODS.map((m) => [m.id, m]));

/** Normalize API / legacy strings to a config row. */
export function resolvePaymentMethod(raw) {
  if (!raw) return BY_ID.mtn_momo;
  const key = String(raw).toLowerCase().replace(/-/g, "_");
  if (BY_ID[key]) return BY_ID[key];
  if (key === "mtn" || key === "momo_mtn" || key === "mobile_money") return BY_ID.mtn_momo;
  if (key === "momo_airtel") return BY_ID.airtel;
  if (key === "bank_transfer") return BY_ID.bank;
  if (key === "card" || key === "visa" || key === "mastercard") return BY_ID.pesapal;
  if (key === "cash") {
    return { id: "cash", label: "Cash (legacy)", shortLabel: "Cash", sub: "", logo: "bank", apiValue: "cash" };
  }
  if (BY_API[key]) return BY_API[key];
  if (key === "other") return BY_ID.pesapal;
  return { ...BY_ID.mtn_momo, id: key, label: key.replace(/_/g, " ") };
}

export function paymentMethodLabel(raw) {
  return resolvePaymentMethod(raw).label;
}

export function paymentLogoPath(logoKey) {
  return `/icons/payments/${logoKey}.svg`;
}
