import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, IdCard, Camera } from "lucide-react";
import toast from "react-hot-toast";

function DropZone({ label, icon: Icon }) {
  const [name, setName] = useState("");
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.15] bg-white/[0.04] px-2 py-4 transition hover:border-brand-teal/40 hover:bg-white/[0.06] sm:py-5">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => setName(e.target.files?.[0]?.name || "")}
      />
      <Icon className="mb-1 h-6 w-6 text-brand-teal/80 sm:h-7 sm:w-7" />
      <span className="text-center text-[11px] font-bold leading-tight text-white sm:text-xs">{label}</span>
      <span className="mt-0.5 text-center text-[9px] text-white/45">PNG/JPG</span>
      {name && <span className="mt-1 max-w-full truncate px-1 text-[9px] font-semibold text-brand-teal">{name}</span>}
    </label>
  );
}

export default function KycPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const submit = () => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      toast.success("KYC submitted. Sign in to continue.");
      navigate("/login");
    }, 600);
  };

  return (
    <div className="card-glass animate-fade-in rounded-2xl border border-white/[0.1] p-4 shadow-card sm:p-5">
      <div className="mb-3 text-center sm:mb-4">
        <h1 className="text-lg font-bold text-white sm:text-xl">KYC verification</h1>
        <p className="mt-0.5 text-[11px] text-white/55 sm:text-xs">Upload ID and selfie (KYC API not wired yet).</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <DropZone label="ID front" icon={IdCard} />
        <DropZone label="ID back" icon={IdCard} />
        <DropZone label="Selfie" icon={Camera} />
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] p-2.5 text-[10px] leading-snug text-white/50 sm:text-[11px]">
        <Upload size={14} className="mt-0.5 shrink-0 text-brand-teal" />
        <span>Production would encrypt uploads per local data-protection rules.</span>
      </div>

      <button
        type="button"
        disabled={busy}
        onClick={submit}
        className="btn-primary mt-4 w-full rounded-xl py-2.5 text-sm font-bold disabled:opacity-60 sm:py-3"
      >
        {busy ? "Submitting…" : "Submit & continue"}
      </button>

      <p className="mt-3 text-center text-[11px] text-white/50 sm:text-xs">
        <Link to="/login" className="font-semibold text-brand-teal hover:underline">
          Skip for now
        </Link>
      </p>
    </div>
  );
}
