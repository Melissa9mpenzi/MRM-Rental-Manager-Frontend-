/**
 * Judge demo script — credentials & narrative (run `python -m app.utils.seed_data` first).
 */
export const DEMO_CREDENTIALS = [
  { role: "Tenant", email: "tenant.demo@rentdirect.ug", password: "tenant12", portal: "/login" },
  { role: "Landlord", email: "landlord1@gmail.com", password: "land12", portal: "/login" },
  { role: "NIRA Officer", email: "nira.officer@rentdirect.ug", password: "nira12", portal: "/government/login" },
  { role: "KCCA Officer", email: "kcca.officer@rentdirect.ug", password: "kcca12", portal: "/government/login" },
  { role: "URA Officer", email: "ura.officer@rentdirect.ug", password: "ura12", portal: "/government/login" },
  { role: "System Admin", email: "nakunguesther044@gmail.com", password: "admin12", portal: "/login" },
];

export const DEMO_FLOW_STEPS = [
  { step: 1, title: "Tenant registers", actor: "Tenant", path: "/register" },
  { step: 2, title: "NIRA verifies identity", actor: "NIRA", path: "/government/nira" },
  { step: 3, title: "Landlord uploads property", actor: "Landlord", path: "/landlord/properties/new" },
  { step: 4, title: "KCCA approves property", actor: "KCCA", path: "/government/kcca" },
  { step: 5, title: "Tenant browses marketplace", actor: "Tenant", path: "/browse-properties" },
  { step: 6, title: "Smart contract / escrow", actor: "Sui", path: "/sui/escrow" },
  { step: 7, title: "Pay via MTN or Sui", actor: "Tenant", path: "/tenant/pay" },
  { step: 8, title: "Receipt + blockchain proof", actor: "Platform", path: "/receipts" },
  { step: 9, title: "URA tax compliance", actor: "URA", path: "/government/ura" },
  { step: 10, title: "Admin monitors platform", actor: "Admin", path: "/system/dashboard" },
];

export const PITCH_LINE =
  "Government-integrated rental infrastructure on Sui Testnet — hybrid DeFi payments, Walrus proofs, and AI-assisted compliance (NIRA · KCCA · URA).";

/** Primary hackathon track — lead with this narrative */
export const DEFI_DEMO_FLOW = [
  { step: 1, title: "Tenant onboards", detail: "OTP + role — mobile-first", path: "/register" },
  { step: 2, title: "NIRA verifies identity", detail: "KYC queue → approved landlord", path: "/government/nira" },
  { step: 3, title: "Landlord lists property", detail: "Kampala listing — pending KCCA", path: "/landlord/properties/new" },
  { step: 4, title: "KCCA approves property", detail: "Trust badge on marketplace", path: "/government/kcca" },
  { step: 5, title: "Escrow contract created", detail: "Move escrow on Sui Testnet", path: "/sui/escrow" },
  { step: 6, title: "Tenant pays", detail: "MTN MoMo OR Sui wallet — hybrid finance", path: "/tenant/pay" },
  { step: 7, title: "Receipt + Walrus proof", detail: "On-chain tx + decentralized blob", path: "/sui/receipts" },
  { step: 8, title: "URA tax compliance", detail: "Rental income tracked", path: "/government/ura" },
];
