import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { propertiesApi } from "../../api/propertiesApi";
import { Button } from "../ui/Button";
import { needsPhotoReupload, propertyPhotoUrl } from "../../lib/mediaUrl";

export default function PropertyPhotoUpload({ property, variant = "card" }) {
  const qc = useQueryClient();
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const reupload = needsPhotoReupload(property?.photo_path);
  const displayUrl = preview || propertyPhotoUrl(property?.photo_path);

  const uploadMutation = useMutation({
    mutationFn: (file) => propertiesApi.uploadPhoto(property.id, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties"] });
      qc.invalidateQueries({ queryKey: ["property", property.id] });
      qc.invalidateQueries({ queryKey: ["marketplace-listings"] });
      toast.success("Your photo is saved to Cloudinary.");
      setPreview(null);
    },
    onError: (err) => {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Photo upload failed.");
    },
  });

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Use JPEG, PNG, or WebP.");
      return;
    }
    setPreview(URL.createObjectURL(file));
    uploadMutation.mutate(file);
  };

  const isHero = variant === "hero";

  return (
    <div className={isHero ? "space-y-3" : ""}>
      {displayUrl ? (
        <div className={isHero ? "relative h-52 w-full overflow-hidden rounded-xl" : "h-32 -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-lg"}>
          <img src={displayUrl} alt={property.name} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div
          className={
            isHero
              ? "flex h-52 flex-col items-center justify-center rounded-xl border border-dashed border-amber-400/40 bg-amber-500/10 px-4 text-center"
              : "flex h-32 -mx-5 -mt-5 mb-4 flex-col items-center justify-center rounded-t-lg border border-dashed border-amber-400/40 bg-amber-500/10 px-3 text-center"
          }
        >
          <ImagePlus className="mb-2 text-amber-300" size={28} />
          <p className="text-sm font-semibold text-amber-100">
            {reupload ? "Your original photo was lost on the server" : "No photo yet"}
          </p>
          <p className="mt-1 text-xs text-white/55">
            Upload again from your laptop — it will be stored in Cloudinary permanently.
          </p>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFile} />

      <Button
        type="button"
        variant={reupload || !property.photo_path ? "primary" : "outline"}
        size={isHero ? "md" : "sm"}
        loading={uploadMutation.isPending}
        onClick={() => fileRef.current?.click()}
        className={isHero ? "" : "w-full"}
      >
        <Upload size={14} />
        {reupload ? "Re-upload your photo" : displayUrl ? "Replace photo" : "Upload photo"}
      </Button>
    </div>
  );
}
