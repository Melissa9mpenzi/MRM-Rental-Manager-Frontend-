/**
 * Sui hackathon positioning — RentDirect UG
 * PRIMARY: DeFi & Payments | SECONDARY: Walrus | OPTIONAL: rule-based risk signals only
 *
 * Frame: "Africa's decentralized rental infrastructure powered by Sui"
 * NOT: "property management app with crypto"
 */

export const SUI_NATIVE_TAGLINE =
  "Africa's decentralized rental infrastructure powered by Sui";

export const WINNING_POSITIONING =
  "RentDirect UG is a decentralized rental trust infrastructure platform built on Sui, enabling secure escrow payments, immutable rental agreements, decentralized receipts, and government-grade verification for African housing markets.";

export const HACKATHON_TRACKS = {
  primary: {
    id: "defi-payments",
    label: "DeFi & Payments",
    badge: "Primary track",
    summary:
      "Trustless rent escrow, Sui settlement, on-chain receipts, and hybrid fiat rails — real-world DeFi for housing, not a DEX.",
    highlights: [
      "Move escrow: tenant pays → contract holds → landlord releases on conditions",
      "On-chain payment receipts (tx digest + verify page + QR)",
      "Privy / platform Sui wallet — sign up with Google, get an address",
      "Hybrid MTN/Pesapal + SUI settlement",
      "Composable trust layer for landlords, tenants, and URA",
    ],
    demoPaths: ["/sui", "/sui/escrow", "/tenant/pay", "/sui/receipts", "/verify"],
  },
  secondary: {
    id: "walrus",
    label: "Special — Walrus",
    badge: "Secondary track",
    summary:
      "Permanent decentralized proofs — leases, receipts, KYC manifests, escrow releases, gov audit exports.",
    highlights: [
      "Receipt JSON on Walrus linked to Sui tx",
      "Rental agreement blobs + content hash",
      "KYC manifest (privacy-safe hash bundle)",
      "Escrow lease & release proofs",
      "Government audit export bundles",
    ],
    demoPaths: ["/sui/receipts", "/sui/settings", "/government/audit"],
  },
  optional: {
    id: "risk-signals",
    label: "Risk signals (optional)",
    badge: "If asked about AI",
    summary:
      "Rule-based fraud detection only — duplicate NIN, KYC flags, illegal property signals. No fake LLM.",
    highlights: [
      "Heuristic fraud queue (NIRA)",
      "KCCA property compliance flags",
      "URA payment anomaly views",
    ],
    demoPaths: ["/government/fraud"],
  },
  avoid: {
    id: "agentic-web",
    label: "The Agentic Web",
    reason: "Not an agent economy or autonomous workflow product — do not lead with this.",
  },
  avoidDeepbook: {
    id: "deepbook",
    label: "DeepBook",
    reason: "Not order-book / trading liquidity.",
  },
};

export const SUI_DEPLOYMENT = {
  network: "testnet",
  label: "Sui Testnet",
  rpc: "https://fullnode.testnet.sui.io:443",
  explorer: "https://suiscan.xyz/testnet",
  movePackagePath: "contracts/rentdirect",
  modules: ["escrow", "receipt"],
};

export const WALRUS_USE_CASES = [
  { key: "receipts", title: "Rent receipts", desc: "Receipt JSON anchored; linked to on-chain tx digest." },
  { key: "contracts", title: "Rental agreements", desc: "Lease terms hashed + stored as Walrus blob." },
  { key: "kyc", title: "KYC manifests", desc: "Identity proof bundle (hash-first, privacy-safe)." },
  { key: "property", title: "Property verification", desc: "KCCA approval packets." },
  { key: "escrow", title: "Escrow proofs", desc: "Fund + release evidence tied to Move escrow." },
  { key: "audit", title: "Government audit", desc: "Exportable compliance trail." },
];

/** 60-second judge script */
export const SUI_DEMO_FLOW = [
  { step: 1, title: "Account + wallet", detail: "Google via Privy → embedded Sui address (no extension)." },
  { step: 2, title: "Rental agreement", detail: "Landlord creates lease → agreement hash + Walrus proof." },
  { step: 3, title: "On-chain rent", detail: "Tenant pays from RentDirect wallet → Sui tx digest." },
  { step: 4, title: "Receipt", detail: "QR verify + Walrus blob + explorer link." },
  { step: 5, title: "Escrow", detail: "Create hold → release → Walrus release proof." },
  { step: 6, title: "Gov trust", detail: "NIRA/KCCA/URA dashboards + fraud + audit export." },
];

export const ELEVATOR_PITCH = WINNING_POSITIONING;

export const JUDGE_ONE_LINER =
  "We built decentralized rental infrastructure on Sui — escrow, immutable agreements, on-chain receipts, and Walrus proofs — not another property CRUD app.";

/** Critical question: "Why could this not exist without Sui?" */
export const WHY_NOT_WITHOUT_SUI = {
  title: "Why could this not exist properly without Sui?",
  answer:
    "Rent requires trust in custody, settlement, and evidence. Banks and PDFs cannot give tenants and governments the same verifiable, composable guarantees as on-chain escrow, transaction digests, and Walrus-backed proofs — especially across disputes and audits.",
  pillars: [
    { title: "Escrow payments", body: "Programmable hold/release — trustless rent custody on testnet Move contracts." },
    { title: "Smart rental agreements", body: "Lease terms anchored (hash + Walrus); tamper-evident vs editable database rows." },
    { title: "Decentralized receipts", body: "Every Sui payment gets a digest, verify URL, and optional on-chain Receipt object." },
    { title: "On-chain verification", body: "Anyone can validate payment and agreement proofs via explorer + public verify routes." },
    { title: "Walrus storage", body: "Receipts, contracts, KYC manifests, and audit bundles outlive any single API server." },
    { title: "Digital identity layer", body: "Gov verification (NIRA/KCCA/URA) + Sui wallet per account = trust stack for Uganda." },
  ],
};

export const JUDGE_FAQ = {
  title: "Why Sui & Walrus?",
  shortAnswer: WHY_NOT_WITHOUT_SUI.answer,
  points: WHY_NOT_WITHOUT_SUI.pillars.map((p) => ({
    heading: p.title,
    body: p.body,
  })),
  walrusStrategy:
    "Transactional truth on Sui; dispute-grade documents on Walrus; CRM speed in Postgres. Set WALRUS_PUBLISHER_URL for live blobs.",
};

// Legacy alias
export const HACKATHON_TRACKS_AGENTIC = HACKATHON_TRACKS.optional;
