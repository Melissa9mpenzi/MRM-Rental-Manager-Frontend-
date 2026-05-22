/** Super Admin sidebar branding — official Uganda coat of arms (user logo). */
const CREST_SRC = "/images/government/uganda-coat-of-arms.png";

export default function SystemBrandMark() {
  return (
    <div className="sys-brand">
      <div className="sys-brand__crest-wrap">
        <img
          src={CREST_SRC}
          alt="Coat of arms of the Republic of Uganda"
          className="sys-brand__crest"
          width={52}
          height={52}
          decoding="async"
        />
      </div>
      <div className="sys-brand__text">
        <p className="sys-brand__republic">Republic of Uganda</p>
        <p className="sys-brand__product">
          RentDirect <span className="sys-brand__ug">UG</span>
        </p>
        <p className="sys-brand__role">
          <span className="sys-brand__role-dot" aria-hidden />
          Super Admin
        </p>
      </div>
    </div>
  );
}
