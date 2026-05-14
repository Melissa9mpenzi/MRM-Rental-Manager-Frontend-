import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { parse, format } from "date-fns";
import { Search, Send, MapPin, Calendar, MessageCircle, Paperclip, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import AppPageScaffold from "../../components/layout/AppPageScaffold";

const THREADS = [
  { id: 1, name: "Alpha Apartments", initial: "A", last: "Rent receipt sent for May.", time: "2m", unread: true, online: true },
  { id: 2, name: "Mary Property", initial: "M", last: "Thanks — I'll confirm the viewing slot.", time: "1h", unread: false, online: true },
  { id: 3, name: "Alex Agent", initial: "A", last: "Viewing confirmed for Saturday 10am.", time: "1d", unread: false, online: false },
  { id: 4, name: "Support Team", initial: "S", last: "Your KYC documents were received.", time: "2d", unread: false, online: true },
];

const MSGS = [
  { me: false, text: "Hello! Rent for May is due on the 5th.", t: "10:02" },
  { me: true, text: "Thanks — I'll pay via MoMo tomorrow.", t: "10:18" },
  { me: false, text: "Perfect. Use the Pay Rent button on your dashboard.", t: "10:19" },
];

function buildDraftFromListing(listingId, title, intent, dateStr, timeStr) {
  const safeTitle = title?.trim() || "this property";
  let slotLine = "";
  if (intent === "viewing" && dateStr && timeStr) {
    try {
      const d = parse(dateStr, "yyyy-MM-dd", new Date());
      slotLine = `\n\nPreferred slot: ${format(d, "EEEE d MMMM yyyy")} at ${timeStr}. I'm flexible if you need to propose another time.`;
    } catch {
      slotLine = `\n\nPreferred slot: ${dateStr} at ${timeStr}.`;
    }
  }
  if (intent === "viewing") {
    return `Hello,\n\nI'd like to schedule a viewing for "${safeTitle}" (listing #${listingId}).${slotLine}\n\nThank you.`;
  }
  return `Hello,\n\nI'm interested in "${safeTitle}" (listing #${listingId}). I'd like to know more about availability and rent terms.\n\nThank you.`;
}

export default function MessagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [active, setActive] = useState(1);
  const [draft, setDraft] = useState("");
  const appliedListingKey = useRef("");
  const inputRef = useRef(null);

  const listingId = searchParams.get("listing");
  const intent = searchParams.get("intent");
  const title = searchParams.get("title") || "";
  const viewDate = searchParams.get("date") || "";
  const viewTime = searchParams.get("time") || "";

  useEffect(() => {
    if (!listingId || !intent) {
      appliedListingKey.current = "";
      return;
    }
    const key = `${listingId}:${intent}:${title}:${viewDate}:${viewTime}`;
    if (appliedListingKey.current === key) return;
    appliedListingKey.current = key;
    const draftText = buildDraftFromListing(listingId, title, intent, viewDate, viewTime);
    const raf = requestAnimationFrame(() => {
      setDraft(draftText);
      toast.success(intent === "viewing" ? "Draft viewing request ready — edit and send." : "Draft message ready — edit and send.");
      requestAnimationFrame(() => inputRef.current?.focus());
    });
    return () => cancelAnimationFrame(raf);
  }, [listingId, intent, title, viewDate, viewTime]);

  const clearListingParams = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("listing");
    next.delete("intent");
    next.delete("title");
    next.delete("date");
    next.delete("time");
    setSearchParams(next, { replace: true });
    appliedListingKey.current = "";
  };

  const handleSend = () => {
    const text = draft.trim();
    if (!text) {
      toast.error("Type a message first.");
      return;
    }
    toast.success("Message sent. The recipient will see it when messaging is connected to your API.");
    setDraft("");
    if (listingId) clearListingParams();
  };

  const slotSummary =
    intent === "viewing" && viewDate && viewTime
      ? (() => {
          try {
            const d = parse(viewDate, "yyyy-MM-dd", new Date());
            return `${format(d, "EEE d MMM")} · ${viewTime}`;
          } catch {
            return `${viewDate} · ${viewTime}`;
          }
        })()
      : null;

  const listingBanner =
    listingId && (intent === "message" || intent === "viewing") ? (
      <div className="flex flex-wrap items-start gap-3 rounded-xl border border-[#00C896]/25 bg-[#00C896]/10 px-4 py-3 text-sm text-white/85">
        {intent === "viewing" ? (
          <Calendar className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#00C896]" />
        ) : (
          <MessageCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#00C896]" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-bold text-white">
            {intent === "viewing" ? "Scheduling a viewing" : "Message to landlord"}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-white/55">
            <MapPin size={12} className="text-[#00C896]" />
            Listing #{listingId}
            {title ? <span className="truncate font-medium text-white/70"> — {title}</span> : null}
          </p>
          {slotSummary ? (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/25 px-2.5 py-1 text-xs font-semibold text-brand-teal">
              <Calendar size={12} />
              {slotSummary}
            </p>
          ) : null}
        </div>
      </div>
    ) : null;

  return (
    <AppPageScaffold
      variant="concierge"
      icon={MessageSquare}
      title="Messages"
      description="Landlords, agents, and support — one inbox."
    >
      <div className="flex flex-col gap-4">
      {listingBanner}
      <div className="flex h-[calc(100dvh-12rem)] min-h-[420px] gap-0 overflow-hidden rounded-2xl border border-white/[0.1] bg-[#060a0e]/80 shadow-card md:h-[calc(100dvh-10rem)]">
        <aside className="hidden w-72 flex-shrink-0 flex-col border-r border-white/[0.08] bg-black/30 md:flex">
          <div className="border-b border-white/[0.08] p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
              <input
                placeholder="Search…"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-white/35"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {THREADS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActive(t.id)}
                className={`flex w-full items-start gap-3 border-b border-white/[0.05] px-4 py-3 text-left transition hover:bg-white/[0.04] ${
                  active === t.id ? "border-l-2 border-l-[#00C896] bg-white/[0.06]" : "border-l-2 border-l-transparent"
                }`}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-white/15 to-white/5 text-sm font-extrabold text-white">
                  {t.initial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="truncate text-sm font-bold text-white">{t.name}</span>
                    <span className="flex-shrink-0 text-[10px] text-white/35">{t.time}</span>
                  </div>
                  <span className={`mt-0.5 line-clamp-2 text-xs ${t.unread ? "font-semibold text-white/80" : "text-white/45"}`}>
                    {t.last}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3 md:px-6">
            {(() => {
              const cur = THREADS.find((x) => x.id === active);
              return (
                <>
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00C896]/40 to-brand-teal/20 text-sm font-extrabold text-white">
                    {cur?.initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-white">{cur?.name}</div>
                    <div className="text-xs text-white/45">
                      {cur?.online ? (
                        <span className="text-emerald-400/95">● Online</span>
                      ) : (
                        <span className="text-white/35">Offline</span>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4 md:p-6">
            {MSGS.map((m, i) => (
              <div key={i} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.me
                      ? "rounded-br-md bg-sky-600 text-white shadow-lg shadow-sky-900/30"
                      : "rounded-bl-md bg-white/[0.1] text-white/90"
                  }`}
                >
                  {m.text}
                  <div className={`mt-1 text-[10px] ${m.me ? "text-sky-100/80" : "text-white/40"}`}>{m.t}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.08] p-3 md:p-4">
            <div className="flex gap-2">
              <button
                type="button"
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center self-end rounded-xl border border-white/10 bg-white/[0.06] text-white/50 transition hover:border-white/25 hover:text-white"
                aria-label="Attach file"
              >
                <Paperclip size={18} />
              </button>
              <textarea
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={3}
                placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                className="min-h-[2.75rem] min-w-0 flex-1 resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/35"
              />
              <button
                type="button"
                onClick={handleSend}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center self-end rounded-xl bg-[#00C896] text-[#041208] transition hover:brightness-110"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AppPageScaffold>
  );
}
