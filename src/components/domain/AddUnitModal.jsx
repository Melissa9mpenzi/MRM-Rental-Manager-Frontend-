import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { propertiesApi } from "../../api/propertiesApi";
import { CATEGORY_TO_UNIT_TYPE } from "../../config/listingFilters";
import ListingDetailsFields from "./ListingDetailsFields";
import { Modal } from "../ui/index.jsx";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

export default function AddUnitModal({ open, onClose, propertyId }) {
  const qc = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
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

  const mutation = useMutation({
    mutationFn: (data) => {
      if (!data.amenities?.length) {
        throw new Error("Select at least one amenity.");
      }
      const unitType =
        data.unit_type || CATEGORY_TO_UNIT_TYPE[data.listing_category] || "one_bedroom";
      return propertiesApi.createUnit(propertyId, {
        ...data,
        unit_type: unitType,
        rent_amount: parseFloat(data.rent_amount),
        floor_number: parseInt(data.floor_number, 10) || 0,
        bedrooms: parseInt(data.bedrooms, 10),
        bathrooms: parseInt(data.bathrooms, 10),
        area_sqm: parseFloat(data.area_sqm),
        status: data.status || "vacant",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["property", propertyId] });
      qc.invalidateQueries({ queryKey: ["marketplace-listings"] });
      toast.success("Listing published — visible in search when vacant.");
      reset();
      onClose();
    },
    onError: (err) => toast.error(err.message || err.response?.data?.detail || "Failed to add unit."),
  });

  const onSubmit = (d) => {
    if (!d.amenities?.length) {
      toast.error("Select at least one amenity.");
      return;
    }
    mutation.mutate(d);
  };

  return (
    <Modal open={open} onClose={onClose} title="Add listing (unit)" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Unit code/name"
            placeholder="e.g. A1, E2, Shop G3"
            required
            error={errors.unit_number?.message}
            {...register("unit_number", { required: "Unit number is required" })}
          />
          <Input label="Floor number" type="number" placeholder="0 = Ground floor, 1 = First floor" {...register("floor_number")} />
        </div>
        <p className="text-[11px] text-brand-mid">
          A unit can be an apartment, office, or shop. Keep your own labels (for example A1-E2 or Shop-01).
        </p>

        <ListingDetailsFields
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          selectedAmenities={selectedAmenities}
          onToggleAmenity={toggleAmenity}
        />

        <div className="w-full">
          <label className="input-label">Initial status</label>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {["vacant", "occupied", "maintenance"].map((s) => {
              const selected = watch("status") === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setValue("status", s)}
                  className={`rounded-lg border-2 px-3 py-2 text-xs font-bold capitalize transition ${
                    selected
                      ? "border-brand-teal bg-brand-tealLt text-brand-teal"
                      : "border-gray-300 text-gray-600 hover:border-brand-teal"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
          <input type="hidden" {...register("status")} />
          <p className="mt-1 text-[11px] text-brand-mid">Only <strong>vacant</strong> units appear on the public marketplace.</p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" fullWidth loading={mutation.isPending}>
            Publish unit
          </Button>
        </div>
      </form>
    </Modal>
  );
}
