"use client";

import { useMemo, useState } from "react";
import { DateDisplayFormat, formatEventDateRange } from "@/utils/date";

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
  loading: boolean;
  onRefresh: () => void;
  dateFormat: DateDisplayFormat;
};

export function EventListButton({
  events,
  filteredEvents,
  excludedTitles,
  setExcludedTitles,
  loading,
  onRefresh,
  dateFormat,
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
    setExcludedTitles((current) =>
      current.includes(title)
        ? current.filter((item) => item !== title)
        : [...current, title],
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Events</h2>
          <p className="text-sm text-zinc-400">
            {filteredEvents.length} showing / {events.length} total
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {eventTitles.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-black/30 p-4">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-zinc-100">Filter out events</h3>
              <p className="text-sm text-zinc-400">
                {excludedTitles.length} hidden
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
            className="mb-3 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-600"
          />

          <div className="grid max-h-56 grid-cols-1 gap-2 overflow-y-auto pr-2 sm:grid-cols-2 xl:grid-cols-3">
            {searchedTitles.map((title) => {
              const count = events.filter(
                (event) => event.title === title,
              ).length;

              const checked = excludedTitles.includes(title);

              return (
                <label
                  key={title}
                  className={[
                    "flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-800 p-3 text-sm transition",
                    checked
                      ? "bg-zinc-800 opacity-60"
                      : "bg-zinc-950 hover:bg-zinc-900",
                  ].join(" ")}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleExcludedTitle(title)}
                  />

                  <span className="flex flex-1 items-center justify-between gap-2">
                    <span className="font-medium text-zinc-100">{title}</span>

                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                      {count}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      <div className="max-h-[70vh] overflow-y-auto rounded-xl border border-zinc-800 bg-black/30 p-2 sm:max-h-[600px]">
        {filteredEvents.length === 0 ? (
          <p className="p-4 text-sm text-zinc-400">No events to display.</p>
        ) : (
          <ul className="space-y-3">
            {filteredEvents.map((event) => (
              <li
                key={event.id}
                className="rounded-lg border border-zinc-800 bg-zinc-950 p-4"
              >
                <div className="font-semibold text-zinc-100">{event.title}</div>

                <div className="mt-1 text-sm text-zinc-400">
                  {formatEventDateRange(
                    event.start_dt,
                    event.end_dt,
                    dateFormat,
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
