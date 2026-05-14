import { Outlet } from "react-router-dom";
import { useState } from "react";
import MarketingSidebar, { MarketingTopBar } from "./MarketingSidebar";

/**
 * Public / marketing shell: viewport locked; sidebar nav scrolls independently,
 * main region scrolls for long browse/static pages.
 */
export default function MarketingLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-dvh min-h-0 w-full overflow-hidden bg-brand-bg bg-rd-gradient bg-rd-mesh text-white">
      <MarketingSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <MarketingTopBar onMenu={() => setMobileOpen(true)} />
        <main className="overflow-panel-y min-h-0 flex-1 bg-rd-gradient bg-rd-mesh">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
