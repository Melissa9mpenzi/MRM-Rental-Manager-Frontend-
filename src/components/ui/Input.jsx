import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Reusable Input
 * Props:
 *   label: string
 *   error: string — shows red border + error message below
 *   type: standard HTML input type (password shows toggle)
 *   icon: LucideIcon — shows icon on the left side of the input
 *   + all standard input HTML props
 */
export const Input = forwardRef(function Input(
  { label, error, type = "text", icon: Icon, className = "", ...props },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="w-full">
      {label && (
        <label className="input-label">
          {label}
          {props.required && <span className="text-brand-teal ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-mid"
          />
        )}
        <input
          ref={ref}
          type={inputType}
          className={`${error ? "input-error" : "input-field"} ${
            isPassword ? "pr-10" : ""
          } ${Icon ? "pl-10" : ""} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-mid hover:text-brand-teal transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
});
