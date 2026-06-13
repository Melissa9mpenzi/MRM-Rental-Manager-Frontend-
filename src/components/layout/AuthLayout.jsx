/**
 * AuthLayout — fits login/register in the viewport: no scroll panel; centered card.
 */
import { Link, Outlet } from "react-router-dom";
import BrandMark from "../brand/BrandMark";

export default function AuthLayout() {
  return (
    <div className="flex h-dvh min-h-0 w-full flex-col overflow-hidden bg-[#F0FDFA]">
      {/* Subtle dot pattern background */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: "radial-gradient(circle, #0D948820 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <header className="relative z-10 flex h-14 flex-shrink-0 items-center justify-center border-b border-teal-100 bg-white/90 px-4 shadow-sm backdrop-blur-xl">
        <Link to="/" className="transition hover:opacity-90">
          <BrandMark imgClassName="h-9 w-auto max-w-[220px] object-contain sm:h-10" />
        </Link>
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-contain">
        <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center px-3 py-4 sm:px-4 sm:py-6">
          <div className="w-full max-w-lg shrink-0 animate-fade-in">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
