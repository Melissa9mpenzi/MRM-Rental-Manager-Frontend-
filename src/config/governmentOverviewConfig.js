import {
  Users,
  Clock,
  AlertTriangle,
  Building2,
  Banknote,
  FileCheck,
} from "lucide-react";

export function overviewStatCards(agency, data, { isLoading, fmtFull, fmt }) {
  const d = data || {};
  if (agency === "nira") {
    return [
      { icon: Users, label: "Verified Users", value: isLoading ? "…" : fmtFull(d.verified_users ?? 0), tone: "emerald" },
      { icon: Clock, label: "Pending KYC", value: isLoading ? "…" : fmtFull(d.pending_kyc ?? 0), tone: "purple" },
      { icon: AlertTriangle, label: "Flagged Accounts", value: isLoading ? "…" : fmtFull(d.flagged_accounts ?? 0), tone: "red" },
      { icon: AlertTriangle, label: "Fraud Cases", value: isLoading ? "…" : fmtFull(d.fraud_cases ?? 0), tone: "amber" },
    ];
  }
  if (agency === "kcca") {
    return [
      { icon: Building2, label: "Verified Properties", value: isLoading ? "…" : fmtFull(d.verified_properties ?? 0), tone: "cyan" },
      { icon: Clock, label: "Pending Verification", value: isLoading ? "…" : fmtFull(d.pending_inspections ?? 0), tone: "purple" },
      { icon: FileCheck, label: "Inspections", value: isLoading ? "…" : fmtFull(d.pending_inspections ?? 0), tone: "emerald" },
      { icon: AlertTriangle, label: "Flagged Listings", value: isLoading ? "…" : fmtFull(d.fraud_cases ?? 0), tone: "red" },
    ];
  }
  if (agency === "ura") {
    return [
      { icon: Banknote, label: "Tax Revenue (UGX)", value: isLoading ? "…" : `UGX ${fmt(d.tax_revenue_ugx ?? 0)}`, tone: "yellow" },
      { icon: Users, label: "Landlords on Platform", value: isLoading ? "…" : fmtFull(d.users_total ?? 0), tone: "purple" },
      { icon: Clock, label: "Pending Tax Review", value: isLoading ? "…" : fmtFull(d.pending_kyc ?? 0), tone: "amber" },
      { icon: Building2, label: "Active Properties", value: isLoading ? "…" : fmtFull(d.active_contracts ?? 0), tone: "cyan" },
    ];
  }
  return [
    { icon: Users, label: "Verified Users", value: isLoading ? "…" : fmtFull(d.verified_users ?? 0), tone: "emerald" },
    { icon: Clock, label: "Pending KYC", value: isLoading ? "…" : fmtFull(d.pending_kyc ?? 0), tone: "purple" },
    { icon: AlertTriangle, label: "Flagged Accounts", value: isLoading ? "…" : fmtFull(d.flagged_accounts ?? 0), tone: "red" },
    { icon: Building2, label: "Verified Properties", value: isLoading ? "…" : fmtFull(d.verified_properties ?? 0), tone: "cyan" },
    { icon: Banknote, label: "Tax Revenue (UGX)", value: isLoading ? "…" : `UGX ${fmt(d.tax_revenue_ugx ?? 0)}`, tone: "yellow" },
    { icon: FileCheck, label: "Active Contracts", value: isLoading ? "…" : fmtFull(d.active_contracts ?? 0), tone: "teal" },
  ];
}

export function trendLinesForAgency(agency) {
  if (agency === "nira") return [{ dataKey: "nira", name: "NIRA Verifications", stroke: "#00C896" }];
  if (agency === "kcca") return [{ dataKey: "kcca", name: "Property Verifications", stroke: "#22D3EE" }];
  if (agency === "ura") return [{ dataKey: "ura", name: "Tax Compliance", stroke: "#EAB308" }];
  return [
    { dataKey: "nira", name: "NIRA", stroke: "#00C896" },
    { dataKey: "kcca", name: "Property", stroke: "#22D3EE" },
    { dataKey: "ura", name: "Tax", stroke: "#EAB308" },
  ];
}

export function overviewPanelTitle(agency) {
  if (agency === "nira") return "Identity Verification Overview";
  if (agency === "kcca") return "Property Verification Overview";
  if (agency === "ura") return "Tax Compliance Overview";
  return "Verification Overview";
}

export function trendPanelTitle(agency) {
  if (agency === "nira") return "NIRA Activity Trend";
  if (agency === "kcca") return "Property Verification Trend";
  if (agency === "ura") return "Tax Compliance Trend";
  return "National Activity Trend";
}

export function regionPanelTitle(agency) {
  return "Compliance By Region";
}
