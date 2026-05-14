/**
 * AuthLayout — fits login/register in the viewport: no scroll panel; centered card.
 */
import { Link, Outlet } from "react-router-dom";
import mrmLogo from "../../assets/MRM-LOGO.png";

const AC = "#10B981";

export default function AuthLayout() {
  return (
    <div className="flex h-dvh min-h-0 w-full flex-col overflow-hidden bg-brand-bg bg-rd-gradient bg-rd-mesh text-white">
      <header className="flex h-11 flex-shrink-0 items-center justify-center border-b border-white/[0.08] bg-[#060a0e]/90 px-4 backdrop-blur-xl">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-extrabold tracking-tight text-white transition hover:opacity-90 sm:text-sm"
        >
          <img src={mrmLogo} alt="" className="h-6 w-auto opacity-95 sm:h-7" />
          RentDirect <span style={{ color: AC }}>UG</span>
        </Link>
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-contain">
        <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center px-3 py-2 sm:px-4 sm:py-3">
        <div className="w-full max-w-lg shrink-0 animate-fade-in">
          <Outlet />
        </div>
        </div>
      </main>
    </div>
  );
}
