/**
 * AuthLayout — fits login/register in the viewport: no scroll panel; centered card.
 */
import { Link, Outlet } from "react-router-dom";
import BrandMark from "../brand/BrandMark";

export default function AuthLayout() {
  return (
    <div className="flex h-dvh min-h-0 w-full flex-col overflow-hidden bg-brand-bg text-brand-dark">
      <header className="flex h-14 flex-shrink-0 items-center justify-center border-b border-slate-200 bg-white px-4">
        <Link to="/" className="transition hover:opacity-80">
          <BrandMark imgClassName="h-9 w-auto max-w-[220px] object-contain sm:h-10" />
        </Link>
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-contain bg-brand-bg">
        <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center px-3 py-6 sm:px-4">
          <div className="w-full max-w-lg shrink-0 animate-fade-in">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
