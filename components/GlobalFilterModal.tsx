"use client";

import { EventFilterPanel } from "@/features/calendar/components/EventFilterPanel";

type TeamupEvent = {
  id: string;
  title: string;
  start_dt: string;
  end_dt: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  events: TeamupEvent[];
  filteredEvents: TeamupEvent[];
  excludedTitles: string[];
  setExcludedTitles: React.Dispatch<React.SetStateAction<string[]>>;
};

export function GlobalFilterModal({
  open,
  onClose,
  events,
  filteredEvents,
  excludedTitles,
  setExcludedTitles,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 p-3">
      <div className="mx-auto max-h-[90vh] max-w-5xl overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-100">Global Filters</h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-800 px-3 py-1 text-sm text-zinc-300"
          >
            Close
          </button>
        </div>

        <EventFilterPanel
          events={events}
          filteredEvents={filteredEvents}
          excludedTitles={excludedTitles}
          setExcludedTitles={setExcludedTitles}
        />
      </div>
    </div>
  );
}
