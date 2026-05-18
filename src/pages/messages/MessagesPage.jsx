import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { parse, format } from "date-fns";
import { Search, Send, MapPin, Calendar, MessageCircle, Paperclip, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import AppPageScaffold from "../../components/layout/AppPageScaffold";
import { messagesApi } from "../../api/messagesApi";

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

function formatMsgTime(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return format(d, "HH:mm");
  } catch {
    return "";
  }
}

export default function MessagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const qc = useQueryClient();
  const [active, setActive] = useState(null);
  const [draft, setDraft] = useState("");
  const appliedListingKey = useRef("");
  const inputRef = useRef(null);

  const listingId = searchParams.get("listing");
  const intent = searchParams.get("intent");
  const title = searchParams.get("title") || "";
  const viewDate = searchParams.get("date") || "";
  const viewTime = searchParams.get("time") || "";

  const { data: threads = [], isLoading: threadsLoading } = useQuery({
    queryKey: ["message-threads"],
    queryFn: () => messagesApi.threads(),
    staleTime: 15_000,
  });

  const threadList = Array.isArray(threads) ? threads : [];

  useEffect(() => {
    if (active == null && threadList.length > 0) {
      setActive(threadList[0].id);
    }
  }, [active, threadList]);

  const { data: rawMessages = [], isLoading: msgLoading } = useQuery({
    queryKey: ["message-thread", active],
    queryFn: () => messagesApi.threadMessages(active),
    enabled: active != null,
    staleTime: 5_000,
  });

  const msgs = Array.isArray(rawMessages) ? rawMessages : [];

  useEffect(() => {
    if (!listingId || !intent) {
      appliedListingKey.current = "";
      return;
    }
    const key = `${listingId}:${intent}:${title}:${viewDate}:${viewTime}`;
    if (appliedListingKey.current === key) return;
    appliedListingKey.current = key;
    const draftText = buildDraftFromListing(listingId, title, intent, viewDate, viewTime);
    requestAnimationFrame(() => {
      setDraft(draftText);
      toast.success(intent === "viewing" ? "Draft viewing request ready — edit and send." : "Draft message ready — edit and send.");
      requestAnimationFrame(() => inputRef.current?.focus());
    });
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

  const startMut = useMutation({
    mutationFn: ({ unitId, body }) => messagesApi.start(unitId, body),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["message-threads"] });
      if (data?.thread_id) setActive(data.thread_id);
      clearListingParams();
    },
    onError: () => toast.error("Could not send message. Sign in and try again."),
  });

  const postMut = useMutation({
    mutationFn: ({ threadId, body }) => messagesApi.postMessage(threadId, body),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["message-thread", v.threadId] });
      qc.invalidateQueries({ queryKey: ["message-threads"] });
    },
    onError: () => toast.error("Could not send message."),
  });

  const handleSend = () => {
    const text = draft.trim();
    if (!text) {
      toast.error("Type a message first.");
      return;
    }
    if (listingId && intent) {
      startMut.mutate(
        { unitId: Number(listingId), body: text },
        {
          onSuccess: () => {
            setDraft("");
            toast.success("Sent.");
          },
        },
      );
      return;
    }
    if (!active) {
      toast.error("Select a conversation.");
      return;
    }
    postMut.mutate(
      { threadId: active, body: text },
      {
        onSuccess: () => {
          setDraft("");
          toast.success("Sent.");
        },
      },
    );
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
          <p className="font-bold text-white">{intent === "viewing" ? "Scheduling a viewing" : "Message to landlord"}</p>
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

  const activePeer = useMemo(
    () => threadList.find((t) => t.id === active)?.peer_name || "Messages",
    [threadList, active],
  );

  return (
    <AppPageScaffold
      variant="concierge"
      icon={MessageSquare}
      title="Messages"
      description="Inbox backed by your API — start a thread from a listing or continue here."
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
              {threadsLoading ? (
                <p className="p-4 text-xs text-white/45">Loading…</p>
              ) : threadList.length === 0 ? (
                <p className="p-4 text-xs text-white/45">No threads yet. Open a listing and message the landlord.</p>
              ) : (
                threadList.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActive(t.id)}
                    className={`flex w-full items-start gap-3 border-b border-white/[0.05] px-4 py-3 text-left transition hover:bg-white/[0.04] ${
                      active === t.id ? "border-l-2 border-l-[#00C896] bg-white/[0.06]" : "border-l-2 border-l-transparent"
                    }`}
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-white/15 to-white/5 text-sm font-extrabold text-white">
                      {(t.peer_name || "?").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-bold text-white">{t.peer_name}</span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-white/45">{t.last_preview || "—"}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="border-b border-white/[0.08] px-4 py-3">
              <h2 className="text-sm font-bold text-white">{activePeer}</h2>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {msgLoading ? (
                <p className="text-xs text-white/45">Loading messages…</p>
              ) : (
                msgs.map((m) => (
                  <div key={m.id} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                        m.me ? "bg-[#00C896] text-[#041208]" : "border border-white/10 bg-white/[0.06] text-white/90"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.text}</p>
                      <p className={`mt-1 text-[10px] font-semibold ${m.me ? "text-[#041208]/70" : "text-white/35"}`}>
                        {formatMsgTime(m.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-white/[0.08] p-3">
              <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-2">
                <button type="button" className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-white/35 hover:bg-white/10">
                  <Paperclip size={18} />
                </button>
                <textarea
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={2}
                  placeholder="Write a message…"
                  className="max-h-32 min-h-[2.5rem] flex-1 resize-none bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={startMut.isPending || postMut.isPending}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#00C896] text-[#041208] transition hover:brightness-110 disabled:opacity-50"
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
