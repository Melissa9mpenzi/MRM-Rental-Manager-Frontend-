import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { propertiesApi } from "../../api/propertiesApi";
import { Modal } from "../ui/index.jsx";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

const DISTRICTS = [
  "Kampala","Wakiso","Mukono","Entebbe","Jinja","Mbarara",
  "Gulu","Lira","Masaka","Fort Portal","Mbale","Soroti",
];

export default function EditPropertyModal({ open, onClose, property }) {
  const qc = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (property) reset(property);
  }, [property, reset]);

  const mutation = useMutation({
    mutationFn: (data) => propertiesApi.update(property.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties"] });
      qc.invalidateQueries({ queryKey: ["property", property.id] });
      toast.success("Property updated!");
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.detail || "Update failed."),
  });

  return (
    <Modal open={open} onClose={onClose} title="Edit Property">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4" noValidate>
        <Input
          label="Property name"
          required
          error={errors.name?.message}
          {...register("name", { required: "Required" })}
        />
        <Input
          label="Physical address"
          required
          error={errors.address?.message}
          {...register("address", { required: "Required" })}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Parish / Zone" {...register("parish")} />
          <div className="w-full">
            <label className="input-label">District</label>
            <select className="input-field" {...register("district")}>
              {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div className="w-full">
          <label className="input-label">Description</label>
          <textarea
            className="input-field min-h-[80px] resize-none"
            {...register("description")}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" fullWidth onClick={onClose}>Cancel</Button>
          <Button type="submit" fullWidth loading={mutation.isPending}>Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
}