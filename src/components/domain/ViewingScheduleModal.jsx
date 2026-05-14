import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const TIME_SLOTS = ["09:00", "10:30", "12:00", "14:00", "16:30", "18:00"];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Modal: pick a date (month grid) + time slot for a viewing request.
 */
export default function ViewingScheduleModal({ open, onClose, listingTitle, onConfirm }) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState(null);
  const [time, setTime] = useState(null);

  if (!open) return null;

  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const canConfirm = selectedDay && time;

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm({
      date: format(selectedDay, "yyyy-MM-dd"),
      time,
    });
    setSelectedDay(null);
    setTime(null);
    setCursor(startOfMonth(new Date()));
    onClose();
  };

  const handleClose = () => {
    setSelectedDay(null);
    setTime(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="viewing-schedule-title"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0a1018] shadow-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl text-white/50 transition hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="border-b border-white/[0.08] p-5 pr-14">
          <h2 id="viewing-schedule-title" className="text-lg font-bold text-white">
            Schedule a viewing
          </h2>
          <p className="mt-1 line-clamp-2 text-sm text-white/50">{listingTitle}</p>
        </div>

        <div className="max-h-[min(70vh,calc(100dvh-6rem))] overflow-y-auto p-5">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCursor((d) => addMonths(d, -1))}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white/70 transition hover:bg-white/10"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-bold text-white">{format(cursor, "MMMM yyyy")}</span>
            <button
              type="button"
              onClick={() => setCursor((d) => addMonths(d, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white/70 transition hover:bg-white/10"
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wide text-white/40">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const inMonth = isSameMonth(day, cursor);
              const past = isBefore(day, today);
              const sel = selectedDay && isSameDay(day, selectedDay);
              return (
                <button
                  key={format(day, "yyyy-MM-dd")}
                  type="button"
                  disabled={past}
                  onClick={() => {
                    if (!past) setSelectedDay(day);
                  }}
                  className={`
                    flex aspect-square max-h-10 items-center justify-center rounded-lg text-sm font-semibold transition
                    ${!inMonth ? "text-white/20" : past ? "cursor-not-allowed text-white/20" : "text-white/80 hover:bg-white/10"}
                    ${sel ? "bg-brand-teal text-[#041208] hover:bg-brand-teal" : ""}
                  `}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-white/40">Preferred time</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setTime(slot)}
                className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                  time === slot
                    ? "border-brand-teal bg-brand-teal/20 text-brand-teal"
                    : "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/20"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>

          <div className="mt-3">
            <label className="text-[11px] font-semibold text-white/45">Or choose a time</label>
            <input
              type="time"
              value={time && !TIME_SLOTS.includes(time) ? time : ""}
              onChange={(e) => {
                const v = e.target.value;
                if (v) setTime(v);
              }}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none focus:border-brand-teal/40"
            />
            <p className="mt-1 text-[10px] text-white/35">Custom time overrides a selected slot until you tap a slot again.</p>
          </div>
        </div>

        <div className="flex gap-2 border-t border-white/[0.08] p-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 rounded-xl border border-white/15 py-2.5 text-sm font-bold text-white/80 transition hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-brand-teal py-2.5 text-sm font-bold text-[#041208] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue to message
          </button>
        </div>
      </div>
    </div>
  );
}
