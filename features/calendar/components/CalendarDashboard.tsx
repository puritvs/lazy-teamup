"use client";

import { useEffect, useState } from "react";
import { EventList } from "@/features/calendar/components/EventList";
import { MonthlySummary } from "@/features/calendar-summary/components/MonthlySummary";
import { OverlapSummary } from "@/features/calendar-overlaps/components/OverlapSummary";
import { AvailableQueFinder } from "@/features/available-que/components/AvailableQueFinder";
import { DateDisplayFormat } from "@/utils/date";
import { useGlobalSettings } from "@/features/settings/GlobalSettingsProvider";
import { CalendarMonthView } from "@/features/calendar-view/components/CalendarMonthView";
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
  const [dateFormat, setDateFormat] =
    useState<DateDisplayFormat>("day-month-year");
  const { setEvents, filteredEvents } = useGlobalSettings();

  const [rawEvents, setRawEvents] = useState<TeamupEvent[]>([]);

  const [loadingEvents, setLoadingEvents] = useState(false);

  const [showEventSummary, setShowEventSummary] = useState(false);
  const [showEventList, setShowEventList] = useState(false);
  const [calendarName, setCalendarName] = useState("Teamup Calendar");
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

  useEffect(() => {
    async function loadCalendarName() {
      try {
        const res = await fetch("/api/teamup/calendar");
        const data = await res.json();

        setCalendarName(data.name ?? "Teamup Calendar");
      } catch {
        setCalendarName("Teamup Calendar");
      }
    }

    loadCalendarName();
  }, []);
  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              <option value="day-month-year">01-06-2026</option>
              <option value="month-name">01 Jun 2026</option>r.leng
            </select>
          </label>

          <button
            type="button"
            onClick={loadEvents}
            disabled={loadingEvents}
            className="self-end rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {loadingEvents ? "Loading..." : "Refresh"}
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
        <button
          type="button"
          onClick={() => setShowEventSummary((current) => !current)}
          className="flex w-full items-center justify-between"
        >
          <div className="text-left">
            <h2 className="text-lg font-bold text-zinc-100">Event Summary</h2>
            <p className="text-sm text-zinc-400">Optional monthly overview.</p>
          </div>

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
      <div className="grid gap-6 xl:grid-cols-[500px_1fr]">
        <OverlapSummary
          events={filteredEvents}
          dateFormat={dateFormat}
          year={year}
          month={month}
        />
        <AvailableQueFinder events={filteredEvents} dateFormat={dateFormat} />
      </div>
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
        <CalendarMonthView
          events={filteredEvents}
          year={year}
          month={month}
          dateFormat={dateFormat}
        />
      </section>
    </div>
  );
}
