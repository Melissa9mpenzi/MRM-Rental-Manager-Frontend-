import { navItemsForRole, isSystemAdministrator } from "./governmentAccess";
import { SYSTEM_NAV_SECTIONS } from "./systemAdminNav";

export const AGENCY_LABELS = {
  all: "All Agencies",
  nira: "NIRA — Identity",
  kcca: "KCCA — Property",
  ura: "URA — Tax",
};

/** Where the agency switcher navigates (system admin). */
export const AGENCY_HOME_PATH = {
  all: "/government/overview",
  nira: "/government/nira",
  kcca: "/government/kcca",
  ura: "/government/ura",
};

export function govSearchItems(role) {
  const pages = navItemsForRole(role).map((item) => ({
    id: item.id,
    label: item.label,
    path: item.path,
    keywords: [item.label, item.id, item.path.replace("/government/", "")],
    group: "Pages",
  }));

  const extras = [];
  if (pages.some((p) => p.id === "nira")) {
    extras.push({
      id: "nira-pending",
      label: "Pending KYC queue",
      path: "/government/nira",
      keywords: ["pending", "kyc", "queue", "nira"],
      group: "Shortcuts",
    });
  }
  if (pages.some((p) => p.id === "kcca")) {
    extras.push({
      id: "kcca-inspection",
      label: "Inspection requests",
      path: "/government/inspections",
      keywords: ["inspection", "kcca", "field"],
      group: "Shortcuts",
    });
  }
  if (pages.some((p) => p.id === "fraud")) {
    extras.push({
      id: "fraud-alerts",
      label: "Fraud alerts",
      path: "/government/fraud",
      keywords: ["fraud", "risk", "alerts"],
      group: "Shortcuts",
    });
  }

  const merged = [...pages, ...extras];

  if (isSystemAdministrator(role)) {
    const seen = new Set(merged.map((m) => m.path));
    SYSTEM_NAV_SECTIONS.forEach((section) => {
      section.items.forEach((item) => {
        if (seen.has(item.path)) return;
        seen.add(item.path);
        merged.push({
          id: `sys-${item.id}`,
          label: item.label,
          path: item.path,
          keywords: [item.label, section.title, item.id],
          group: section.title,
        });
      });
    });
  }

  return merged;
}
