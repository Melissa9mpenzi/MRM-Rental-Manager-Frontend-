import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ImagePlus, Video, X, ChevronRight, ChevronLeft, Building2 } from "lucide-react";
import { propertiesApi } from "../../api/propertiesApi";
import { CATEGORY_TO_UNIT_TYPE } from "../../config/listingFilters";
import ListingDetailsFields from "./ListingDetailsFields";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

const DISTRICTS = [
  "Kampala", "Wakiso", "Mukono", "Entebbe", "Jinja", "Mbarara",
  "Gulu", "Lira", "Masaka", "Fort Portal", "Mbale", "Soroti",
];

const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov";

/**
 * Two-step landlord property + first unit wizard.
 * @param {"page"|"modal"} mode — full-page card vs compact modal body
 */
export default function AddPropertyForm({ mode = "page", onCancel, onSuccess }) {
  const qc = useQueryClient();
  const fileRef = useRef();
  const videoRef = useRef();
  const [step, setStep] = useState(1);
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      district: "Kampala",
      unit_type: "one_bedroom",
      floor_number: 0,
      amenities: [],
      status: "vacant",
      bedrooms: 1,
      bathrooms: 1,
      listing_category: "",
    },
  });

  const selectedAmenities = watch("amenities") || [];

  const toggleAmenity = (id) => {
    const current = selectedAmenities;
    const updated = current.includes(id) ? current.filter((a) => a !== id) : [...current, id];
    setValue("amenities", updated, { shouldValidate: true });
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      if (!data.amenities?.length) throw new Error("Select at least one amenity.");
      const prop = await propertiesApi.create({
        name: data.name,
        address: data.address,
        parish: data.parish,
        district: data.district,
        description: data.description,
      });
      if (imageFile) await propertiesApi.uploadPhoto(prop.id, imageFile);
      if (videoFile) await propertiesApi.uploadVideo(prop.id, videoFile);
      const unitType = data.unit_type || CATEGORY_TO_UNIT_TYPE[data.listing_category] || "one_bedroom";
      await propertiesApi.createUnit(prop.id, {
        unit_number: data.unit_number,
        floor_number: parseInt(data.floor_number, 10) || 0,
        unit_type: unitType,
        listing_category: data.listing_category,
        bedrooms: parseInt(data.bedrooms, 10),
        bathrooms: parseInt(data.bathrooms, 10),
        area_sqm: parseFloat(data.area_sqm),
        rent_amount: parseFloat(data.rent_amount),
        amenities: data.amenities,
        description: data.unit_description || data.description,
        status: "vacant",
      });
      return prop;
    },
    onSuccess: (prop) => {
      qc.invalidateQueries({ queryKey: ["properties"] });
      qc.invalidateQueries({ queryKey: ["marketplace-listings"] });
      toast.success("Property listed — tenants can browse it now. KCCA approval adds the verified badge.");
      reset();
      setPreview(null);
      setImageFile(null);
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      setVideoPreview(null);
      setVideoFile(null);
      setStep(1);
      onSuccess?.(prop);
    },
    onError: (err) => toast.error(err.message || err.response?.data?.detail || "Failed to add property."),
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setPreview(null);
    setImageFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_VIDEO_BYTES) {
      toast.error("Video must be 50MB or smaller.");
      if (videoRef.current) videoRef.current.value = "";
      return;
    }
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const removeVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(null);
    setVideoFile(null);
    if (videoRef.current) videoRef.current.value = "";
  };

  const goStep2 = async () => {
    const ok = await trigger(["name", "address"]);
    if (ok) setStep(2);
  };

  const onFinalSubmit = (d) => {
    if (!d.amenities?.length) {
      toast.error("Select at least one amenity.");
      return;
    }
    createMutation.mutate(d);
  };

  const handleCancel = () => {
    setStep(1);
    onCancel?.();
  };

  const isPage = mode === "page";

  return (
    <div className={`add-property-form ${isPage ? "add-property-form--page" : ""}`}>
      {isPage && (
        <header className="add-property-form__header">
          <div className="add-property-form__icon">
            <Building2 size={22} strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="add-property-form__title">Add property</h1>
            <p className="add-property-form__subtitle">
              Step {step} of 2 — {step === 1 ? "Building details" : "First listing for marketplace"}
            </p>
          </div>
        </header>
      )}

      <div className="add-property-form__steps" aria-hidden>
        <div className={`add-property-form__step ${step >= 1 ? "add-property-form__step--active" : ""}`}>
          <span className="add-property-form__step-num">1</span>
          <span>Building</span>
        </div>
        <div className="add-property-form__step-line" />
        <div className={`add-property-form__step ${step >= 2 ? "add-property-form__step--active" : ""}`}>
          <span className="add-property-form__step-num">2</span>
          <span>Listing</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onFinalSubmit)} className="space-y-4" noValidate>
        {step === 1 && (
          <>
            <div>
              <label className="input-label">
                Property photo <span className="font-normal normal-case text-white/40">(recommended)</span>
              </label>
              {preview ? (
                <div className="relative h-40 overflow-hidden rounded-xl border border-brand-teal/30">
                  <img src={preview} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white shadow-lg backdrop-blur-sm hover:bg-black/80"
                    aria-label="Remove photo"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/15 bg-white/[0.03] text-white/50 transition-colors hover:border-brand-teal/40 hover:bg-brand-teal/5 hover:text-white/70"
                >
                  <ImagePlus size={24} className="text-brand-teal/80" />
                  <span className="text-sm font-semibold">Upload cover photo</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
            </div>

            <div>
              <label className="input-label">
                Property video <span className="font-normal normal-case text-white/40">(optional)</span>
              </label>
              <p className="mb-2 text-[11px] text-white/40">MP4, WebM, or MOV — max 50MB. Great for walk-through tours.</p>
              {videoPreview ? (
                <div className="relative overflow-hidden rounded-xl border border-violet-500/30 bg-black/40">
                  <video
                    src={videoPreview}
                    controls
                    className="max-h-48 w-full"
                    playsInline
                    preload="metadata"
                  />
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white shadow-lg backdrop-blur-sm hover:bg-black/80"
                    aria-label="Remove video"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => videoRef.current?.click()}
                  className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/15 bg-white/[0.03] text-white/50 transition-colors hover:border-violet-500/40 hover:bg-violet-500/5 hover:text-white/70"
                >
                  <Video size={22} className="text-violet-300/80" />
                  <span className="text-sm font-semibold">Upload property video</span>
                </button>
              )}
              <input
                ref={videoRef}
                type="file"
                accept={VIDEO_ACCEPT}
                className="hidden"
                onChange={handleVideoChange}
              />
            </div>

            <Input
              label="Property name"
              placeholder="e.g. Ssemakula Apartments"
              required
              error={errors.name?.message}
              {...register("name", { required: "Property name is required" })}
            />
            <Input
              label="Physical address"
              placeholder="e.g. Plot 45, Bukoto Street"
              required
              error={errors.address?.message}
              {...register("address", { required: "Address is required" })}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="Parish / Zone" placeholder="e.g. Bukoto" {...register("parish")} />
              <div>
                <label className="input-label">District</label>
                <select className="select-field w-full" {...register("district")}>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="input-label">Building notes</label>
              <textarea
                className="input-field min-h-[72px] resize-none"
                placeholder="Compound, gates, shared facilities…"
                {...register("description")}
              />
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
              <Button type="button" variant="ghost" fullWidth onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="button" fullWidth onClick={goStep2}>
                Next: listing details
                <ChevronRight size={16} className="ml-1 inline" />
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs leading-relaxed text-white/60">
              <Building2 size={18} className="mt-0.5 flex-shrink-0 text-brand-teal" />
              <p>
                Complete every field so tenants can find this unit using marketplace filters (price, bedrooms, type, amenities).
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="First unit code/name"
                placeholder="e.g. A1, B-02, Shop G3"
                required
                error={errors.unit_number?.message}
                {...register("unit_number", { required: "Unit number is required" })}
              />
              <Input label="Floor number" type="number" placeholder="0 = Ground floor, 1 = First floor" {...register("floor_number")} />
            </div>
            <p className="text-[11px] text-white/45">
              Use any naming format for units (A1-E2, 101-112, Shop-01). Add more units later from the property details page.
            </p>

            <ListingDetailsFields
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
              selectedAmenities={selectedAmenities}
              onToggleAmenity={toggleAmenity}
            />

            <div>
              <label className="input-label">Unit-specific description</label>
              <textarea
                className="input-field min-h-[72px] resize-none"
                placeholder="Details for this unit only…"
                {...register("unit_description")}
              />
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
              <Button type="button" variant="ghost" fullWidth onClick={() => setStep(1)}>
                <ChevronLeft size={16} className="mr-1 inline" />
                Back
              </Button>
              <Button type="submit" fullWidth loading={createMutation.isPending}>
                Publish property & listing
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
