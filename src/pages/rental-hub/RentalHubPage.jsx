import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { parse, format } from "date-fns";
import {
  Search,
  Send,
  MapPin,
  Calendar,
  MessageCircle,
  Paperclip,
  Shield,
  Sparkles,
  Archive,
  Building2,
  CreditCard,
  FileText,
  Flag,
  Phone,
  Video,
  Menu,
} from "lucide-react";
import toast from "react-hot-toast";
import AppPageScaffold from "../../components/layout/AppPageScaffold";
import { rentalHubApi } from "../../api/rentalHubApi";
import { PLATFORM_API_URL } from "../../api/config";
import {
  RENTAL_HUB_BRAND,
  SIDEBAR_FOLDERS,
  THREAD_TYPES,
  BADGE_LABELS,
  SYSTEM_EVENT_LABELS,
} from "../../config/rentalHub";
import useAuthStore from "../../store/authStore";
import "../../styles/rental-hub.css";

function mediaUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = (PLATFORM_API_URL || "").replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function buildDraftFromListing(listingId, title, intent, dateStr, timeStr) {
  const safeTitle = title?.trim() || "this property";
  let slotLine = "";
  if (intent === "viewing" && dateStr && timeStr) {
    try {
      const d = parse(dateStr, "yyyy-MM-dd", new Date());
      slotLine = `\n\nPreferred slot: ${format(d, "EEEE d MMMM yyyy")} at ${timeStr}.`;
    } catch {
      slotLine = `\n\nPreferred slot: ${dateStr} at ${timeStr}.`;
    }
  }
  if (intent === "viewing") {
    return `Hello,\n\nI'd like to schedule a viewing for "${safeTitle}" (listing #${listingId}).${slotLine}\n\nThank you.`;
  }
  return `Hello,\n\nI'm interested in "${safeTitle}" (listing #${listingId}). I'd like to know more about availability and rent terms.\n\nThank you.`;
}

function formatMsgTime(iso) {
  if (!iso) return "";
  try {
    return format(new Date(iso), "HH:mm");
  } catch {
    return "";
  }
}

function TrustPill({ score }) {
  if (score == null) return null;
  return (
    <span className="rental-hub-trust-pill">
      <Shield size={10} />
      Trust {score}%
    </span>
  );
}

function BadgeRow({ badges = [] }) {
  if (!badges.length) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {badges.slice(0, 4).map((b) => (
        <span key={b} className="rental-hub-badge">
          {BADGE_LABELS[b] || b}
        </span>
      ))}
    </div>
  );
}

export default function RentalHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const fileRef = useRef(null);
  const inputRef = useRef(null);

  const [folder, setFolder] = useState("inbox");
  const [searchQ, setSearchQ] = useState("");
  const [active, setActive] = useState(null);
  const [draft, setDraft] = useState("");
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const appliedListingKey = useRef("");

  const listingId = searchParams.get("listing");
  const threadParam = searchParams.get("thread");
  const intent = searchParams.get("intent");
  const title = searchParams.get("title") || "";
  const viewDate = searchParams.get("date") || "";
  const viewTime = searchParams.get("time") || "";

  const { data: threads = [], isLoading: threadsLoading } = useQuery({
    queryKey: ["rental-hub-threads", folder, searchQ],
    queryFn: () => rentalHubApi.threads({ folder, q: searchQ || undefined }),
    staleTime: 12_000,
  });

  const threadList = Array.isArray(threads) ? threads : [];

  useEffect(() => {
    if (threadParam) {
      const id = Number(threadParam);
      if (!Number.isNaN(id) && id > 0) setActive(id);
      return;
    }
    if (active == null && threadList.length > 0) setActive(threadList[0].id);
  }, [active, threadList, threadParam]);

  const { data: ctx } = useQuery({
    queryKey: ["rental-hub-context", active],
    queryFn: () => rentalHubApi.threadContext(active),
    enabled: active != null,
  });

  const { data: rawMessages = [], isLoading: msgLoading } = useQuery({
    queryKey: ["rental-hub-messages", active],
    queryFn: () => rentalHubApi.threadMessages(active),
    enabled: active != null,
    staleTime: 4_000,
  });

  const msgs = Array.isArray(rawMessages) ? rawMessages : [];
  const activeThread = useMemo(() => threadList.find((t) => t.id === active), [threadList, active]);

  useEffect(() => {
    if (!listingId || !intent) {
      appliedListingKey.current = "";
      return;
    }
    const key = `${listingId}:${intent}:${title}:${viewDate}:${viewTime}`;
    if (appliedListingKey.current === key) return;
    appliedListingKey.current = key;
    setDraft(buildDraftFromListing(listingId, title, intent, viewDate, viewTime));
    toast.success(intent === "viewing" ? "Draft viewing request ready." : "Draft inquiry ready.");
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [listingId, intent, title, viewDate, viewTime]);

  const clearListingParams = () => {
    const next = new URLSearchParams(searchParams);
    ["listing", "intent", "title", "date", "time"].forEach((k) => next.delete(k));
    setSearchParams(next, { replace: true });
    appliedListingKey.current = "";
  };

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ["rental-hub-threads"] });
    if (active) qc.invalidateQueries({ queryKey: ["rental-hub-messages", active] });
  };

  const startMut = useMutation({
    mutationFn: ({ unitId, body }) => rentalHubApi.start(unitId, body),
    onSuccess: (data) => {
      invalidateAll();
      if (data?.thread_id) setActive(data.thread_id);
      clearListingParams();
      setDraft("");
      toast.success("Sent via Rental Hub.");
    },
    onError: () => toast.error("Could not start conversation."),
  });

  const postMut = useMutation({
    mutationFn: ({ threadId, body }) => rentalHubApi.postMessage(threadId, body),
    onSuccess: () => {
      invalidateAll();
      setDraft("");
    },
    onError: () => toast.error("Could not send."),
  });

  const uploadMut = useMutation({
    mutationFn: ({ threadId, file }) => rentalHubApi.uploadAttachment(threadId, file),
    onSuccess: () => {
      invalidateAll();
      toast.success("Attachment sent.");
    },
    onError: () => toast.error("Upload failed."),
  });

  const inspectionMut = useMutation({
    mutationFn: ({ threadId }) =>
      rentalHubApi.bookInspection(threadId, {
        preferred_date: viewDate || format(new Date(), "yyyy-MM-dd"),
        preferred_time: viewTime || "10:00",
        notes: "Requested from Rental Hub",
      }),
    onSuccess: () => {
      invalidateAll();
      toast.success("Inspection request sent.");
    },
  });

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return toast.error("Type a message first.");
    if (listingId && intent) {
      startMut.mutate({ unitId: Number(listingId), body: text });
      return;
    }
    if (!active) return toast.error("Select a conversation.");
    postMut.mutate({ threadId: active, body: text });
  };

  const onQuickAction = (id) => {
    const role = user?.role;
    if (id === "pay_rent" && role === "tenant") navigate("/tenant/pay");
    else if (id === "view_contract") navigate(role === "tenant" ? "/tenant/contract" : "/landlord/contracts");
    else if (id === "book_inspection" && active) inspectionMut.mutate({ threadId: active });
    else if (id === "report_issue") navigate("/tenant/maintenance/submit");
    else if (id === "view_property" && activeThread?.property?.property_id)
      navigate(`/landlord/properties`);
    else toast("Coming soon — voice/video and AI assistant.");
  };

  const listingBanner =
    listingId && (intent === "message" || intent === "viewing") ? (
      <div className="mb-3 flex flex-wrap items-start gap-3 rounded-xl border border-[#00C896]/25 bg-[#00C896]/10 px-4 py-3 text-sm">
        {intent === "viewing" ? <Calendar className="h-5 w-5 text-[#00C896]" /> : <MessageCircle className="h-5 w-5 text-[#00C896]" />}
        <div>
          <p className="font-bold text-white">{intent === "viewing" ? "Book inspection" : "Property inquiry"}</p>
          <p className="text-xs text-white/55">
            Listing #{listingId}
            {title ? ` — ${title}` : ""}
          </p>
        </div>
      </div>
    ) : null;

  return (
    <AppPageScaffold
      variant="concierge"
      icon={MessageCircle}
      title={RENTAL_HUB_BRAND}
      description="Property-based chat with trust scores, system events, and compliance-ready history."
    >
      {listingBanner}
      <div className="mb-2 flex items-center justify-between gap-2 md:hidden">
        <button type="button" className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white" onClick={() => setMobileSidebar(true)}>
          <Menu size={14} className="inline mr-1" />
          Conversations
        </button>
        <span className="text-xs text-white/45 flex items-center gap-1">
          <Sparkles size={12} className="text-[#00C896]" />
          AI moderation ready
        </span>
      </div>

      <div className="rental-hub-shell relative">
        <aside className={`rental-hub-sidebar ${mobileSidebar ? "mobile-open" : ""}`}>
          <div className="border-b border-white/10 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#00C896]">RentDirect Connect</p>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
              <input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search chats…"
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-8 pr-2 text-xs text-white outline-none"
              />
            </div>
          </div>
          <nav className="py-1">
            {SIDEBAR_FOLDERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`rental-hub-folder ${folder === f.id ? "active" : ""}`}
                onClick={() => {
                  setFolder(f.id);
                  setMobileSidebar(false);
                }}
              >
                {f.label}
              </button>
            ))}
          </nav>
          <div className="flex-1 overflow-y-auto">
            {threadsLoading ? (
              <p className="p-4 text-xs text-white/45">Loading…</p>
            ) : threadList.length === 0 ? (
              <p className="p-4 text-xs text-white/45">No conversations. Message a landlord from a listing.</p>
            ) : (
              threadList.map((t) => {
                const tt = THREAD_TYPES[t.thread_type] || THREAD_TYPES.inquiry;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setActive(t.id);
                      setMobileSidebar(false);
                    }}
                    className={`rental-hub-thread ${active === t.id ? "active" : ""}`}
                  >
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                      style={{ background: `linear-gradient(135deg, ${tt.color}44, ${tt.color}11)` }}
                    >
                      {(t.title || "?").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate text-sm font-bold text-white">{t.title || t.peer?.name}</span>
                        {t.unread_count > 0 ? (
                          <span className="rounded-full bg-[#00C896] px-1.5 text-[10px] font-bold text-[#041208]">{t.unread_count}</span>
                        ) : null}
                      </div>
                      <p className="text-[10px] font-semibold" style={{ color: tt.color }}>
                        {tt.label}
                      </p>
                      <p className="line-clamp-1 text-xs text-white/45">{t.last_preview || "—"}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="flex min-w-0 flex-col">
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
            <div>
              <h2 className="text-sm font-bold text-white">{activeThread?.title || activeThread?.peer?.name || "Select a chat"}</h2>
              {activeThread?.peer ? (
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <TrustPill score={activeThread.peer.trust_score} />
                  <BadgeRow badges={activeThread.peer.badges} />
                </div>
              ) : null}
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-lg p-2 text-white/25"
                title="Voice calls — coming soon"
              >
                <Phone size={16} />
              </button>
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-lg p-2 text-white/25"
                title="Video calls — coming soon"
              >
                <Video size={16} />
              </button>
              {active ? (
                <button
                  type="button"
                  className="rounded-lg p-2 text-white/40 hover:bg-white/10"
                  onClick={() => rentalHubApi.archive(active, true).then(invalidateAll)}
                  title="Archive"
                >
                  <Archive size={16} />
                </button>
              ) : null}
            </div>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {msgLoading ? (
              <p className="text-xs text-white/45">Loading messages…</p>
            ) : (
              msgs.map((m) => {
                if (m.message_kind === "system") {
                  return (
                    <div key={m.id} className="rental-hub-bubble-system">
                      <Sparkles size={12} className="inline mr-1 text-sky-400" />
                      {SYSTEM_EVENT_LABELS[m.event_code] ? `${SYSTEM_EVENT_LABELS[m.event_code]}: ` : ""}
                      {m.text}
                      {m.blockchain_hash ? (
                        <p className="mt-1 text-[10px] text-white/40">On-chain: {m.blockchain_hash.slice(0, 16)}…</p>
                      ) : null}
                    </div>
                  );
                }
                return (
                  <div key={m.id} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                        m.me ? "bg-[#00C896] text-[#041208]" : "border border-white/10 bg-white/[0.06] text-white/90"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.text}</p>
                      {m.attachment_url ? (
                        <a
                          href={mediaUrl(m.attachment_url)}
                          target="_blank"
                          rel="noreferrer"
                          className={`mt-2 block text-xs underline ${m.me ? "text-[#041208]/80" : "text-[#00C896]"}`}
                        >
                          📎 {m.attachment_name || "Attachment"}
                        </a>
                      ) : null}
                      <p className={`mt-1 text-[10px] font-semibold ${m.me ? "text-[#041208]/70" : "text-white/35"}`}>
                        {formatMsgTime(m.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-white/10 p-3">
            <div className="mb-2 flex flex-wrap gap-1">
              {(ctx?.quick_actions || []).slice(0, 4).map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => onQuickAction(a.id)}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-white/70 hover:border-[#00C896]/40"
                >
                  {a.label}
                </button>
              ))}
            </div>
            <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-2">
              <input ref={fileRef} type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f && active) uploadMut.mutate({ threadId: active, file: f });
                e.target.value = "";
              }} />
              <button type="button" className="flex h-9 w-9 items-center justify-center rounded-lg text-white/40 hover:bg-white/10" onClick={() => fileRef.current?.click()}>
                <Paperclip size={18} />
              </button>
              <textarea
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={2}
                placeholder="Write a message…"
                className="max-h-32 min-h-[2.5rem] flex-1 resize-none bg-transparent text-sm text-white outline-none"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={startMut.isPending || postMut.isPending}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00C896] text-[#041208] disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </section>

        <aside className="rental-hub-context">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Context</p>
          {ctx?.property ? (
            <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              {ctx.property.photo_url ? (
                <img src={mediaUrl(ctx.property.photo_url)} alt="" className="mb-2 h-24 w-full rounded-lg object-cover" />
              ) : (
                <div className="mb-2 flex h-24 items-center justify-center rounded-lg bg-white/5">
                  <Building2 className="text-white/25" />
                </div>
              )}
              <p className="font-bold text-white">{ctx.property.title}</p>
              <p className="mt-1 flex items-start gap-1 text-xs text-white/50">
                <MapPin size={12} className="mt-0.5 flex-shrink-0" />
                {ctx.property.address || ctx.property.district || "Uganda"}
              </p>
              <BadgeRow badges={ctx.peer?.badges} />
            </div>
          ) : (
            <p className="mt-3 text-xs text-white/45">Select a property chat to see listing context.</p>
          )}

          {ctx?.peer ? (
            <div className="mt-4 rounded-xl border border-white/10 p-3">
              <p className="text-xs font-bold text-white/50">Participant</p>
              <p className="mt-1 font-bold text-white">{ctx.peer.name}</p>
              <p className="text-xs capitalize text-white/45">{ctx.peer.role?.replace("_", " ")}</p>
              <div className="mt-2">
                <TrustPill score={ctx.peer.trust_score} />
              </div>
              <BadgeRow badges={ctx.peer.badges} />
            </div>
          ) : null}

          <div className="mt-4 rounded-xl border border-dashed border-[#00C896]/30 bg-[#00C896]/5 p-3 text-xs text-white/60">
            <p className="font-bold text-[#00C896]">Trust & compliance</p>
            <p className="mt-1">Agreements and key events can be anchored on Sui for immutable proof (escrow, refunds, compliance notices).</p>
            <p className="mt-2 flex items-center gap-1 text-white/45">
              <Sparkles size={12} />
              AI: summarize · detect fraud language · translate (roadmap)
            </p>
          </div>

          <div className="mt-4 space-y-1 text-xs text-white/45">
            <p className="flex items-center gap-2">
              <CreditCard size={14} /> Payment status in wallet
            </p>
            <p className="flex items-center gap-2">
              <FileText size={14} /> Contracts & receipts linked
            </p>
            <p className="flex items-center gap-2">
              <Flag size={14} /> Report via Support folder
            </p>
          </div>
        </aside>
      </div>
    </AppPageScaffold>
  );
}
