import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ImagePlus, X, ChevronRight, ChevronLeft, Building2 } from "lucide-react";
import { propertiesApi } from "../../api/propertiesApi";
import { CATEGORY_TO_UNIT_TYPE } from "../../config/listingFilters";
import ListingDetailsFields from "./ListingDetailsFields";
import { Modal } from "../ui/index.jsx";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

const DISTRICTS = [
  "Kampala", "Wakiso", "Mukono", "Entebbe", "Jinja", "Mbarara",
  "Gulu", "Lira", "Masaka", "Fort Portal", "Mbale", "Soroti",
];

export default function AddPropertyModal({ open, onClose }) {
  const qc = useQueryClient();
  const fileRef = useRef();
  const [step, setStep] = useState(1);
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties"] });
      qc.invalidateQueries({ queryKey: ["marketplace-listings"] });
      toast.success("Property and first listing published!");
      reset();
      setPreview(null);
      setImageFile(null);
      setStep(1);
      onClose();
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

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={step === 1 ? "Add property — building details" : "Add property — first listing"}
      size="lg"
    >
      <div className="mb-4 flex items-center gap-2 text-xs font-bold text-white/45">
        <span className={step === 1 ? "text-[#00C896]" : ""}>1. Building</span>
        <ChevronRight size={14} />
        <span className={step === 2 ? "text-[#00C896]" : ""}>2. Listing (filters)</span>
      </div>

      <form onSubmit={handleSubmit(onFinalSubmit)} className="space-y-4" noValidate>
        {step === 1 && (
          <>
            <div>
              <label className="input-label">
                Property photo <span className="font-normal text-brand-mid">(recommended)</span>
              </label>
              {preview ? (
                <div className="relative h-40 overflow-hidden rounded-lg border border-brand-tealLt">
                  <img src={preview} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute right-2 top-2 rounded-full bg-white p-1 shadow"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-brand-tealLt text-brand-mid hover:bg-brand-tealLt/30"
                >
                  <ImagePlus size={24} />
                  <span className="text-sm font-semibold">Upload cover photo</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
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
            <div className="grid grid-cols-2 gap-3">
              <Input label="Parish / Zone" placeholder="e.g. Bukoto" {...register("parish")} />
              <div>
                <label className="input-label">District</label>
                <select className="input-field" {...register("district")}>
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
              <textarea className="input-field min-h-[60px] resize-none" placeholder="Compound, gates, shared facilities…" {...register("description")} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" fullWidth onClick={handleClose}>
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
            <div className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-3 text-xs text-white/60">
              <Building2 size={18} className="mt-0.5 flex-shrink-0 text-brand-teal" />
              <p>
                Complete every field below so tenants can find this unit using marketplace filters (price, bedrooms, type, amenities).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First unit number"
                placeholder="e.g. A1"
                required
                error={errors.unit_number?.message}
                {...register("unit_number", { required: "Unit number is required" })}
              />
              <Input label="Floor" type="number" {...register("floor_number")} />
            </div>

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
                className="input-field min-h-[60px] resize-none"
                placeholder="Details for this unit only…"
                {...register("unit_description")}
              />
            </div>

            <div className="flex gap-3 pt-2">
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
    </Modal>
  );
}
