"use client";

import { useEffect, useState } from "react";
import { QueCheckForm } from "./QueCheckForm";
import { DateDisplayFormat } from "@/utils/date";
import { useGlobalSettings } from "@/features/settings/GlobalSettingsProvider";
type TeamupEvent = {
  id: string;
  title: string;
  start_dt: string;
  end_dt: string;
};

const months = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export function QueCheckDashboard() {
  const [month, setMonth] = useState(6);
  const [year, setYear] = useState(2026);
  const [dateFormat] = useState<DateDisplayFormat>("day-month-year");
  const { setEvents, filteredEvents } = useGlobalSettings();

  const [rawEvents, setRawEvents] = useState<TeamupEvent[]>([]);
  //   const [events, setEvents] = useState<TeamupEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  //   const [excludedTitles, setExcludedTitles] = useLocalStorage<string[]>(
  //     "lazy-teamup-excluded-titles",
  //     [],
  //   );

  async function loadEvents() {
    setLoadingEvents(true);

    try {
      const res = await fetch(
        `/api/teamup/events/by-month?year=${year}&month=${month}`,
      );

      const data = await res.json();
      const nextEvents = data.events ?? data;
      setRawEvents(nextEvents);
      setEvents(nextEvents);
    } finally {
      setLoadingEvents(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, [year, month]);

  //   const filteredEvents = useMemo(() => {
  //     return events.filter((event) => !excludedTitles.includes(event.title));
  //   }, [events, excludedTitles]);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-zinc-100">
            Que Check Event Source
          </h2>
          <p className="text-sm text-zinc-400">
            Que Check uses these currently visible events for overlap and travel
            checks.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm text-zinc-400">Month</span>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none"
            >
              {months.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm text-zinc-400">Year</span>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none"
            >
              {Array.from({ length: 21 }, (_, index) => 2020 + index).map(
                (item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ),
              )}
            </select>
          </label>

          <button
            type="button"
            onClick={loadEvents}
            disabled={loadingEvents}
            className="self-end rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {loadingEvents ? "Loading..." : "Refresh Events"}
          </button>
        </div>

        <p className="mt-4 text-xs text-zinc-500">
          {filteredEvents.length} visible / {rawEvents.length} total events
        </p>
      </section>

      <QueCheckForm events={filteredEvents} dateFormat={dateFormat} />
    </div>
  );
}
