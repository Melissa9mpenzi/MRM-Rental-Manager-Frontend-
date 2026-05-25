import { LISTING_AMENITIES, LISTING_PROPERTY_TYPES, UNIT_TYPE_OPTIONS } from "../../config/listingFilters";

/**
 * Shared fields for a marketplace listing (unit) — matches browse filters.
 */
export default function ListingDetailsFields({
  register,
  errors = {},
  watch,
  setValue,
  selectedAmenities = [],
  onToggleAmenity,
}) {
  const category = watch?.("listing_category");

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#00C896]/20 bg-[#00C896]/5 px-3 py-2.5 text-xs text-white/65">
        <strong className="text-[#00C896]">Marketplace listing.</strong> These details power search filters (price, beds, type, amenities).
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 w-full">
          <label className="input-label">
            Property type (marketplace) <span className="text-red-400">*</span>
          </label>
          <select
            className="select-field w-full"
            {...register("listing_category", { required: "Property type is required" })}
          >
            <option value="">Select type…</option>
            {LISTING_PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.listing_category && (
            <p className="mt-1 text-xs text-red-400">{errors.listing_category.message}</p>
          )}
        </div>

        <div className="w-full">
          <label className="input-label">Unit type (internal)</label>
          <select className="select-field w-full" {...register("unit_type")}>
            {UNIT_TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full">
          <label className="input-label">
            Monthly rent (UGX) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            className="input-field"
            placeholder="e.g. 850000"
            {...register("rent_amount", {
              required: "Rent is required",
              min: { value: 500000, message: "Min UGX 500,000 for marketplace" },
            })}
          />
          {errors.rent_amount && <p className="mt-1 text-xs text-red-400">{errors.rent_amount.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="input-label">
            Bedrooms <span className="text-red-400">*</span>
          </label>
          <select className="input-field" {...register("bedrooms", { required: "Required", valueAsNumber: true })}>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4+</option>
          </select>
        </div>
        <div>
          <label className="input-label">
            Bathrooms <span className="text-red-400">*</span>
          </label>
          <select className="input-field" {...register("bathrooms", { required: "Required", valueAsNumber: true })}>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3+</option>
          </select>
        </div>
        <div>
          <label className="input-label">
            Area (m²) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            className="input-field"
            placeholder="e.g. 65"
            {...register("area_sqm", {
              required: "Area is required",
              min: { value: 10, message: "Min 10 m²" },
              valueAsNumber: true,
            })}
          />
          {errors.area_sqm && <p className="mt-1 text-xs text-red-400">{errors.area_sqm.message}</p>}
        </div>
      </div>

      <div>
        <label className="input-label">
          Amenities <span className="text-red-400">*</span>
          <span className="font-normal text-brand-mid"> (select all that apply)</span>
        </label>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {LISTING_AMENITIES.map((row) => {
            const on = selectedAmenities.includes(row.id);
            const Icon = row.icon;
            return (
              <button
                key={row.id}
                type="button"
                title={row.hint}
                onClick={() => onToggleAmenity(row.id)}
                className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-xs font-bold transition ${
                  on
                    ? "border-brand-teal bg-brand-teal/15 text-brand-teal"
                    : "border-white/12 bg-white/[0.04] text-white/60 hover:border-brand-teal/40"
                }`}
              >
                <Icon size={14} />
                {row.id}
              </button>
            );
          })}
        </div>
        {errors.amenities && <p className="mt-1 text-xs text-red-400">{errors.amenities.message}</p>}
        {!selectedAmenities.length && category && (
          <p className="mt-1 text-xs text-amber-400/90">Select at least one amenity tenants can filter by.</p>
        )}
      </div>

      <div>
        <label className="input-label">Listing description</label>
        <textarea
          className="input-field min-h-[72px] resize-none"
          placeholder="Describe the unit — mention WiFi, parking, furnished status if relevant…"
          {...register("description")}
        />
      </div>
    </div>
  );
}
