"use client";

import { useEffect, useMemo, useState } from "react";
import { EventListButton } from "@/features/calendar/components/EventListButton";
import { MonthlySummary } from "@/features/calendar-summary/components/MonthlySummary";
import { OverlapSummary } from "@/features/calendar-overlaps/components/OverlapSummary";
import { DateDisplayFormat } from "@/utils/date";

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

export function CalendarDashboard() {
  const [month, setMonth] = useState(6);
  const [year, setYear] = useState(2026);
  const [dateFormat, setDateFormat] = useState<DateDisplayFormat>("month-name");

  const [events, setEvents] = useState<TeamupEvent[]>([]);
  const [excludedTitles, setExcludedTitles] = useState<string[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [showEventSummary, setShowEventSummary] = useState(false);
  async function loadEvents() {
    setLoadingEvents(true);

    try {
      const res = await fetch(
        `/api/teamup/events/by-month?year=${year}&month=${month}`,
      );

      const data = await res.json();
      setEvents(data.events ?? data);
      setExcludedTitles([]);
    } finally {
      setLoadingEvents(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, [year, month]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => !excludedTitles.includes(event.title));
  }, [events, excludedTitles]);

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <label className="space-y-2">
            <span className="text-sm text-zinc-400">Date format</span>
            <select
              value={dateFormat}
              onChange={(e) =>
                setDateFormat(e.target.value as DateDisplayFormat)
              }
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none"
            >
              <option value="month-number">01/06/2026</option>
              <option value="month-name">01 Jun 2026</option>
            </select>
          </label>
        </div>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[320px_1fr] lg:gap-8">
        <aside className="space-y-6 self-start lg:sticky lg:top-8 lg:h-fit">
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <button
              type="button"
              onClick={() => setShowEventSummary((current) => !current)}
              className="flex w-full items-center justify-between"
            >
              <span className="text-lg font-bold text-zinc-100">
                Event Summary
              </span>

              <span className="text-sm text-zinc-400">
                {showEventSummary ? "Hide" : "Show"}
              </span>
            </button>

            {showEventSummary && (
              <div className="mt-4">
                <MonthlySummary
                  year={year}
                  month={month}
                  dateFormat={dateFormat}
                  embedded
                />
              </div>
            )}
          </section>
          <OverlapSummary events={filteredEvents} dateFormat={dateFormat} />
        </aside>
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
          <EventListButton
            events={events}
            filteredEvents={filteredEvents}
            excludedTitles={excludedTitles}
            setExcludedTitles={setExcludedTitles}
            loading={loadingEvents}
            onRefresh={loadEvents}
            dateFormat={dateFormat}
          />
        </section>
      </div>
    </div>
  );
}
