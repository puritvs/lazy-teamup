"use client";

import { useMemo, useState } from "react";
import { MonthlySummary } from "@/features/calendar-summary/components/MonthlySummary";
import { OverlapSummary } from "@/features/calendar-overlaps/components/OverlapSummary";
import { AvailableQueFinder } from "@/features/available-que/components/AvailableQueFinder";

import { useGlobalSettings } from "@/features/settings/GlobalSettingsProvider";
import { CalendarMonthView } from "@/features/calendar-view/components/CalendarMonthView";
import { CalendarVisualItem } from "@/features/calendar-view/types";
import {
  findOverlappingEvents,
  getOverlappingEventIds,
} from "@/features/calendar-overlaps/services/findOverlappingEvents";

export function CalendarDashboard() {
  const {
    filteredEvents,
    calendarLayers,
    calendarMonth,
    setCalendarMonth,
    calendarYear,
    setCalendarYear,
    dateFormat,
  } = useGlobalSettings();
  const [showCalendarEvents, setShowCalendarEvents] = useState(true);
  const [highlightConflicts, setHighlightConflicts] = useState(true);
  const [showCalendarAvailableQue, setShowCalendarAvailableQue] =
    useState(false);
  const [showCalendarQueCheck, setShowCalendarQueCheck] = useState(false);

  const [showEventSummary, setShowEventSummary] = useState(false);

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
  const quickInsights = [
    {
      label: "Events",
      value: filteredEvents.length,
      tone: "text-zinc-100",
    },
    {
      label: "Overlapping events",
      value: highlightedEventIds.size,
      tone: "text-red-200",
    },
    {
      label: "Overlap groups",
      value: overlapGroups.length,
      tone: "text-red-200",
    },
    {
      label: "Available Que",
      value: calendarLayers.availableQue.length,
      tone: "text-emerald-200",
    },
    {
      label: "Que Check",
      value: calendarLayers.queCheck.length,
      tone: "text-sky-200",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <div className="mb-3">
          <h2 className="text-lg font-bold text-zinc-100">Calendar Layers</h2>
          <p className="text-sm text-zinc-400">
            Control what appears in the primary calendar.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
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
            Highlight overlaps ({highlightedEventIds.size})
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

      <CalendarMonthView
        events={showCalendarEvents ? filteredEvents : []}
        visualItems={calendarVisualItems}
        highlightedEventIds={highlightedEventIds}
        year={calendarYear}
        month={calendarMonth}
        dateFormat={dateFormat}
        onMonthChange={(nextYear, nextMonth) => {
          setCalendarYear(nextYear);
          setCalendarMonth(nextMonth);
        }}
      />

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-zinc-100">Quick Insights</h2>
          <p className="text-sm text-zinc-400">
            Current filtered calendar overview.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {quickInsights.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-zinc-800 bg-zinc-950 p-4"
            >
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                {item.label}
              </p>
              <p className={`mt-2 text-2xl font-bold ${item.tone}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-100">Analysis Panels</h2>
          <p className="text-sm text-zinc-400">
            Availability, overlaps, and optional event overview.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_500px]">
          <AvailableQueFinder events={filteredEvents} dateFormat={dateFormat} />

          <OverlapSummary
            events={filteredEvents}
            dateFormat={dateFormat}
            year={calendarYear}
            month={calendarMonth}
          />
        </div>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
          <button
            type="button"
            onClick={() => setShowEventSummary((current) => !current)}
            className="flex w-full items-center justify-between"
          >
            <div className="text-left">
              <h2 className="text-lg font-bold text-zinc-100">Event Summary</h2>
              <p className="text-sm text-zinc-400">
                Optional monthly overview.
              </p>
            </div>

            <span className="text-sm text-zinc-400">
              {showEventSummary ? "Hide" : "Show"}
            </span>
          </button>

          {showEventSummary && (
            <div className="mt-4">
              <MonthlySummary
                year={calendarYear}
                month={calendarMonth}
                dateFormat={dateFormat}
                embedded
              />
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
