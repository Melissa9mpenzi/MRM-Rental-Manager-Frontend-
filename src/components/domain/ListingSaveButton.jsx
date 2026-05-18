import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";
import { savedListingsApi } from "../../api/savedListingsApi";

/**
 * Save / unsave a marketplace unit — persisted via `GET/POST/DELETE /saved-units`.
 */
export default function ListingSaveButton({ listingId, className = "", compact = false }) {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const enabled = user?.role === "tenant" && user?.id != null;

  const { data: savedRows = [], isLoading } = useQuery({
    queryKey: ["saved-units"],
    queryFn: () => savedListingsApi.list(),
    enabled,
    staleTime: 15_000,
  });

  const idNum = Number(listingId);
  const isSaved = useMemo(
    () => (Array.isArray(savedRows) ? savedRows : []).some((r) => Number(r.id) === idNum),
    [savedRows, idNum]
  );

  const toggleMut = useMutation({
    mutationFn: async (remove) => {
      if (remove) await savedListingsApi.remove(idNum);
      else await savedListingsApi.add(idNum);
    },
    onSuccess: (_, remove) => {
      qc.invalidateQueries({ queryKey: ["saved-units"] });
      toast.success(remove ? "Removed from saved properties." : "Saved. Open Saved properties in the sidebar.");
    },
    onError: () => {
      toast.error("Could not update saved listings. Are you signed in?");
    },
  });

  if (user?.role !== "tenant") return null;

  const wasSaved = isSaved;
  const busy = isLoading || toggleMut.isPending;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    toggleMut.mutate(wasSaved);
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        aria-label={wasSaved ? "Remove from saved" : "Save listing"}
        aria-pressed={wasSaved}
        className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-black/50 text-white backdrop-blur-md transition hover:border-brand-teal/50 hover:text-brand-teal disabled:opacity-50 ${wasSaved ? "text-brand-teal border-brand-teal/40" : ""} ${className}`}
      >
        <Heart size={18} className={wasSaved ? "fill-brand-teal text-brand-teal" : "text-white"} strokeWidth={1.75} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-pressed={wasSaved}
      className={`flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition disabled:opacity-50 ${
        wasSaved
          ? "border-brand-teal/40 bg-brand-teal/15 text-brand-teal hover:bg-brand-teal/25"
          : "border-white/15 text-white hover:bg-white/10"
      } ${className}`}
    >
      <Heart size={18} className={wasSaved ? "fill-brand-teal text-brand-teal" : ""} strokeWidth={1.75} />
      {wasSaved ? "Saved" : "Save listing"}
    </button>
  );
}
