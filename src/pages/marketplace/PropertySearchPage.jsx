import { useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  CheckCircle2,
  Lock,
  Wifi,
  Car,
  Shield,
  Wind,
  Home,
  Zap,
  Store,
  X,
} from "lucide-react";
import { PUBLIC_LISTINGS } from "../../data/publicListings";
import useAuthStore from "../../store/authStore";
import ListingSaveButton from "../../components/domain/ListingSaveButton";

const MIN_PRICE = 500_000;
const MAX_PRICE = 15_000_000;
const PRICE_STEP = 100_000;

const PROPERTY_TYPES = [
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

const AMENITIES = [
  { id: "WiFi", icon: Wifi, hint: "Fiber / WiFi" },
  { id: "Parking", icon: Car, hint: "Parking" },
  { id: "Security", icon: Shield, hint: "Security / gated" },
  { id: "Balcony", icon: Wind, hint: "Balcony / terrace" },
  { id: "Generator", icon: Zap, hint: "Generator / backup power" },
  { id: "Furnished", icon: Home, hint: "Furnished" },
];

/** Compact UGX label for filter readouts */
function fmtPriceShort(n) {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`;
  }
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

function inferPropertyType(listing) {
  const t = `${listing.title} ${listing.desc || ""}`.toLowerCase();
  if (t.includes("studio")) return "Studio";
  if (t.includes("villa")) return "Villa";
  if (t.includes("townhouse")) return "Duplex";
  if (t.includes("warehouse") || t.includes("industrial")) return "Warehouse";
  if (t.includes("shop") || t.includes("retail")) return "Shop/Retail";
  if (t.includes("office") || t.includes("tower")) return "Office Space";
  if (t.includes("hostel")) return "Hostel";
  if (t.includes("compound") || t.includes("homes") || t.includes("family")) return "House";
  if (t.includes("bungalow")) return "Bungalow";
  if (t.includes("condo")) return "Condominium";
  if (t.includes("airbnb")) return "Airbnb";
  if (t.includes("commercial") || t.includes("cbd block")) return "Commercial";
  if (t.includes("plot") || t.includes("land")) return "Land/Plot";
  if (t.includes("apartment") || t.includes("block") || t.includes("unit")) return "Apartment";
  return "Apartment";
}

function listingMatchesAmenity(listing, id) {
  const blob = `${listing.title} ${listing.desc || ""} ${listing.parking || ""}`.toLowerCase();
  switch (id) {
    case "WiFi":
      return /wifi|wi-fi|fibre|fiber|internet/.test(blob);
    case "Parking":
      return /parking|slot|garage|basement|covered/.test(blob);
    case "Security":
      return /security|gated|secure|concierge|24\/?7/.test(blob);
    case "Balcony":
      return /balcony|terrace|deck/.test(blob);
    case "Generator":
      return /generator|backup power|power change|inverter/.test(blob);
    case "Furnished":
      return /furnish|fitted|move-in ready/.test(blob);
    default:
      return false;
  }
}

function FilterSection({ title, children, className = "" }) {
  return (
    <section className={`space-y-3 ${className}`}>
      <h3 className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/40">{title}</h3>
      {children}
    </section>
  );
}

export default function PropertySearchPage() {
  const [q, setQ] = useState("");
  const [priceMin, setPriceMin] = useState(MIN_PRICE);
  const [priceMax, setPriceMax] = useState(MAX_PRICE);
  const [bedrooms, setBedrooms] = useState("Any");
  const [amenities, setAmenities] = useState(() => new Set());
  const [types, setTypes] = useState(() => new Set());
  const [typeQuery, setTypeQuery] = useState("");

  const isAuthed = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  const toggleAmenity = useCallback((id) => {
    setAmenities((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleType = useCallback((t) => {
    setTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setPriceMin(MIN_PRICE);
    setPriceMax(MAX_PRICE);
    setBedrooms("Any");
    setAmenities(new Set());
    setTypes(new Set());
    setTypeQuery("");
    setQ("");
  }, []);

  const onMinPrice = (v) => {
    const n = Number(v);
    const capped = Math.min(n, priceMax - PRICE_STEP);
    setPriceMin(Math.max(MIN_PRICE, capped));
  };

  const onMaxPrice = (v) => {
    const n = Number(v);
    const capped = Math.max(n, priceMin + PRICE_STEP);
    setPriceMax(Math.min(MAX_PRICE, capped));
  };

  const filteredTypes = useMemo(() => {
    const qq = typeQuery.trim().toLowerCase();
    if (!qq) return PROPERTY_TYPES;
    return PROPERTY_TYPES.filter((t) => t.toLowerCase().includes(qq));
  }, [typeQuery]);

  const filtered = useMemo(() => {
    return PUBLIC_LISTINGS.filter((p) => {
      const qq = q.trim().toLowerCase();
      if (qq) {
        const blob = `${p.title} ${p.loc} ${p.address}`.toLowerCase();
        if (!blob.includes(qq)) return false;
      }
      if (p.price < priceMin || p.price > priceMax) return false;
      if (bedrooms === "1" && p.beds !== 1) return false;
      if (bedrooms === "2" && p.beds !== 2) return false;
      if (bedrooms === "3+" && p.beds < 3) return false;
      if (types.size > 0 && !types.has(inferPropertyType(p))) return false;
      for (const a of amenities) {
        if (!listingMatchesAmenity(p, a)) return false;
      }
      return true;
    });
  }, [q, priceMin, priceMax, bedrooms, types, amenities]);

  const minPct = ((priceMin - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;
  const maxPct = ((priceMax - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;
  const activeFilterCount =
    (priceMin > MIN_PRICE || priceMax < MAX_PRICE ? 1 : 0) +
    (bedrooms !== "Any" ? 1 : 0) +
    amenities.size +
    types.size +
    (q.trim() ? 1 : 0);

  return (
    <div className="flex flex-col gap-6">
      {!isAuthed && (
        <div className="flex items-start gap-3 rounded-2xl border border-white/[0.1] bg-white/[0.04] p-4 text-sm text-white/65">
          <Lock className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#00C896]" />
          <div>
            <p className="font-bold text-white">Browse without signing in</p>
            <p className="mt-1 text-white/55">
              View listings and photos freely. To message a landlord, book a viewing, or pay rent,{" "}
              <Link to="/login" className="font-semibold text-[#00C896] hover:underline">
                sign in
              </Link>{" "}
              or{" "}
              <Link to="/register" className="font-semibold text-[#00C896] hover:underline">
                create an account
              </Link>
              .
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="card-glass h-fit w-full flex-shrink-0 overflow-hidden border border-white/[0.08] lg:sticky lg:top-4 lg:w-[22rem]">
          <div className="border-b border-white/[0.08] bg-white/[0.03] px-5 py-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00C896]/15 text-[#00C896]">
                  <SlidersHorizontal size={18} />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-white">Filters</div>
                  <div className="text-[11px] text-white/40">Refine your search</div>
                </div>
              </div>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] font-bold text-white/55 transition hover:border-[#00C896]/35 hover:text-[#00C896]"
                >
                  <X size={12} /> Clear
                </button>
              )}
            </div>
          </div>

          <div className="space-y-6 px-5 py-5">
            <FilterSection title="Price range (UGX / mo)">
              <div className="flex items-baseline justify-between text-xs font-bold text-white">
                <span className="text-[#00C896]">UGX {fmtPriceShort(priceMin)}</span>
                <span className="text-white/35">—</span>
                <span className="text-[#00C896]">
                  UGX {priceMax >= MAX_PRICE ? `${fmtPriceShort(MAX_PRICE)}+` : fmtPriceShort(priceMax)}
                </span>
              </div>
              <div className="relative py-2">
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#00C896]/40 to-[#00C896]"
                    style={{
                      marginLeft: `${minPct}%`,
                      width: `${Math.max(0, maxPct - minPct)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="block">
                  <span className="text-[10px] font-extrabold uppercase tracking-wide text-white/40">Minimum</span>
                  <input
                    type="range"
                    min={MIN_PRICE}
                    max={MAX_PRICE}
                    step={PRICE_STEP}
                    value={priceMin}
                    onChange={(e) => onMinPrice(e.target.value)}
                    className="mt-2 h-2 w-full cursor-pointer accent-[#00C896]"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-extrabold uppercase tracking-wide text-white/40">Maximum</span>
                  <input
                    type="range"
                    min={MIN_PRICE}
                    max={MAX_PRICE}
                    step={PRICE_STEP}
                    value={priceMax}
                    onChange={(e) => onMaxPrice(e.target.value)}
                    className="mt-2 h-2 w-full cursor-pointer accent-[#00C896]"
                  />
                </label>
              </div>
              <div className="mt-1 flex justify-between text-[10px] font-semibold text-white/30">
                <span>500K</span>
                <span>15M+</span>
              </div>
            </FilterSection>

            <div className="border-t border-white/[0.06]" />

            <FilterSection title="Bedrooms">
              <div className="flex flex-wrap gap-2">
                {["Any", "1", "2", "3+"].map((b) => {
                  const active = bedrooms === b;
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBedrooms(b)}
                      className={`min-w-[2.75rem] rounded-xl border px-3.5 py-2 text-xs font-extrabold transition ${
                        active
                          ? "border-[#00C896]/45 bg-[#00C896]/15 text-[#00C896] shadow-[0_0_0_1px_rgba(0,200,150,0.15)]"
                          : "border-white/10 bg-white/[0.04] text-white/55 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {b}
                    </button>
                  );
                })}
              </div>
            </FilterSection>

            <div className="border-t border-white/[0.06]" />

            <FilterSection title="Amenities">
              <div className="grid grid-cols-2 gap-2">
                {AMENITIES.map((row) => {
                  const on = amenities.has(row.id);
                  const AmenityIcon = row.icon;
                  return (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => toggleAmenity(row.id)}
                      title={row.hint}
                      className={`flex items-center gap-2 rounded-xl border px-2.5 py-2.5 text-left text-[11px] font-bold transition ${
                        on
                          ? "border-[#00C896]/40 bg-[#00C896]/12 text-white"
                          : "border-white/[0.08] bg-white/[0.03] text-white/55 hover:border-white/15 hover:text-white/80"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                          on ? "bg-[#00C896]/25 text-[#00C896]" : "bg-white/[0.06] text-white/40"
                        }`}
                      >
                        <AmenityIcon size={15} strokeWidth={2} />
                      </span>
                      <span className="min-w-0 leading-tight">{row.id}</span>
                    </button>
                  );
                })}
              </div>
            </FilterSection>

            <div className="border-t border-white/[0.06]" />

            <FilterSection title="Property type">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
                <input
                  value={typeQuery}
                  onChange={(e) => setTypeQuery(e.target.value)}
                  placeholder="Search types…"
                  className="w-full rounded-xl border border-white/[0.1] bg-black/25 py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-white/30 focus:border-[#00C896]/35"
                />
              </div>
              <div className="max-h-[220px] space-y-1.5 overflow-y-auto pr-1">
                {filteredTypes.length === 0 ? (
                  <p className="py-4 text-center text-xs text-white/40">No types match.</p>
                ) : (
                  filteredTypes.map((t) => {
                    const on = types.has(t);
                    return (
                      <label
                        key={t}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
                          on
                            ? "border-[#00C896]/35 bg-[#00C896]/10"
                            : "border-transparent bg-white/[0.03] hover:border-white/10"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => toggleType(t)}
                          className="h-3.5 w-3.5 shrink-0 rounded border-white/25 bg-white/5 text-[#00C896] focus:ring-[#00C896]/40"
                        />
                        <span className={`text-xs font-semibold ${on ? "text-white" : "text-white/60"}`}>{t}</span>
                      </label>
                    );
                  })
                )}
              </div>
              {types.size > 0 && (
                <p className="text-[10px] text-white/35">
                  {types.size} type{types.size === 1 ? "" : "s"} selected · category is inferred from title and description.
                </p>
              )}
            </FilterSection>
          </div>

          <div className="border-t border-white/[0.08] bg-white/[0.02] px-5 py-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-white/45">
              <Store size={14} className="text-[#00C896]/80" />
              Filters apply to the listings shown in this view.
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by area or keyword…"
              className="w-full rounded-2xl border border-white/[0.1] bg-white/[0.06] py-3.5 pl-11 pr-4 text-sm text-white outline-none ring-0 placeholder:text-white/35 focus:border-[#00C896]/40"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/40">
            <p>
              Showing <span className="font-bold text-white/75">{filtered.length}</span> of {PUBLIC_LISTINGS.length}{" "}
              listings
              {activeFilterCount > 0 && (
                <span className="ml-2 rounded-full bg-white/[0.08] px-2 py-0.5 font-bold text-white/55">
                  {activeFilterCount} filter{activeFilterCount === 1 ? "" : "s"}
                </span>
              )}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((p) => (
              <div key={p.id} className="group card-glass relative overflow-hidden border-white/[0.1] transition hover:border-[#00C896]/35">
                {isAuthed && user?.role === "tenant" && (
                  <div className="absolute right-3 top-3 z-10">
                    <ListingSaveButton listingId={p.id} compact />
                  </div>
                )}
                <Link to={`/property/${p.id}`} className="block">
                  <div className="relative h-40 overflow-hidden bg-[#0d1520]">
                    <img
                      src={p.image}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060a0e]/80 to-transparent" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-white">{p.title}</h3>
                      {p.verified && (
                        <span className="flex flex-shrink-0 items-center gap-1 rounded-full bg-[#00C896]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#00C896]">
                          <CheckCircle2 size={12} /> Verified
                        </span>
                      )}
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-xs text-white/45">
                      <MapPin size={12} className="flex-shrink-0 text-[#00C896]" /> {p.address}
                    </p>
                    <p className="mt-1.5 text-[11px] text-white/40">
                      {p.beds} bed{p.beds > 1 ? "s" : ""} · {p.baths} bath{p.baths > 1 ? "s" : ""} · ~{p.sqft} m² ·{" "}
                      <span className="text-white/50">{inferPropertyType(p)}</span>
                    </p>
                    <p className="mt-3 text-lg font-extrabold text-[#00C896]">
                      UGX {p.price.toLocaleString()}
                      <span className="text-xs font-semibold text-white/40">/mo</span>
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-14 text-center">
              <p className="text-sm font-bold text-white">No listings match these filters</p>
              <p className="mt-2 text-xs text-white/45">Try widening the price range or clearing amenity / type filters.</p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-xl bg-[#00C896] px-5 py-2.5 text-xs font-extrabold text-[#041208]"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
