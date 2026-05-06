import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { ImagePlus, X } from "lucide-react";
import { propertiesApi } from "../../api/propertiesApi";
import { Modal } from "../ui/index.jsx";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

const DISTRICTS = [
  "Kampala","Wakiso","Mukono","Entebbe","Jinja","Mbarara",
  "Gulu","Lira","Masaka","Fort Portal","Mbale","Soroti",
];

export default function AddPropertyModal({ open, onClose }) {
  const qc = useQueryClient();
  const fileRef = useRef();
  const [preview, setPreview]   = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { district: "Kampala" },
  });

  const createMutation = useMutation({
    mutationFn: async (formData) => {
      // 1. Create property
      const prop = await propertiesApi.create(formData);
      // 2. Upload photo if selected
      if (imageFile) {
        await propertiesApi.uploadPhoto(prop.id, imageFile);
      }
      return prop;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties"] });
      toast.success("Property added!");
      reset();
      setPreview(null);
      setImageFile(null);
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.detail || "Failed to add property."),
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

  return (
    <Modal open={open} onClose={onClose} title="Add New Property">
      <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4" noValidate>

        {/* Photo upload */}
        <div>
          <label className="input-label">Property photo <span className="text-brand-mid font-normal">(optional)</span></label>
          {preview ? (
            <div className="relative rounded-lg overflow-hidden h-40 border border-brand-tealLt">
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md text-brand-mid hover:text-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-brand-tealLt rounded-lg flex flex-col items-center justify-center gap-2
                text-brand-mid hover:border-brand-teal hover:text-brand-teal hover:bg-brand-tealLt/30 transition-colors"
            >
              <ImagePlus size={24} />
              <span className="text-sm font-semibold">Click to upload photo</span>
              <span className="text-xs">JPEG, PNG or WebP</span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageChange}
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

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Parish / Zone"
            placeholder="e.g. Bukoto"
            {...register("parish")}
          />
          <div className="w-full">
            <label className="input-label">District</label>
            <select className="input-field" {...register("district")}>
              {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="w-full">
          <label className="input-label">Description <span className="text-brand-mid font-normal">(optional)</span></label>
          <textarea
            className="input-field min-h-[70px] resize-none"
            placeholder="Any notes about this property..."
            {...register("description")}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" fullWidth onClick={onClose}>Cancel</Button>
          <Button type="submit" fullWidth loading={createMutation.isPending}>Add Property</Button>
        </div>
      </form>
    </Modal>
  );
}