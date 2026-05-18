import { useMemo, useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  MessageCircle,
  Calendar,
  Wifi,
  Car,
  Bath,
  BedDouble,
  Maximize2,
  Lock,
  CheckCircle2,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import { messagesPathForRole } from "../../config/access";
import ViewingScheduleModal from "../../components/domain/ViewingScheduleModal";
import ListingSaveButton from "../../components/domain/ListingSaveButton";
import { marketplaceApi } from "../../api/marketplaceApi";
import { listingImageUrl } from "../../lib/mediaUrl";

function BedIcon(props) {
  return <BedDouble {...props} />;
}

const loginBtn =
  "flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 py-3 text-sm font-bold text-white transition hover:bg-white/10";
const primaryBtn =
  "flex w-full items-center justify-center gap-2 rounded-xl bg-[#00C896] py-3 text-sm font-bold text-[#041208] transition hover:brightness-110";

export default function ListingDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const unitId = Number(id);
  const isAuthed = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const loginState = { from: { pathname: location.pathname } };
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["marketplace-listing", unitId],
    queryFn: () => marketplaceApi.get(unitId),
    enabled: Number.isFinite(unitId) && unitId > 0,
    retry: false,
  });

  const p = data || {
    title: "Listing",
    price: 0,
    address: "",
    beds: 0,
    baths: 1,
    sqft: 0,
    image: "/images/hero-villa.jpg",
    desc: "",
    parking: "—",
    verified: false,
    amenities: [],
  };

  const hero = listingImageUrl(p.image);
  const gallery = useMemo(() => {
    const extra = ["/images/listing-interior.jpg", "/images/listing-luxury.jpg"];
    return [hero, ...extra].filter(Boolean);
  }, [hero]);

  if (!Number.isFinite(unitId) || unitId <= 0) {
    return (
      <div className="card-glass p-8 text-center">
        <p className="text-sm text-white/55">Invalid listing URL.</p>
        <Link to="/browse-properties" className="mt-4 inline-block text-sm font-bold text-[#00C896] hover:underline">
          ← Back to search
        </Link>
      </div>
    );
  }

  const role = user?.role ?? "tenant";
  const messagesBase = messagesPathForRole(role);

  const openMessages = (intent) => {
    const params = new URLSearchParams({
      listing: String(id),
      intent,
      title: p.title || "",
    });
    navigate(`${messagesBase}?${params.toString()}`);
  };

  const openMessagesWithSlot = ({ date, time }) => {
    const params = new URLSearchParams({
      listing: String(id),
      intent: "viewing",
      title: p.title || "",
      date,
      time,
    });
    navigate(`${messagesBase}?${params.toString()}`);
  };

  const amenityRows = Array.isArray(p.amenities) && p.amenities.length > 0 ? p.amenities : null;

  if (isError) {
    return (
      <div className="card-glass p-8 text-center">
        <p className="font-bold text-white">Listing not available</p>
        <p className="mt-2 text-sm text-white/50">This unit may have been rented or removed.</p>
        <Link to="/browse-properties" className="mt-6 inline-block text-sm font-bold text-[#00C896] hover:underline">
          ← Back to search
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="card-glass p-10 text-center text-sm text-white/50">
        Loading listing from the API…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-white/[0.1] bg-[#0a1018]">
            <div className="relative aspect-[21/9] lg:aspect-[2/1]">
              <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060a0e]/70 via-transparent to-transparent" />
              {p.verified && (
                <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-[#00C896]/35 bg-black/55 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-[#00C896] backdrop-blur-md">
                  <CheckCircle2 size={14} /> Active listing
                </div>
              )}
              {isAuthed && user?.role === "tenant" && (
                <div className="absolute right-3 top-3 z-10">
                  <ListingSaveButton listingId={unitId} compact />
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {gallery.slice(0, 4).map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-white/10 opacity-90 ring-offset-2 ring-offset-[#0a1018] transition hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#00C896]/50"
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="card-glass p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-2xl font-extrabold text-white">{p.title}</h1>
              {p.verified && (
                <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-[#00C896]/15 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#00C896]">
                  <CheckCircle2 size={12} /> Verified
                </span>
              )}
            </div>
            <p className="mt-2 flex items-center gap-2 text-sm text-white/50">
              <MapPin size={16} className="text-[#00C896]" /> {p.address}
            </p>
            <h2 className="mt-8 text-sm font-extrabold uppercase tracking-wide text-white/40">About this property</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/60">{p.desc}</p>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: BedIcon, l: "Beds", v: p.beds },
                { icon: Bath, l: "Baths", v: p.baths },
                { icon: Maximize2, l: "Floor area", v: `${p.sqft} m²` },
                { icon: Car, l: "Parking", v: p.parking },
              ].map((row) => {
                const StatIcon = row.icon;
                return (
                  <div key={row.l} className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 text-center">
                    <StatIcon className="mx-auto mb-1 h-5 w-5 text-[#00C896]" />
                    <div className="text-lg font-bold text-white">{row.v}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-white/40">{row.l}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white/55">
              <Wifi className="h-5 w-5 flex-shrink-0 text-[#00C896]" />
              <span>Confirm connectivity and generator details with the landlord before you move in.</span>
            </div>
            <div className="mt-8">
              <h3 className="text-xs font-extrabold uppercase tracking-wide text-white/40">Amenities</h3>
              <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
                {(amenityRows || ["WiFi", "Parking", "Security", "Balcony", "Generator", "Furnished"]).map((label) => {
                  const row =
                    typeof label === "string"
                      ? { icon: Wifi, label }
                      : { icon: Wifi, label: String(label) };
                  const AmenityIcon = row.icon;
                  return (
                    <div
                      key={row.label}
                      className="flex flex-col items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 text-center"
                    >
                      <AmenityIcon className="h-5 w-5 text-[#00C896]" />
                      <span className="text-[10px] font-bold text-white/55">{row.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="card-glass h-fit space-y-4 p-6 lg:sticky lg:top-4">
          <div>
            <div className="text-xs text-white/45">From</div>
            <div className="text-3xl font-extrabold text-[#00C896]">UGX {Number(p.price || 0).toLocaleString()}</div>
            <div className="text-xs text-white/40">per month</div>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-white/35">
              {p.unit_type ? String(p.unit_type).replace(/_/g, " ") : "Rental unit"}
            </p>
          </div>

          {!isAuthed && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-100/90">
              <Lock size={14} className="mt-0.5 flex-shrink-0 text-amber-400" />
              <span>
                You can view this listing without an account. Sign in to message the landlord, book a viewing, or use rent tools.
              </span>
            </div>
          )}

          {isAuthed ? (
            <>
              <button type="button" className={primaryBtn} onClick={() => openMessages("message")}>
                <MessageCircle size={18} /> Message landlord
              </button>
              <button type="button" className={loginBtn} onClick={() => setScheduleOpen(true)}>
                <Calendar size={18} /> Schedule viewing
              </button>
              <ListingSaveButton listingId={unitId} />
            </>
          ) : (
            <>
              <Link to="/login" state={loginState} className={primaryBtn}>
                <MessageCircle size={18} /> Sign in to message landlord
              </Link>
              <Link to="/login" state={loginState} className={loginBtn}>
                <Calendar size={18} /> Sign in to schedule viewing
              </Link>
            </>
          )}

          <Link to="/browse-properties" className="block text-center text-sm font-semibold text-white/50 hover:text-[#00C896]">
            ← Back to search
          </Link>

          {isAuthed ? (
            <Link
              to="/tenant/pay"
              className="block rounded-xl border border-[#00C896]/30 bg-[#00C896]/10 py-2.5 text-center text-sm font-bold text-[#00C896]"
            >
              Pay rent
            </Link>
          ) : (
            <Link
              to="/login"
              state={loginState}
              className="block rounded-xl border border-[#00C896]/30 bg-[#00C896]/10 py-2.5 text-center text-sm font-bold text-[#00C896]"
            >
              Sign in to pay rent
            </Link>
          )}
        </div>
      </div>

      <ViewingScheduleModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        listingTitle={p.title}
        onConfirm={(slot) => openMessagesWithSlot(slot)}
      />
    </div>
  );
}
