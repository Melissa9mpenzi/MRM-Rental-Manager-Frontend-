/**
 * Republic of Uganda government portal branding — official coat of arms.
 */
const CREST_SRC = "/images/government/uganda-coat-of-arms.png";

export default function GovBrandMark({ compact = false, className = "" }) {
  const size = compact ? 48 : 64;
  return (
    <div className={`gov-brand ${compact ? "gov-brand--compact" : ""} ${className}`.trim()}>
      <div className="gov-brand__crest-wrap">
        <img
          src={CREST_SRC}
          alt="Coat of arms of the Republic of Uganda"
          className="gov-brand__crest"
          width={size}
          height={size}
          decoding="async"
        />
      </div>
      <div className="gov-brand__text">
        <p className="gov-brand__republic">Republic of Uganda</p>
        <p className="gov-brand__portal">Government Portal</p>
        <p className="gov-brand__product">RentDirect UG</p>
      </div>
    </div>
  );
}
