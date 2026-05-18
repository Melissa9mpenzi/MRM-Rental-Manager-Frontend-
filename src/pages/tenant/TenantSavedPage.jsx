import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Heart, MapPin, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";
import { savedListingsApi } from "../../api/savedListingsApi";
import { listingImageUrl } from "../../lib/mediaUrl";
import ListingSaveButton from "../../components/domain/ListingSaveButton";
import AppPageScaffold from "../../components/layout/AppPageScaffold";

export default function TenantSavedPage() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const { data: saved = [], isLoading, isError } = useQuery({
    queryKey: ["saved-units"],
    queryFn: () => savedListingsApi.list(),
    enabled: user?.role === "tenant",
    staleTime: 15_000,
  });

  const rows = Array.isArray(saved) ? saved : [];

  const removeMut = useMutation({
    mutationFn: (unitId) => savedListingsApi.remove(unitId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved-units"] });
      toast.success("Removed from saved.");
    },
    onError: () => toast.error("Could not remove saved listing."),
  });

  return (
    <AppPageScaffold
      variant="showcase"
      icon={Heart}
      title="Saved properties"
      description="Shortlist homes you like — synced to your account from the API."
    >
      <div className="card-glass border-brand-teal/25 bg-gradient-to-br from-brand-teal/10 to-transparent p-5">
        <h2 className="text-sm font-bold text-white">How to save a listing</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-white/65">
          <li>
            Go to{" "}
            <Link className="font-bold text-brand-teal hover:underline" to="/browse-properties">
              Search properties
            </Link>{" "}
            and open any listing.
          </li>
          <li>
            Tap <strong className="text-white">Save listing</strong> in the sidebar, or the <strong className="text-white">heart</strong> on the
            gallery (search cards show a heart in the top-right).
          </li>
          <li>
            Saved homes are stored on your <strong className="text-white">RentDirect account</strong> (same login on any device).
          </li>
        </ol>
      </div>

      {isError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          Could not load saved listings. Sign in as a tenant and ensure the API is running.
        </div>
      )}

      {isLoading ? (
        <p className="text-center text-sm text-white/45">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="card-glass flex flex-col items-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-brand-teal">
            <Heart size={28} className="opacity-60" />
          </div>
          <p className="mt-4 text-lg font-bold text-white">No saved listings yet</p>
          <p className="mt-2 max-w-md text-sm text-white/50">
            Browse the marketplace and tap save on anything you want to revisit or share with family.
          </p>
          <Link
            to="/browse-properties"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-teal px-5 py-2.5 text-sm font-bold text-[#041208] transition hover:brightness-110"
          >
            <Search size={18} /> Browse properties
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((p) => (
            <div key={p.id} className="card-glass group overflow-hidden border-white/[0.1]">
              <div className="relative h-40 bg-[#0d1520]">
                <img
                  src={listingImageUrl(p.image)}
                  alt=""
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060a0e]/85 to-transparent" />
                <div className="absolute right-3 top-3">
                  <ListingSaveButton listingId={p.id} compact />
                </div>
              </div>
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/property/${p.id}`} className="text-lg font-bold text-white hover:text-brand-teal">
                    {p.title}
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeMut.mutate(p.id)}
                    disabled={removeMut.isPending}
                    className="flex-shrink-0 rounded-lg border border-white/10 p-2 text-white/45 transition hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                    aria-label="Remove from saved"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="flex items-center gap-1 text-xs text-white/45">
                  <MapPin size={12} className="text-brand-teal" /> {p.address}
                </p>
                <p className="text-sm font-extrabold text-brand-teal">
                  UGX {Number(p.price || 0).toLocaleString()}
                  <span className="text-xs font-semibold text-white/40">/mo</span>
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Link
                    to={`/property/${p.id}`}
                    className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-white/80 hover:bg-white/10"
                  >
                    View listing
                  </Link>
                  <Link
                    to={`/tenant/messages?listing=${p.id}&intent=message&title=${encodeURIComponent(p.title)}`}
                    className="rounded-lg border border-brand-teal/30 bg-brand-teal/10 px-3 py-1.5 text-xs font-bold text-brand-teal hover:bg-brand-teal/20"
                  >
                    Message landlord
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppPageScaffold>
  );
}
