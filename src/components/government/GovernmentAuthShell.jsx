import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { GOV_PORTAL } from "../../config/governmentPortal";
import GovAgencyLogos from "./GovAgencyLogos";

const CREST_SRC = "/images/government/uganda-coat-of-arms.png";

/**
 * Two-column government auth: branding (left) + form (right).
 */
export default function GovernmentAuthShell({ children, footer }) {
  return (
    <div className="gov-auth-split">
      <aside className="gov-auth-split__brand" aria-label="Government portal branding">
        <div className="gov-auth-split__brand-inner">
          <div className="gov-auth-split__crest-wrap">
            <img
              src={CREST_SRC}
              alt="Coat of arms of the Republic of Uganda"
              className="gov-auth-split__crest"
              width={168}
              height={180}
              decoding="async"
            />
          </div>

          <div className="gov-auth-split__titles">
            <p className="gov-auth-split__republic">Republic of Uganda</p>
            <p className="gov-auth-split__portal">Government Portal</p>
            <p className="gov-auth-split__product">RentDirect UG</p>
            <p className="gov-auth-split__tagline">National Rental Infrastructure System</p>
          </div>

          <GovAgencyLogos />

          <div className="gov-auth-split__warning">
            <Shield size={18} className="shrink-0 text-amber-400" />
            <p>
              <strong>Secure access.</strong> No public registration. Misuse of this system is a
              criminal offence. All actions are audited.
            </p>
          </div>

          <div className="gov-auth-split__brand-footer">
            <Link to={GOV_PORTAL.login} className="hover:text-emerald-400">
              Government sign in
            </Link>
            <span className="text-white/20">·</span>
            <a href="/" className="hover:text-white/70">
              Public site
            </a>
          </div>
        </div>
      </aside>

      <section className="gov-auth-split__form">
        <div className="gov-auth-split__form-inner">
          {children}
          {footer}
        </div>
      </section>
    </div>
  );
}
