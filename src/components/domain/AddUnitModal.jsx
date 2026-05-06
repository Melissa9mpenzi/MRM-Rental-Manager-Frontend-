import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { propertiesApi } from "../../api/propertiesApi";
import { Modal } from "../ui/index.jsx";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

const UNIT_TYPES = [
  { value: "bedsitter",     label: "Bedsitter" },
  { value: "studio",        label: "Studio" },
  { value: "one_bedroom",   label: "1 Bedroom" },
  { value: "two_bedroom",   label: "2 Bedroom" },
  { value: "three_bedroom", label: "3 Bedroom" },
  { value: "shop",          label: "Shop / Commercial" },
  { value: "office",        label: "Office" },
  { value: "other",         label: "Other" },
];

const AMENITIES = [
  "Water included", "Electricity included", "Parking",
  "Generator", "Security", "WiFi", "Balcony", "Servant quarters",
];

export default function AddUnitModal({ open, onClose, propertyId }) {
  const qc = useQueryClient();
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: { unit_type: "one_bedroom", floor_number: 0, amenities: [], status: "vacant" },
  });

  const selectedAmenities = watch("amenities") || [];

  const toggleAmenity = (amenity) => {
    const current = selectedAmenities;
    const updated = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];
    setValue("amenities", updated);
  };

  const mutation = useMutation({
    mutationFn: (data) =>
      propertiesApi.createUnit(propertyId, {
        ...data,
        rent_amount: parseFloat(data.rent_amount),
        floor_number: parseInt(data.floor_number) || 0,
        status: data.status || "vacant",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["property", propertyId] });
      toast.success("Unit added!");
      reset();
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.detail || "Failed to add unit."),
  });

  return (
    <Modal open={open} onClose={onClose} title="Add Unit" size="lg">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Unit number"
            placeholder="e.g. A1 or 101"
            required
            error={errors.unit_number?.message}
            {...register("unit_number", { required: "Unit number is required" })}
          />
          <Input
            label="Floor"
            type="number"
            placeholder="0 = Ground floor"
            {...register("floor_number")}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="w-full">
            <label className="input-label">Unit type</label>
            <select className="input-field" {...register("unit_type")}>
              {UNIT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <Input
            label="Monthly rent (UGX)"
            type="number"
            placeholder="e.g. 350000"
            required
            error={errors.rent_amount?.message}
            {...register("rent_amount", {
              required: "Rent is required",
              min: { value: 1, message: "Must be greater than 0" },
            })}
          />
        </div>

        {/* Status */}
        <div className="w-full">
          <label className="input-label">Initial status</label>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {[
              { value: "vacant",      label: "Vacant",      color: "border-gray-300 text-gray-600",   active: "border-brand-teal bg-brand-tealLt text-brand-teal" },
              { value: "occupied",    label: "Occupied",    color: "border-gray-300 text-gray-600",   active: "border-brand-teal bg-brand-tealLt text-brand-teal" },
              { value: "maintenance", label: "Maintenance", color: "border-gray-300 text-gray-600",   active: "border-amber-400 bg-amber-50 text-amber-700" },
            ].map((s) => {
              const selected = watch("status") === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setValue("status", s.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border-2 transition-colors ${selected ? s.active : s.color + " hover:border-brand-teal"}`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
          <input type="hidden" {...register("status")} />
        </div>

        {/* Amenities */}
        <div>
          <label className="input-label">Amenities <span className="text-brand-mid font-normal">(optional)</span></label>
          <div className="flex flex-wrap gap-2 mt-1">
            {AMENITIES.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors
                  ${selectedAmenities.includes(a)
                    ? "bg-brand-teal text-white border-brand-teal"
                    : "bg-white text-brand-mid border-brand-mid/30 hover:border-brand-teal hover:text-brand-teal"
                  }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full">
          <label className="input-label">Notes <span className="text-brand-mid font-normal">(optional)</span></label>
          <textarea
            className="input-field resize-none min-h-[60px]"
            placeholder="Any notes about this unit..."
            {...register("description")}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" fullWidth onClick={onClose}>Cancel</Button>
          <Button type="submit" fullWidth loading={mutation.isPending}>Add Unit</Button>
        </div>
      </form>
    </Modal>
  );
}