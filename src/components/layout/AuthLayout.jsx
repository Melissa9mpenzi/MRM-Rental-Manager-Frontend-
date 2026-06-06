/**
 * AuthLayout — fits login/register in the viewport: no scroll panel; centered card.
 */
import { Link, Outlet } from "react-router-dom";
import BrandMark from "../brand/BrandMark";

export default function AuthLayout() {
  return (
    <div className="flex h-dvh min-h-0 w-full flex-col overflow-hidden bg-brand-bg bg-rd-gradient bg-rd-mesh text-white">
      <header className="flex h-12 flex-shrink-0 items-center justify-center border-b border-white/[0.08] bg-[#060a0e]/90 px-4 backdrop-blur-xl">
        <Link to="/" className="transition hover:opacity-90">
          <BrandMark imgClassName="h-9 w-auto max-w-[220px] object-contain sm:h-10" />
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
