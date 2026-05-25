/**
 * Hackathon track strategy — RentDirect UG
 * PRIMARY: DeFi & Payments | SECONDARY: Walrus | OPTIONAL: Agentic Web
 */

export const HACKATHON_TRACKS = {
  primary: {
    id: "defi-payments",
    label: "DeFi & Payments",
    badge: "Primary track",
    summary:
      "Real-world rental finance — not another swap app. Hybrid MTN/Pesapal fiat + Sui wallet escrow, smart contracts, and on-chain receipts.",
    highlights: [
      "Escrow-held rent & deposits",
      "Sui wallet checkout alongside MoMo",
      "Move escrow contracts on Sui Testnet",
      "Blockchain-verified receipts",
      "Multi-rail payment infrastructure",
    ],
    demoPaths: ["/sui/escrow", "/tenant/pay", "/sui/receipts", "/payments"],
  },
  secondary: {
    id: "walrus",
    label: "Special — Walrus",
    badge: "Secondary track",
    summary:
      "Decentralized storage for proofs auditors and judges can verify — not a logo slide.",
    highlights: [
      "Receipt JSON anchored on Walrus",
      "Lease & contract document blobs",
      "KYC document content hashes",
      "Property verification artifacts",
      "Escrow release proofs",
      "Government audit exports",
    ],
    demoPaths: ["/sui/receipts", "/sui/settings"],
  },
  optional: {
    id: "agentic-web",
    label: "The Agentic Web",
    badge: "Bonus track",
    summary: "AI-assisted fraud signals, pricing hints, and compliance summaries (mocked where models are offline).",
    highlights: [
      "AI fraud alerts (NIRA queue)",
      "Landlord dashboard insights",
      "Smart search & recommendations-ready UX",
    ],
    demoPaths: ["/government/fraud", "/landlord/dashboard"],
  },
  avoid: {
    id: "deepbook",
    label: "DeepBook",
    reason: "Order-book / trading liquidity — not our core. Do not position as an exchange.",
  },
};

export const SUI_DEPLOYMENT = {
  network: "testnet",
  label: "Sui Testnet",
  rpc: "https://fullnode.testnet.sui.io:443",
  explorer: "https://suiscan.xyz/testnet",
  whyNotDevnet: "Devnet is fine for experiments but less stable for live demos.",
  whyNotMainnet: "Mainnet adds cost and risk during hackathon development.",
};

export const WALRUS_USE_CASES = [
  { key: "receipts", title: "Rent receipts", desc: "Tamper-evident receipt JSON after each payment." },
  { key: "contracts", title: "Lease contracts", desc: "Signed lease artifacts hashed and stored." },
  { key: "kyc", title: "KYC documents", desc: "National ID & selfie bundle content hash (privacy-safe)." },
  { key: "property", title: "Property verification", desc: "KCCA approval packets & inspection notes." },
  { key: "escrow", title: "Escrow proofs", desc: "Release/refund evidence linked to Move escrow." },
  { key: "audit", title: "Government audit", desc: "NIRA/KCCA/URA decision logs exportable to blob storage." },
];

export const ELEVATOR_PITCH =
  "RentDirect UG is government-integrated rental infrastructure on Sui Testnet — hybrid fiat + wallet payments, Move escrow, Walrus proofs, and AI-assisted compliance (NIRA · KCCA · URA).";

export const JUDGE_ONE_LINER =
  "We built real-world DeFi for rentals: escrow, hybrid payments, and Walrus-backed receipts — not another DEX.";
