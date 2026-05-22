import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, IdCard, Camera, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";
import { usersApi } from "../../api/usersApi";
import { postLoginDestination } from "../../lib/onboardingAuth";
import { validateKycFile, KYC_MAX_BYTES } from "../../lib/kycClientValidators";

function DropZone({ label, icon: Icon, fileName, error, onFile }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.15] bg-white/[0.04] px-2 py-4 transition hover:border-brand-teal/40 hover:bg-white/[0.06] sm:py-5">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
        <Icon className="mb-1 h-6 w-6 text-brand-teal/80 sm:h-7 sm:w-7" />
        <span className="text-center text-[11px] font-bold leading-tight text-white sm:text-xs">{label}</span>
        <span className="mt-0.5 text-center text-[9px] text-white/45">Any photo · max {Math.round(KYC_MAX_BYTES / (1024 * 1024))} MB</span>
        {fileName && (
          <span className="mt-1 max-w-full truncate px-1 text-[9px] font-semibold text-brand-teal" title={fileName}>
            {fileName}
          </span>
        )}
      </label>
      {error && <p className="text-center text-[9px] font-medium text-amber-300/95">{error}</p>}
    </div>
  );
}

export default function KycPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [busy, setBusy] = useState(false);
  const [files, setFiles] = useState({ id_front: null, id_back: null, selfie: null });
  const [names, setNames] = useState({ id_front: "", id_back: "", selfie: "" });
  const [slotErrors, setSlotErrors] = useState({ id_front: "", id_back: "", selfie: "" });

  const needsDocs = user?.role === "landlord" || user?.role === "staff";

  const setFile = async (kind, file) => {
    if (!file) return;
    const err = await validateKycFile(file, kind);
    setFiles((f) => ({ ...f, [kind]: err ? null : file }));
    setNames((n) => ({ ...n, [kind]: err ? "" : file.name }));
    setSlotErrors((e) => ({ ...e, [kind]: err || "" }));
    if (err) toast.error(err);
  };

  const submit = async () => {
    if (!isAuthenticated) {
      toast.error("Sign in first, then complete KYC from your account.");
      navigate("/login");
      return;
    }

    if (needsDocs) {
      if (!files.id_front || !files.id_back || !files.selfie) {
        toast.error("Add all three: ID front, ID back, and a portrait selfie.");
        return;
      }
      const nextErrors = { id_front: "", id_back: "", selfie: "" };
      for (const kind of ["id_front", "id_back", "selfie"]) {
        const err = await validateKycFile(files[kind], kind);
        if (err) nextErrors[kind] = err;
      }
      setSlotErrors(nextErrors);
      if (nextErrors.id_front || nextErrors.id_back || nextErrors.selfie) {
        toast.error("Fix the issues highlighted under each slot.");
        return;
      }
    }

    setBusy(true);
    try {
      if (needsDocs) {
        const fd = new FormData();
        fd.append("id_front", files.id_front);
        fd.append("id_back", files.id_back);
        fd.append("selfie", files.selfie);
        await usersApi.uploadKycDocuments(fd);
      }
      const u = await usersApi.kycSubmit();
      updateUser(u);
      toast.success(needsDocs ? "Documents saved and submitted for review." : "KYC step recorded.");
      navigate(postLoginDestination(u));
    } catch (err) {
      const d = err.response?.data?.detail;
      const msg = typeof d === "string" ? d : Array.isArray(d) ? d.map((x) => x.msg || x).join(" ") : err.message;
      toast.error(msg || "Upload failed. Check file types and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card-glass animate-fade-in rounded-2xl border border-white/[0.1] p-4 shadow-card sm:p-5">
      <div className="mb-3 text-center sm:mb-4">
        <h1 className="text-lg font-bold text-white sm:text-xl">KYC verification</h1>
        <p className="mt-0.5 text-[11px] text-white/55 sm:text-xs">
          {needsDocs
            ? "Upload your national ID (both sides, landscape) and a portrait selfie. The system checks file type, size, and framing — wrong slots (e.g. selfie as ID) are rejected before submit."
            : "If you reached this step as a tenant, you can continue. Landlords and agents must upload ID and selfie."}
        </p>
      </div>

      {needsDocs && (
        <div className="mb-3 flex gap-2 rounded-lg border border-amber-500/25 bg-amber-500/10 p-2.5 text-[10px] leading-snug text-amber-100/95 sm:text-[11px]">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-300" />
          <span>
            Use your phone camera. ID shots must be sharp and large enough to read. Selfie must be{" "}
            <strong className="text-white">portrait orientation</strong> (not a photo of your ID lying on a table).
          </span>
        </div>
      )}

      {needsDocs && (
        <div className="grid grid-cols-3 gap-2">
          <DropZone
            label="ID front"
            icon={IdCard}
            fileName={names.id_front}
            error={slotErrors.id_front}
            onFile={(f) => void setFile("id_front", f)}
          />
          <DropZone
            label="ID back"
            icon={IdCard}
            fileName={names.id_back}
            error={slotErrors.id_back}
            onFile={(f) => void setFile("id_back", f)}
          />
          <DropZone
            label="Selfie"
            icon={Camera}
            fileName={names.selfie}
            error={slotErrors.selfie}
            onFile={(f) => void setFile("selfie", f)}
          />
        </div>
      )}

      <div className="mt-3 flex items-start gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] p-2.5 text-[10px] leading-snug text-white/50 sm:text-[11px]">
        <Upload size={14} className="mt-0.5 shrink-0 text-brand-teal" />
        <span>
          {needsDocs
            ? "Files are checked (type, size, real image decode, framing) then stored securely for moderation."
            : "Submit continues your onboarding without document upload."}
        </span>
      </div>

      <button
        type="button"
        disabled={busy}
        onClick={submit}
        className="btn-primary mt-4 w-full rounded-xl py-2.5 text-sm font-bold disabled:opacity-60 sm:py-3"
      >
        {busy ? "Submitting…" : needsDocs ? "Upload & submit for review" : "Continue"}
      </button>

      <p className="mt-3 text-center text-[11px] text-white/50 sm:text-xs">
        <Link to="/login" className="font-semibold text-brand-teal hover:underline">
          Skip for now
        </Link>
      </p>
    </div>
  );
}
