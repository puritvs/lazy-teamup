"use client";

import { useMemo, useState } from "react";

type TeamupEvent = {
  id: string;
  title: string;
  start_dt: string;
  end_dt: string;
};

type Props = {
  events: TeamupEvent[];
  filteredEvents: TeamupEvent[];
  excludedTitles: string[];
  setExcludedTitles: React.Dispatch<React.SetStateAction<string[]>>;
};

export function EventFilterPanel({
  events,
  filteredEvents,
  excludedTitles,
  setExcludedTitles,
}: Props) {
  const [search, setSearch] = useState("");

  const eventTitles = useMemo(() => {
    return Array.from(new Set(events.map((event) => event.title))).sort();
  }, [events]);

  const searchedTitles = useMemo(() => {
    return eventTitles.filter((title) =>
      title.toLowerCase().includes(search.toLowerCase()),
    );
  }, [eventTitles, search]);

  function toggleExcludedTitle(title: string) {
    const next = excludedTitles.includes(title)
      ? excludedTitles.filter((item) => item !== title)
      : [...excludedTitles, title];

    setExcludedTitles(next);
  }
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-100">Event Filters</h2>
          <p className="text-sm text-zinc-400">
            {filteredEvents.length} visible / {events.length} total events
          </p>
          <p className="text-xs text-zinc-500">
            Filters affect Overlapping Events, Available Que, Que Check, and Raw
            Event Data.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          <button
            type="button"
            onClick={() => setExcludedTitles(eventTitles)}
            className="text-zinc-300 underline hover:text-white"
          >
            Hide all
          </button>

          <button
            type="button"
            onClick={() => setExcludedTitles([])}
            className="text-zinc-300 underline hover:text-white"
          >
            Show all
          </button>
        </div>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search event type..."
        className="mb-4 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-600"
      />
      {excludedTitles.length > 0 && (
        <div className="mb-4 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-zinc-100">Hidden filters</p>

            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
              {excludedTitles.length}
            </span>
          </div>

          <div className="flex max-h-24 flex-wrap gap-2 overflow-y-auto pr-1">
            {excludedTitles.map((title) => (
              <button
                key={title}
                type="button"
                onClick={() =>
                  setExcludedTitles((current) =>
                    current.filter((item) => item !== title),
                  )
                }
                className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-300 hover:border-zinc-500 hover:text-white"
              >
                {title} ×
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto pr-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {searchedTitles.map((title) => {
          const count = events.filter((event) => event.title === title).length;
          const checked = excludedTitles.includes(title);

          return (
            <button
              key={title}
              type="button"
              onClick={() => toggleExcludedTitle(title)}
              className={[
                "flex w-full cursor-pointer items-center gap-2 rounded-lg border border-zinc-800 p-3 text-left text-sm transition",
                checked
                  ? "bg-zinc-800 opacity-60"
                  : "bg-zinc-950 hover:bg-zinc-900",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                  checked
                    ? "border-red-500 bg-red-950 text-red-200"
                    : "border-zinc-600 bg-black",
                ].join(" ")}
              >
                {checked ? "×" : ""}
              </span>

              <span className="flex flex-1 items-center justify-between gap-2">
                <span className="font-medium text-zinc-100">{title}</span>

                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                  {count}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
