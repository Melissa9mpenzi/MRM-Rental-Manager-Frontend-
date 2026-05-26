import { Wifi, Car, Shield, Wind, Home, Zap } from "lucide-react";

export const LISTING_PRICE_MIN = 500_000;
export const LISTING_PRICE_MAX = 15_000_000;
export const LISTING_PRICE_STEP = 100_000;

export const LISTING_PROPERTY_TYPES = [
  "Apartment",
  "House",
  "Studio",
  "Commercial",
  "Villa",
  "Hostel",
  "Duplex",
  "Warehouse",
  "Office Space",
  "Shop/Retail",
  "Land/Plot",
  "Bungalow",
  "Condominium",
  "Airbnb",
];

export const LISTING_AMENITIES = [
  { id: "WiFi", icon: Wifi, hint: "Fiber / WiFi" },
  { id: "Parking", icon: Car, hint: "Parking / garage" },
  { id: "Security", icon: Shield, hint: "Security / gated" },
  { id: "Balcony", icon: Wind, hint: "Balcony / terrace" },
  { id: "Generator", icon: Zap, hint: "Generator / backup power" },
  { id: "Furnished", icon: Home, hint: "Furnished / move-in ready" },
];

/** Backend unit_type enum ↔ marketplace category label */
export const CATEGORY_TO_UNIT_TYPE = {
  Studio: "studio",
  Apartment: "one_bedroom",
  House: "two_bedroom",
  Villa: "three_bedroom",
  Duplex: "two_bedroom",
  Bungalow: "two_bedroom",
  Condominium: "two_bedroom",
  Hostel: "bedsitter",
  "Shop/Retail": "shop",
  "Office Space": "office",
  Warehouse: "other",
  Commercial: "shop",
  "Land/Plot": "other",
  Airbnb: "one_bedroom",
};

export const UNIT_TYPE_OPTIONS = [
  { value: "bedsitter", label: "Bedsitter" },
  { value: "studio", label: "Studio" },
  { value: "one_bedroom", label: "1 Bedroom (unit type)" },
  { value: "two_bedroom", label: "2 Bedroom (unit type)" },
  { value: "three_bedroom", label: "3 Bedroom (unit type)" },
  { value: "shop", label: "Shop / Retail" },
  { value: "office", label: "Office" },
  { value: "other", label: "Other" },
];

export function fmtPriceShort(n) {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`;
  }
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

export function inferListingCategory(listing) {
  if (listing.listing_category) return listing.listing_category;
  const u = String(listing.unit_type || "").toLowerCase();
  if (u === "studio" || u === "bedsitter") return "Studio";
  if (u === "one_bedroom") return "Apartment";
  if (u === "two_bedroom") return "House";
  if (u === "three_bedroom") return "Villa";
  if (u === "shop") return "Shop/Retail";
  if (u === "office") return "Office Space";
  return "Apartment";
}

export function listingHasAmenity(listing, amenityId) {
  const ams = listing.amenities;
  if (Array.isArray(ams) && ams.length) {
    const norm = ams.map((a) => String(a).trim());
    if (norm.includes(amenityId)) return true;
    const lower = norm.map((a) => a.toLowerCase());
    const map = {
      WiFi: ["wifi", "wi-fi", "fibre", "fiber", "internet"],
      Parking: ["parking", "garage", "car park"],
      Security: ["security", "gated", "24/7", "cctv"],
      Balcony: ["balcony", "terrace", "deck"],
      Generator: ["generator", "backup power", "inverter"],
      Furnished: ["furnished", "furnish", "move-in ready"],
    };
    return (map[amenityId] || []).some((k) => lower.some((a) => a.includes(k)));
  }
  const blob = `${listing.title} ${listing.desc || ""} ${listing.parking || ""}`.toLowerCase();
  switch (amenityId) {
    case "WiFi":
      return /wifi|wi-fi|fibre|fiber|internet/.test(blob);
    case "Parking":
      return /parking|slot|garage|car park/.test(blob);
    case "Security":
      return /security|gated|secure|24\/?7/.test(blob);
    case "Balcony":
      return /balcony|terrace|deck/.test(blob);
    case "Generator":
      return /generator|backup power|inverter/.test(blob);
    case "Furnished":
      return /furnish|fitted|move-in ready/.test(blob);
    default:
      return false;
  }
}
