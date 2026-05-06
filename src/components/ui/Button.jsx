import { Loader2 } from "lucide-react";

/**
 * Reusable Button
 * Props:
 *   variant: "primary" | "outline" | "ghost" | "danger"
 *   size: "sm" | "md" | "lg"
 *   loading: bool — shows spinner, disables button
 *   fullWidth: bool
 *   + all standard button HTML props
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}) {
  const base = {
    primary: "btn-primary",
    outline:  "btn-outline",
    ghost:    "btn-ghost",
    danger:   "btn-danger",
  }[variant] || "btn-primary";

  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "", // defined in CSS class
    lg: "text-base px-6 py-3",
  }[size] || "";

  return (
    <button
      className={`${base} ${sizes} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}