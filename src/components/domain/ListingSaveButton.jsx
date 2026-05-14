import { useEffect } from "react";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";
import { useSavedListingsStore } from "../../store/savedListingsStore";

/**
 * Save / unsave a public listing (persists in localStorage per user until a saved-listings API exists).
 */
export default function ListingSaveButton({ listingId, className = "", compact = false }) {
  const user = useAuthStore((s) => s.user);
  const hydrate = useSavedListingsStore((s) => s.hydrate);
  const toggle = useSavedListingsStore((s) => s.toggle);
  const isSaved = useSavedListingsStore((s) => s.isSaved(listingId));

  useEffect(() => {
    if (user?.role === "tenant" && user?.id != null) hydrate(user.id);
  }, [user?.id, user?.role, hydrate]);

  if (user?.role !== "tenant") return null;

  const wasSaved = isSaved;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(listingId, user.id);
    toast.success(wasSaved ? "Removed from saved properties." : "Saved. Find it under Saved properties in the sidebar.");
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={wasSaved ? "Remove from saved" : "Save listing"}
        aria-pressed={wasSaved}
        className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-black/50 text-white backdrop-blur-md transition hover:border-brand-teal/50 hover:text-brand-teal ${wasSaved ? "text-brand-teal border-brand-teal/40" : ""} ${className}`}
      >
        <Heart size={18} className={wasSaved ? "fill-brand-teal text-brand-teal" : "text-white"} strokeWidth={1.75} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={wasSaved}
      className={`flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition ${
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
