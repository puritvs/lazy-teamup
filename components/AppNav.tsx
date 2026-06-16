// components/AppNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { GlobalFilterModal } from "./GlobalFilterModal";
import { GlobalTravelBufferModal } from "./GlobalTravelBufferModal";
import { useGlobalSettings } from "@/features/settings/GlobalSettingsProvider";

export function AppNav() {
  const pathname = usePathname();
  const [showFilters, setShowFilters] = useState(false);
  const [showTravelBuffers, setShowTravelBuffers] = useState(false);

  const { events, filteredEvents, excludedTitles, setExcludedTitles } =
    useGlobalSettings();

  const dashboardActive = pathname === "/";
  const queCheckActive = pathname === "/que-check";

  return (
    <>
      <nav className="sticky top-0 z-40 hidden border-b border-zinc-800 bg-black/80 px-6 py-4 backdrop-blur md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex gap-3">
            <Link
              href="/"
              className={[
                "rounded-lg px-3 py-2 text-sm transition",
                dashboardActive
                  ? "bg-white text-black"
                  : "text-zinc-100 hover:bg-zinc-900 hover:text-white",
              ].join(" ")}
            >
              Dashboard
            </Link>

            <Link
              href="/que-check"
              className={[
                "rounded-lg px-3 py-2 text-sm transition",
                queCheckActive
                  ? "bg-white text-black"
                  : "text-zinc-100 hover:bg-zinc-900 hover:text-white",
              ].join(" ")}
            >
              Que Check
            </Link>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(true)}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Filters ({excludedTitles.length})
            </button>

            <button
              type="button"
              onClick={() => setShowTravelBuffers(true)}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Travel Buffers
            </button>
          </div>
        </div>
      </nav>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800 bg-black/95 px-2 py-2 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
          <Link
            href="/"
            className={[
              "rounded-lg px-2 py-2 text-center text-xs transition",
              dashboardActive
                ? "bg-white text-black"
                : "bg-zinc-900 text-zinc-300",
            ].join(" ")}
          >
            Dashboard
          </Link>

          <Link
            href="/que-check"
            className={[
              "rounded-lg px-2 py-2 text-center text-xs transition",
              queCheckActive
                ? "bg-white text-black"
                : "bg-zinc-900 text-zinc-300",
            ].join(" ")}
          >
            Que Check
          </Link>

          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="rounded-lg bg-zinc-900 px-2 py-2 text-xs text-zinc-300"
          >
            Filters
            {excludedTitles.length > 0 ? ` (${excludedTitles.length})` : ""}
          </button>

          <button
            type="button"
            onClick={() => setShowTravelBuffers(true)}
            className="rounded-lg bg-zinc-900 px-2 py-2 text-xs text-zinc-300"
          >
            Travel
          </button>
        </div>
      </nav>

      <GlobalFilterModal
        open={showFilters}
        onClose={() => setShowFilters(false)}
        events={events}
        filteredEvents={filteredEvents}
        excludedTitles={excludedTitles}
        setExcludedTitles={setExcludedTitles}
      />

      <GlobalTravelBufferModal
        open={showTravelBuffers}
        onClose={() => setShowTravelBuffers(false)}
        events={filteredEvents}
      />
    </>
  );
}
