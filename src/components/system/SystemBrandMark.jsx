import BrandMark from "../brand/BrandMark";

/** Super Admin sidebar branding — RentDirect logo + console title */
export default function SystemBrandMark({ compact = false }) {
  return (
    <div className={`sys-brand ${compact ? "sys-brand--compact" : ""}`}>
      <div className="sys-brand__logo-wrap">
        <BrandMark imgClassName={compact ? "h-8 w-auto max-w-[120px]" : "h-10 w-auto max-w-[150px] object-contain"} />
      </div>
      <div className="sys-brand__text">
        <p className="sys-brand__console">Super Admin Console</p>
        {!compact && (
          <p className="sys-brand__role">
            <span className="sys-brand__role-dot" aria-hidden />
            Global platform control
          </p>
        )}
      </div>
    </div>
  );
}
