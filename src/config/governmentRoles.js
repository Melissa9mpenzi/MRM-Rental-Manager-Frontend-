/**
 * RentDirect UG — NIRA / KCCA / URA compliance authorities (not platform admins).
 * GovTech + PropTech + FinTech national housing infrastructure.
 */

export const GOVERNMENT_WORKFLOW = {
  title: "National compliance pipeline",
  steps: [
    { order: 1, agency: "NIRA", label: "Identity verification", path: "/government/nira" },
    { order: 2, agency: "KCCA", label: "Property compliance", path: "/government/kcca" },
    { order: 3, agency: "URA", label: "Tax compliance", path: "/government/ura" },
  ],
};

export const COMPLIANCE_BADGES = [
  { key: "nira_verified_landlord", label: "NIRA Verified Landlord", tone: "emerald" },
  { key: "kcca_approved_property", label: "KCCA Approved Property", tone: "cyan" },
  { key: "ura_compliant", label: "URA Compliant", tone: "amber" },
];

export const GOVERNMENT_AGENCY_ROLES = {
  nira: {
    code: "nira",
    name: "NIRA",
    title: "Identity & anti-fraud authority",
    purpose: "Identity verification and anti-fraud for all platform users.",
    responsibilities: [
      "Verify national ID, face match, name, phone, and date of birth",
      "Approve, reject, or place KYC under review",
      "Detect fake IDs, duplicate accounts, and identity theft",
      "Blacklist and suspend fraudsters, fake landlords, and scammers",
    ],
    access: {
      sees: ["KYC data", "Identity documents", "Verification queue", "Fraud reports", "Blacklist"],
      notSees: ["Payment wallets", "Commission payouts", "System configuration", "Officer invitations"],
    },
    modules: ["kyc", "fraud", "blacklist", "audit"],
  },
  kcca: {
    code: "kcca",
    name: "KCCA",
    title: "Property compliance authority",
    purpose: "Property compliance and physical verification across Kampala & districts.",
    responsibilities: [
      "Approve buildings, permits, plot ownership, and zoning",
      "Schedule site inspections, audits, and safety checks",
      "Set compliance: Approved, Pending inspection, Rejected, Unsafe, Illegal",
      "Suspend fake or illegal listings and validate map coordinates",
    ],
    access: {
      sees: ["Property listings", "Landlord identity (limited)", "Inspections", "GIS / district data"],
      notSees: ["Wallet balances", "Full payment rails", "User passwords", "System configuration"],
    },
    modules: ["properties", "inspections", "maps", "audit"],
  },
  ura: {
    code: "ura",
    name: "URA",
    title: "Tax & financial compliance authority",
    purpose: "Tax and rental-income compliance for landlords and the platform.",
    responsibilities: [
      "Monitor rental income, agent commissions, and platform revenue",
      "Track VAT / income tax records and compliance documents",
      "Flag tax evasion and undeclared rentals",
      "View revenue analytics by month and district",
    ],
    access: {
      sees: ["Payments", "Revenue reports", "Tax compliance", "Transaction monitoring"],
      notSees: ["User passwords", "System configuration", "KYC document images", "Officer invitations"],
    },
    modules: ["tax", "revenue", "transactions", "audit"],
  },
};

export function agencyRoleDefinition(agency) {
  return GOVERNMENT_AGENCY_ROLES[agency] || null;
}
