// components/AppNav.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { GlobalFilterModal } from "./GlobalFilterModal";
import { GlobalTravelBufferModal } from "./GlobalTravelBufferModal";
import { useGlobalSettings } from "@/features/settings/GlobalSettingsProvider";

export function AppNav() {
  const [showFilters, setShowFilters] = useState(false);
  const [showTravelBuffers, setShowTravelBuffers] = useState(false);

  const { events, filteredEvents, excludedTitles, setExcludedTitles } =
    useGlobalSettings();

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-zinc-800 bg-black/80 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex gap-3">
            <Link href="/" className="text-zinc-100 hover:text-white">
              Dashboard
            </Link>
            <Link href="/que-check" className="text-zinc-100 hover:text-white">
              Que Check
            </Link>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(true)}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Filters ({excludedTitles.length})
            </button>

            <button
              onClick={() => setShowTravelBuffers(true)}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Travel Buffers
            </button>
          </div>
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
