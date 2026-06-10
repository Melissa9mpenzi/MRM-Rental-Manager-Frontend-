/**
 * Sui as the trust layer — not a payment add-on.
 * Used on landing, About, and Sui portal demo panels.
 */

export const SUI_TRUST_HEADLINE =
  "RentDirect UG uses Sui as the trust layer for the rental ecosystem.";

export const SUI_TRUST_NARRATIVE =
  "Property listings become verifiable digital assets, rental agreements become tamper-resistant records, users build blockchain-based identities, and payments occur natively on Sui.";

export const SUI_TRUST_CONTRAST =
  "Not “a property platform that accepts SUI payments” — Sui is the foundation for verification, ownership, agreements, identity, and settlement.";

/** End-to-end rental trust flow (demo diagram) */
export const SUI_TRUST_FLOW = [
  {
    id: "landlord-wallet",
    title: "Landlord signs in",
    detail: "Email, Google, or Apple — a Sui wallet is derived in the background; no extra blockchain login.",
    path: "/landlord/properties",
  },
  {
    id: "listing",
    title: "Creates property listing",
    detail: "Address, units, and rent terms enter RentDirect — duplicate locations blocked.",
    path: "/landlord/properties/new",
  },
  {
    id: "property-object",
    title: "Property object created on Sui",
    detail: "Unique on-chain listing identity: property ID, landlord wallet, location, timestamp.",
    path: "/landlord/properties",
  },
  {
    id: "tenant-wallet",
    title: "Tenant signs in",
    detail: "Same account wallet for pay and reputation — optional browser wallet for advanced users only.",
    path: "/tenant/pay",
  },
  {
    id: "agreement",
    title: "Rental agreement recorded on Sui",
    detail: "Agreement hash, tenant wallet, landlord wallet, timestamp — tamper-resistant proof.",
    path: "/sui/contracts",
  },
  {
    id: "payment",
    title: "Rent paid through Sui",
    detail: "Native settlement on Sui testnet — no PDF receipt that anyone can forge.",
    path: "/tenant/pay",
  },
  {
    id: "receipt",
    title: "Receipt stored on-chain",
    detail: "Transaction digest + verify URL + optional Move receipt anchor.",
    path: "/sui/receipts",
  },
  {
    id: "reputation",
    title: "Reputation updated",
    detail: "Wallet-linked score grows with verified listings, agreements, and payments.",
    path: "/sui/dashboard",
  },
];

export const SUI_TRUST_PILLARS = [
  {
    key: "verification",
    title: "Verification",
    suiTitle: "With Sui",
    traditional: {
      summary: "A landlord uploads property details.",
      problems: [
        "Fake listings can be created.",
        "Same property can be listed multiple times.",
        "Listing history can be altered.",
      ],
    },
    sui: {
      summary: "Each property becomes a unique on-chain object.",
      explanation:
        "When a property is listed, RentDirect creates a verifiable property record on Sui. This gives every property a unique identity that can be independently verified and helps reduce fraudulent or duplicate listings.",
      stored: ["Property ID", "Landlord wallet", "Location", "Timestamp"],
    },
  },
  {
    key: "ownership",
    title: "Ownership records",
    suiTitle: "With Sui",
    traditional: {
      summary: "Ownership information lives only in the platform database.",
      problems: ["Data can be modified.", "Users must trust your platform alone."],
    },
    sui: {
      summary: "The landlord wallet is linked to the property object.",
      explanation:
        "Property ownership records are linked to blockchain identities on Sui, creating transparent and auditable ownership histories.",
      stored: ["Landlord wallet", "Property object ID", "Listed at"],
    },
  },
  {
    key: "agreements",
    title: "Rental agreements",
    suiTitle: "With Sui",
    traditional: {
      summary: "PDF stored on a server.",
      problems: ["Can be edited.", "Difficult to prove authenticity."],
    },
    sui: {
      summary: "Agreement anchored with cryptographic proof.",
      explanation:
        "Rental agreements are anchored on Sui, creating tamper-resistant proof that an agreement existed at a specific time between specific parties.",
      stored: ["Agreement hash", "Tenant wallet", "Landlord wallet", "Timestamp"],
    },
  },
  {
    key: "identity",
    title: "Digital identity",
    suiTitle: "With Sui",
    traditional: {
      summary: "Users sign up with email and password.",
      problems: ["Fake accounts.", "Multiple identities."],
    },
    sui: {
      summary: "Wallet address becomes part of identity.",
      explanation:
        "RentDirect uses wallet-based identities, enabling landlords and tenants to build portable reputations tied to their blockchain identity.",
      stored: ["Sui address", "Reputation score", "On-chain payment history"],
    },
  },
];
