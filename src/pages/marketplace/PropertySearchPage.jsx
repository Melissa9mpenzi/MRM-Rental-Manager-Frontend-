import { useMemo, useState, useCallback, useDeferredValue } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, MapPin, CheckCircle2, Lock, X, Store } from "lucide-react";
import GovernmentComplianceBadges from "../../components/government/GovernmentComplianceBadges";
import PropertyVerificationBadges from "../../components/blockchain/PropertyVerificationBadges";
import { marketplaceApi } from "../../api/marketplaceApi";
import ListingPhoto from "../../components/domain/ListingPhoto";
import useAuthStore from "../../store/authStore";
import ListingSaveButton from "../../components/domain/ListingSaveButton";
import {
  LISTING_PRICE_MIN,
  LISTING_PRICE_MAX,
  LISTING_PRICE_STEP,
  LISTING_PROPERTY_TYPES,
  LISTING_AMENITIES,
  fmtPriceShort,
  inferListingCategory,
  listingHasAmenity,
  CATEGORY_TO_UNIT_TYPE,
} from "../../config/listingFilters";
import "../../styles/marketplace-filters.css";

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
  const [priceMin, setPriceMin] = useState(LISTING_PRICE_MIN);
  const [priceMax, setPriceMax] = useState(LISTING_PRICE_MAX);
  const [bedrooms, setBedrooms] = useState("Any");
  const [amenities, setAmenities] = useState(() => new Set());
  const [types, setTypes] = useState(() => new Set());
  const [typeQuery, setTypeQuery] = useState("");

  const deferredQ = useDeferredValue(q);

  const apiUnitType = useMemo(() => {
    if (types.size !== 1) return undefined;
    return CATEGORY_TO_UNIT_TYPE[[...types][0]];
  }, [types]);

  const apiCategory = useMemo(() => {
    if (types.size !== 1) return undefined;
    return [...types][0];
  }, [types]);

  const minBedrooms = useMemo(() => {
    if (bedrooms === "1") return 1;
    if (bedrooms === "2") return 2;
    if (bedrooms === "3+") return 3;
    return undefined;
  }, [bedrooms]);

  const amenityList = useMemo(() => [...amenities], [amenities]);

  const { data: listings = [], isLoading, isError } = useQuery({
    queryKey: [
      "marketplace-listings",
      deferredQ.trim(),
      priceMin,
      priceMax,
      apiUnitType,
      apiCategory,
      minBedrooms,
      amenityList.join(","),
    ],
    queryFn: () =>
      marketplaceApi.list({
        search: deferredQ.trim(),
        min_rent: priceMin,
        max_rent: priceMax,
        unit_type: apiUnitType,
        listing_category: apiCategory,
        min_bedrooms: minBedrooms,
        amenities: amenityList,
      }),
    staleTime: 20_000,
  });

  const rows = Array.isArray(listings) ? listings : [];
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
    setPriceMin(LISTING_PRICE_MIN);
    setPriceMax(LISTING_PRICE_MAX);
    setBedrooms("Any");
    setAmenities(new Set());
    setTypes(new Set());
    setTypeQuery("");
    setQ("");
  }, []);

  const onMinPrice = (v) => {
    const n = Number(v);
    setPriceMin(Math.max(LISTING_PRICE_MIN, Math.min(n, priceMax - LISTING_PRICE_STEP)));
  };

  const onMaxPrice = (v) => {
    const n = Number(v);
    setPriceMax(Math.min(LISTING_PRICE_MAX, Math.max(n, priceMin + LISTING_PRICE_STEP)));
  };

  const filteredTypes = useMemo(() => {
    const qq = typeQuery.trim().toLowerCase();
    if (!qq) return LISTING_PROPERTY_TYPES;
    return LISTING_PROPERTY_TYPES.filter((t) => t.toLowerCase().includes(qq));
  }, [typeQuery]);

  const filtered = useMemo(() => {
    return rows.filter((p) => {
      const qq = q.trim().toLowerCase();
      if (qq) {
        const blob = `${p.title} ${p.loc} ${p.address}`.toLowerCase();
        if (!blob.includes(qq)) return false;
      }
      if (p.price < priceMin || p.price > priceMax) return false;
      if (bedrooms === "1" && p.beds !== 1) return false;
      if (bedrooms === "2" && p.beds !== 2) return false;
      if (bedrooms === "3+" && p.beds < 3) return false;
      if (types.size > 0 && !types.has(inferListingCategory(p))) return false;
      for (const a of amenities) {
        if (!listingHasAmenity(p, a)) return false;
      }
      return true;
    });
  }, [q, priceMin, priceMax, bedrooms, types, amenities, rows]);

  const minPct = ((priceMin - LISTING_PRICE_MIN) / (LISTING_PRICE_MAX - LISTING_PRICE_MIN)) * 100;
  const maxPct = ((priceMax - LISTING_PRICE_MIN) / (LISTING_PRICE_MAX - LISTING_PRICE_MIN)) * 100;
  const activeFilterCount =
    (priceMin > LISTING_PRICE_MIN || priceMax < LISTING_PRICE_MAX ? 1 : 0) +
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
              View listings freely. To message, book a viewing, or pay rent,{" "}
              <Link to="/login" className="font-semibold text-[#00C896] hover:underline">
                sign in
              </Link>
              .
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="card-glass marketplace-filters-panel w-full flex-shrink-0 border border-white/[0.08] lg:sticky lg:top-4 lg:w-[22.5rem]">
          <div className="marketplace-filters-panel__header border-b border-white/[0.08] bg-white/[0.03] px-5 py-4">
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

          <div className="marketplace-filters-panel__body space-y-6">
            <FilterSection title="Price range (UGX / mo)">
              <div className="flex items-baseline justify-between text-xs font-bold text-white">
                <span className="text-[#00C896]">UGX {fmtPriceShort(priceMin)}</span>
                <span className="text-white/35">—</span>
                <span className="text-[#00C896]">
                  UGX {priceMax >= LISTING_PRICE_MAX ? `${fmtPriceShort(LISTING_PRICE_MAX)}+` : fmtPriceShort(priceMax)}
                </span>
              </div>
              <div className="relative py-1">
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#00C896]/40 to-[#00C896]"
                    style={{ marginLeft: `${minPct}%`, width: `${Math.max(0, maxPct - minPct)}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[10px] font-extrabold uppercase tracking-wide text-white/40">Minimum</span>
                  <input
                    type="range"
                    min={LISTING_PRICE_MIN}
                    max={LISTING_PRICE_MAX}
                    step={LISTING_PRICE_STEP}
                    value={priceMin}
                    onChange={(e) => onMinPrice(e.target.value)}
                    className="mt-2 h-2 w-full cursor-pointer accent-[#00C896]"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-extrabold uppercase tracking-wide text-white/40">Maximum</span>
                  <input
                    type="range"
                    min={LISTING_PRICE_MIN}
                    max={LISTING_PRICE_MAX}
                    step={LISTING_PRICE_STEP}
                    value={priceMax}
                    onChange={(e) => onMaxPrice(e.target.value)}
                    className="mt-2 h-2 w-full cursor-pointer accent-[#00C896]"
                  />
                </label>
              </div>
              <div className="flex justify-between text-[10px] font-semibold text-white/30">
                <span>500K</span>
                <span>15M+</span>
              </div>
            </FilterSection>

            <div className="border-t border-white/[0.06]" />

            <FilterSection title="Bedrooms">
              <div className="flex flex-wrap gap-2">
                {["Any", "1", "2", "3+"].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBedrooms(b)}
                    className={`min-w-[2.75rem] rounded-xl border px-3.5 py-2 text-xs font-extrabold transition ${
                      bedrooms === b
                        ? "border-[#00C896]/45 bg-[#00C896]/15 text-[#00C896]"
                        : "border-white/10 bg-white/[0.04] text-white/55 hover:border-white/20"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </FilterSection>

            <div className="border-t border-white/[0.06]" />

            <FilterSection title="Amenities">
              <div className="grid grid-cols-2 gap-2">
                {LISTING_AMENITIES.map((row) => {
                  const on = amenities.has(row.id);
                  const Icon = row.icon;
                  return (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => toggleAmenity(row.id)}
                      title={row.hint}
                      className={`flex items-center gap-2 rounded-xl border px-2.5 py-2.5 text-left text-[11px] font-bold transition ${
                        on
                          ? "border-[#00C896]/40 bg-[#00C896]/12 text-white"
                          : "border-white/[0.08] bg-white/[0.03] text-white/55 hover:border-white/15"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                          on ? "bg-[#00C896]/25 text-[#00C896]" : "bg-white/[0.06] text-white/40"
                        }`}
                      >
                        <Icon size={15} />
                      </span>
                      <span>{row.id}</span>
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
              <div className="marketplace-filters-types space-y-1.5">
                {filteredTypes.length === 0 ? (
                  <p className="py-4 text-center text-xs text-white/40">No types match.</p>
                ) : (
                  filteredTypes.map((t) => {
                    const on = types.has(t);
                    return (
                      <label
                        key={t}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
                          on ? "border-[#00C896]/35 bg-[#00C896]/10" : "border-transparent bg-white/[0.03] hover:border-white/10"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => toggleType(t)}
                          className="h-3.5 w-3.5 shrink-0 rounded accent-[#00C896]"
                        />
                        <span className={`text-xs font-semibold ${on ? "text-white" : "text-white/60"}`}>{t}</span>
                      </label>
                    );
                  })
                )}
              </div>
              {types.size > 0 && (
                <p className="text-[10px] text-white/35">{types.size} type{types.size === 1 ? "" : "s"} selected</p>
              )}
            </FilterSection>
          </div>

          <div className="marketplace-filters-panel__footer border-t border-white/[0.08] bg-white/[0.02] px-5 py-3">
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
              className="w-full rounded-2xl border border-white/[0.1] bg-white/[0.06] py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#00C896]/40"
            />
          </div>

          <p className="text-xs text-white/40">
            Showing <span className="font-bold text-white/75">{filtered.length}</span> of {rows.length} listings
            {isLoading && <span className="ml-2">(loading…)</span>}
            {activeFilterCount > 0 && (
              <span className="ml-2 rounded-full bg-white/[0.08] px-2 py-0.5 font-bold text-white/55">
                {activeFilterCount} active
              </span>
            )}
          </p>

          {isError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              Could not load listings. Check that the backend is running.
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="group card-glass relative overflow-hidden border-white/[0.1] transition hover:border-[#00C896]/35"
              >
                {isAuthed && user?.role === "tenant" && (
                  <div className="absolute right-3 top-3 z-10">
                    <ListingSaveButton listingId={p.id} compact />
                  </div>
                )}
                <Link to={`/property/${p.id}`} className="block">
                  <div className="relative h-40 overflow-hidden bg-[#0d1520]">
                    <ListingPhoto path={p.image} wrapperClassName="h-40" emptyLabel="No photo" />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060a0e]/80 to-transparent" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-white">{p.title}</h3>
                      <GovernmentComplianceBadges
                        compliance={p.compliance}
                        compact
                        className="flex-shrink-0 justify-end"
                      />
                    </div>
                    <PropertyVerificationBadges
                      property={p}
                      compact
                      showLinks={false}
                      className="mt-2"
                    />
                    <p className="mt-1 flex items-center gap-1 text-xs text-white/45">
                      <MapPin size={12} className="text-[#00C896]" /> {p.address}
                    </p>
                    <p className="mt-1.5 text-[11px] text-white/40">
                      {p.beds} bed{p.beds > 1 ? "s" : ""} · {p.baths} bath · {p.sqft ? `${p.sqft} m²` : "—"} ·{" "}
                      {inferListingCategory(p)}
                    </p>
                    <p className="mt-3 text-lg font-extrabold text-[#00C896]">
                      UGX {Number(p.price || 0).toLocaleString()}
                      <span className="text-xs font-semibold text-white/40">/mo</span>
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {filtered.length === 0 && !isLoading && (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-14 text-center">
              <p className="text-sm font-bold text-white">
                {rows.length === 0 ? "No rentals available yet" : "No listings match these filters"}
              </p>
              <p className="mt-2 text-xs text-white/45">
                {rows.length === 0 ? (
                  <>
                    Listings need a <strong className="text-white/70">vacant unit with monthly rent</strong>, landlord{" "}
                    <strong className="text-white/70">NIRA KYC approved</strong>, and property marked active. New
                    properties show here while <strong className="text-white/70">KCCA review is pending</strong>.
                  </>
                ) : (
                  "Widen price range or clear amenity / type filters."
                )}
              </p>
              {rows.length === 0 ? null : (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-xl bg-[#00C896] px-5 py-2.5 text-xs font-extrabold text-[#041208]"
                >
                  Reset filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
