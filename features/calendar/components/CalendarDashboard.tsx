"use client";

import { useEffect, useState, useMemo } from "react";
import { MonthlySummary } from "@/features/calendar-summary/components/MonthlySummary";
import { OverlapSummary } from "@/features/calendar-overlaps/components/OverlapSummary";
import { AvailableQueFinder } from "@/features/available-que/components/AvailableQueFinder";
import { DateDisplayFormat } from "@/utils/date";
import { useGlobalSettings } from "@/features/settings/GlobalSettingsProvider";
import { CalendarMonthView } from "@/features/calendar-view/components/CalendarMonthView";
import { CalendarVisualItem } from "@/features/calendar-view/types";
import {
  findOverlappingEvents,
  getOverlappingEventIds,
} from "@/features/calendar-overlaps/services/findOverlappingEvents";
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
  const { setEvents, filteredEvents, calendarLayers } = useGlobalSettings();
  const [showCalendarEvents, setShowCalendarEvents] = useState(true);
  const [highlightConflicts, setHighlightConflicts] = useState(true);
  const [showCalendarAvailableQue, setShowCalendarAvailableQue] =
    useState(false);
  const [showCalendarQueCheck, setShowCalendarQueCheck] = useState(false);
  const [rawEvents, setRawEvents] = useState<TeamupEvent[]>([]);

  const [loadingEvents, setLoadingEvents] = useState(false);

  const [showEventSummary, setShowEventSummary] = useState(false);
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
  const overlapGroups = useMemo(() => {
    return findOverlappingEvents(filteredEvents);
  }, [filteredEvents]);

  const highlightedEventIds = useMemo(() => {
    if (!highlightConflicts) return new Set<string>();
    return getOverlappingEventIds(overlapGroups);
  }, [highlightConflicts, overlapGroups]);

  const conflictNoticeItems = useMemo<CalendarVisualItem[]>(() => {
    if (!highlightConflicts) return [];

    return overlapGroups.map((group) => {
      const sortedEvents = [...group.events].sort(
        (a, b) =>
          new Date(a.start_dt).getTime() - new Date(b.start_dt).getTime(),
      );

      const firstEvent = sortedEvents[0];

      const latestEndEvent = [...sortedEvents].sort(
        (a, b) => new Date(b.end_dt).getTime() - new Date(a.end_dt).getTime(),
      )[0];

      const startsAt = new Date(group.startTime);
      const endsAt = new Date(group.endTime);
      const spansMultipleDays =
        startsAt.toISOString().slice(0, 10) !==
        endsAt.toISOString().slice(0, 10);

      return {
        id: `conflict-notice-${group.id}`,
        type: "conflict",
        title: `${group.events.length} overlapping events`,
        start_dt: firstEvent.start_dt,
        end_dt: latestEndEvent.end_dt,
        description: spansMultipleDays
          ? `Conflict spans multiple days and ends ${endsAt.toLocaleDateString(
              "en-GB",
            )} ${String(endsAt.getHours()).padStart(2, "0")}:${String(
              endsAt.getMinutes(),
            ).padStart(2, "0")}. Events: ${group.events
              .map((event) => event.title)
              .join(" / ")}`
          : group.events.map((event) => event.title).join(" / "),
      };
    });
  }, [highlightConflicts, overlapGroups]);

  const calendarVisualItems = useMemo(() => {
    return [
      ...conflictNoticeItems,
      ...(showCalendarAvailableQue ? calendarLayers.availableQue : []),
      ...(showCalendarQueCheck ? calendarLayers.queCheck : []),
    ];
  }, [
    conflictNoticeItems,
    showCalendarAvailableQue,
    calendarLayers.availableQue,
    showCalendarQueCheck,
    calendarLayers.queCheck,
  ]);

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
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <h2 className="text-lg font-bold text-zinc-100">Calendar Layers</h2>

        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={showCalendarEvents}
              onChange={(event) => setShowCalendarEvents(event.target.checked)}
            />
            Events
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={highlightConflicts}
              onChange={(event) => setHighlightConflicts(event.target.checked)}
            />
            Highlight conflicts ({highlightedEventIds.size})
          </label>

          <label className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={showCalendarAvailableQue}
              onChange={(event) =>
                setShowCalendarAvailableQue(event.target.checked)
              }
            />
            Available Que ({calendarLayers.availableQue.length})
          </label>

          <label className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={showCalendarQueCheck}
              onChange={(event) =>
                setShowCalendarQueCheck(event.target.checked)
              }
            />
            Que Check ({calendarLayers.queCheck.length})
          </label>
        </div>
      </section>
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
        <CalendarMonthView
          events={showCalendarEvents ? filteredEvents : []}
          visualItems={calendarVisualItems}
          highlightedEventIds={highlightedEventIds}
          year={year}
          month={month}
          dateFormat={dateFormat}
        />
      </section>
    </div>
  );
}
