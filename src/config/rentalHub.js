/** Rental Hub — communication & trust (RentDirect Connect) */

export const RENTAL_HUB_BRAND = "Rental Hub";

export const THREAD_TYPES = {
  inquiry: { label: "Inquiry", description: "Before renting", color: "#00C896" },
  contract: { label: "Contract", description: "After agreement", color: "#60a5fa" },
  support: { label: "Support", description: "Issues & disputes", color: "#f59e0b" },
  compliance: { label: "Compliance", description: "Government / legal", color: "#a78bfa" },
  escrow: { label: "Escrow", description: "Payment room", color: "#22d3ee" },
};

export const SIDEBAR_FOLDERS = [
  { id: "inbox", label: "Inbox" },
  { id: "property", label: "Property Chats" },
  { id: "contracts", label: "Contracts" },
  { id: "support", label: "Support" },
  { id: "archived", label: "Archived" },
];

export const BADGE_LABELS = {
  verified_landlord: "Verified Landlord",
  trusted_tenant: "Trusted Tenant",
  identity_verified: "ID Verified",
  government: "Government",
  platform_admin: "Platform Admin",
  gov_verified_property: "Gov Verified Property",
};

export const SYSTEM_EVENT_LABELS = {
  thread_opened: "Conversation started",
  payment_confirmed: "Payment confirmed",
  lease_approved: "Lease approved",
  inspection_requested: "Inspection requested",
  escrow_released: "Escrow released",
  kyc_verified: "KYC verified",
};
