/** Receipt type theming — matches RentDirect UG mockup */

export const RECEIPT_FILTERS = [
  { id: "all", label: "All" },
  { id: "rent_payment", label: "Rent" },
  { id: "security_deposit", label: "Deposit" },
  { id: "commission", label: "Commission" },
  { id: "government_tax", label: "Tax" },
  { id: "blockchain", label: "Blockchain" },
];

export function receiptTypeConfig(receipt) {
  const type = receipt?.receipt_type || "rent_payment";
  const method = (receipt?.payment_method || "").toLowerCase();
  const hasChain = Boolean(receipt?.tx_hash);

  const defaults = {
    rent_payment: {
      title: "Rent Payment Receipt",
      accent: "#22c55e",
      accentSoft: "rgba(34,197,94,0.12)",
      badge: "PAID",
      badgeClass: "paid",
      icon: "rent",
    },
    security_deposit: {
      title: "Security Deposit Receipt",
      accent: "#8b5cf6",
      accentSoft: "rgba(139,92,246,0.12)",
      badge: "ESCROWED",
      badgeClass: "escrowed",
      icon: "deposit",
    },
    commission: {
      title: "Commission Receipt",
      accent: "#f97316",
      accentSoft: "rgba(249,115,22,0.12)",
      badge: "PAID",
      badgeClass: "paid",
      icon: "commission",
    },
    government_tax: {
      title: "Government Tax Receipt (URA)",
      accent: "#3b82f6",
      accentSoft: "rgba(59,130,246,0.12)",
      badge: "PAID & COMPLIANT",
      badgeClass: "tax",
      icon: "tax",
    },
    blockchain: {
      title: "Blockchain Receipt",
      accent: "#14b8a6",
      accentSoft: "rgba(20,184,166,0.12)",
      badge: "CONFIRMED",
      badgeClass: "confirmed",
      icon: "blockchain",
    },
  };

  const base = defaults[type] || defaults.rent_payment;

  if (hasChain && type === "rent_payment" && method === "sui") {
    return {
      title: "Blockchain Receipt",
      accent: "#14b8a6",
      accentSoft: "rgba(20,184,166,0.12)",
      badge: "CONFIRMED",
      badgeClass: "confirmed",
      icon: "blockchain",
    };
  }

  if (receipt?.status === "escrowed") {
    return { ...base, badge: "ESCROWED", badgeClass: "escrowed" };
  }

  return base;
}

export function methodLabel(method) {
  const m = (method || "").toLowerCase();
  const map = {
    mtn_momo: "MTN Mobile Money",
    airtel: "Airtel Money",
    bank: "Bank Transfer",
    cash: "Cash",
    sui: "SUI Wallet Payment",
    other: "Card / Other",
  };
  return map[m] || m.replace(/_/g, " ");
}

export function qrImageUrl(text, size = 120) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&bgcolor=ffffff&color=0c1219`;
}
