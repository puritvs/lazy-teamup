"use client";

import Link from "next/link";
import { useState } from "react";
import { GlobalFilterModal } from "./GlobalFilterModal";
import { GlobalTravelBufferModal } from "./GlobalTravelBufferModal";

type TeamupEvent = {
  id: string;
  title: string;
  start_dt: string;
  end_dt: string;
};

type Props = {
  events?: TeamupEvent[];
  filteredEvents?: TeamupEvent[];
  excludedTitles?: string[];
  setExcludedTitles?: React.Dispatch<React.SetStateAction<string[]>>;
};

export function AppNav({
  events = [],
  filteredEvents = [],
  excludedTitles = [],
  setExcludedTitles,
}: Props) {
  const [showFilters, setShowFilters] = useState(false);
  const [showTravelBuffers, setShowTravelBuffers] = useState(false);

  return (
    <>
      <nav className="mb-6 flex flex-wrap items-center gap-2">
        <Link
          href="/"
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          Dashboard
        </Link>

        <Link
          href="/que-check"
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          Que Check
        </Link>

        {setExcludedTitles && (
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            Filters ({excludedTitles.length})
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowTravelBuffers(true)}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          Travel Buffers
        </button>
      </nav>

      {setExcludedTitles && (
        <GlobalFilterModal
          open={showFilters}
          onClose={() => setShowFilters(false)}
          events={events}
          filteredEvents={filteredEvents}
          excludedTitles={excludedTitles}
          setExcludedTitles={setExcludedTitles}
        />
      )}

      <GlobalTravelBufferModal
        open={showTravelBuffers}
        onClose={() => setShowTravelBuffers(false)}
        events={filteredEvents.length > 0 ? filteredEvents : events}
      />
    </>
  );
}
