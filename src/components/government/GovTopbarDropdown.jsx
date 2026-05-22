import { useEffect, useRef } from "react";

/** Click-outside dismiss wrapper for topbar menus. */
export default function GovTopbarDropdown({ open, onClose, align = "right", className = "", children }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={`gov-topbar-menu ${align === "left" ? "gov-topbar-menu--left" : ""} ${className}`}
      role="menu"
    >
      {children}
    </div>
  );
}
