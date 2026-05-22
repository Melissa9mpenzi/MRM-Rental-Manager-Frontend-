import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { govSearchItems } from "../../config/govTopbarConfig";

export default function GovCommandPalette({ open, onClose, role }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const items = useMemo(() => govSearchItems(role), [role]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const hay = [item.label, ...(item.keywords || [])].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, Math.max(0, filtered.length - 1)));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && filtered[activeIndex]) {
        e.preventDefault();
        navigate(filtered[activeIndex].path);
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, activeIndex, navigate, onClose]);

  if (!open) return null;

  const groups = filtered.reduce((acc, item) => {
    const g = item.group || "Pages";
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {});

  let rowIndex = -1;

  return (
    <div className="gov-palette-backdrop" role="presentation" onClick={onClose}>
      <div
        className="gov-palette"
        role="dialog"
        aria-modal="true"
        aria-label="Search government portal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="gov-palette__search">
          <Search size={18} className="text-white/40" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, queues, and modules…"
            aria-label="Search"
          />
          <kbd>Esc</kbd>
          <button type="button" className="gov-palette__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="gov-palette__results">
          {filtered.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-white/45">No matches for &quot;{query}&quot;</p>
          )}
          {Object.entries(groups).map(([group, groupItems]) => (
            <div key={group}>
              <p className="gov-palette__group">{group}</p>
              <ul>
                {groupItems.map((item) => {
                  rowIndex += 1;
                  const idx = rowIndex;
                  const isActive = idx === activeIndex;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={`gov-palette__item ${isActive ? "gov-palette__item--active" : ""}`}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => {
                          navigate(item.path);
                          onClose();
                        }}
                      >
                        <span>{item.label}</span>
                        <span className="gov-palette__path">{item.path}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
