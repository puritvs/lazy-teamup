"use client";

import { useEffect, useMemo, useState } from "react";
import { findAvailableQue } from "../services/findAvailableQue";
import { EventForAvailability } from "../types";
import { DateDisplayFormat, formatDate } from "@/utils/date";
import { useGlobalSettings } from "@/features/settings/GlobalSettingsProvider";
import {
  DEFAULT_LOCATION,
  extractLocationFromTitle,
  getUniqueNonDefaultLocations,
} from "@/features/travel-buffer/utils";
type Props = {
  events: EventForAvailability[];
  dateFormat: DateDisplayFormat;
};

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getEndOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);
}

function getWeekKey(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);

  return monday.toISOString().slice(0, 10);
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;

  return `${hours}h ${remainingMinutes}m`;
}

function isSameDate(dateTime: string, date: string) {
  return dateTime.slice(0, 10) === date;
}

function getNearestPreviousEvent(
  slotStart: string,
  date: string,
  events: EventForAvailability[],
) {
  const slotStartTime = new Date(`${date}T${slotStart}:00`).getTime();

  return events
    .filter((event) => {
      if (!isSameDate(event.start_dt, date)) return false;

      const eventEndTime = new Date(event.end_dt).getTime();
      return eventEndTime <= slotStartTime;
    })
    .sort(
      (a, b) => new Date(b.end_dt).getTime() - new Date(a.end_dt).getTime(),
    )[0];
}

function getNearestNextEvent(
  slotEnd: string,
  date: string,
  events: EventForAvailability[],
) {
  const slotEndTime = new Date(`${date}T${slotEnd}:00`).getTime();

  return events
    .filter((event) => {
      if (!isSameDate(event.start_dt, date)) return false;

      const eventStartTime = new Date(event.start_dt).getTime();
      return eventStartTime >= slotEndTime;
    })
    .sort(
      (a, b) => new Date(a.start_dt).getTime() - new Date(b.start_dt).getTime(),
    )[0];
}

function getSlotTravelContext(
  slot: {
    start: string;
    end: string;
  },
  date: string,
  events: EventForAvailability[],
) {
  const previousEvent = getNearestPreviousEvent(slot.start, date, events);
  const nextEvent = getNearestNextEvent(slot.end, date, events);

  const previousLocation = previousEvent
    ? extractLocationFromTitle(previousEvent.title)
    : DEFAULT_LOCATION;

  const nextLocation = nextEvent
    ? extractLocationFromTitle(nextEvent.title)
    : DEFAULT_LOCATION;

  const requiresTravelBefore = previousLocation !== DEFAULT_LOCATION;
  const requiresTravelAfter = nextLocation !== DEFAULT_LOCATION;

  return {
    previousLocation,
    nextLocation,
    requiresTravelBefore,
    requiresTravelAfter,
    requiresTravel: requiresTravelBefore || requiresTravelAfter,
  };
}

function buildCopyableAvailableQueText(
  availableDays: {
    date: string;
    slots: {
      start: string;
      end: string;
      durationMinutes?: number;
    }[];
  }[],
  events: EventForAvailability[],
) {
  const daysWithSlots = availableDays.filter((day) => day.slots.length > 0);

  return daysWithSlots
    .map((day, index) => {
      const previousDay = daysWithSlots[index - 1];

      const shouldAddWeekSpacing =
        previousDay && getWeekKey(previousDay.date) !== getWeekKey(day.date);

      const slotLines = day.slots.flatMap((slot) => {
        const duration =
          slot.durationMinutes !== undefined
            ? ` (${formatDuration(slot.durationMinutes)})`
            : "";

        const travelContext = getSlotTravelContext(slot, day.date, events);

        const lines = [`- ${slot.start} - ${slot.end}${duration}`];

        if (
          travelContext.requiresTravelBefore &&
          travelContext.requiresTravelAfter &&
          travelContext.previousLocation === travelContext.nextLocation
        ) {
          lines.push(`  [travel: ${travelContext.previousLocation}]`);
        } else {
          if (travelContext.requiresTravelBefore) {
            lines.push(`  [travel from: ${travelContext.previousLocation}]`);
          }

          if (travelContext.requiresTravelAfter) {
            lines.push(`  [next location: ${travelContext.nextLocation}]`);
          }
        }

        return lines;
      });

      return `${shouldAddWeekSpacing ? "\n" : ""}${[
        formatDate(day.date, "day-month-year"),
        ...slotLines,
      ].join("\n")}`;
    })
    .join("\n\n");
}

export function AvailableQueFinder({ events, dateFormat }: Props) {
  const [startDate, setStartDate] = useState(getToday());
  const [endDate, setEndDate] = useState(getEndOfCurrentMonth());
  const [dailyStartTime, setDailyStartTime] = useState("10:00");
  const [dailyEndTime, setDailyEndTime] = useState("22:00");

  const [minDurationHours, setMinDurationHours] = useState(0);
  const [minDurationMins, setMinDurationMins] = useState(30);

  const [submitted, setSubmitted] = useState(false);
  const [showCopyableText, setShowCopyableText] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showOnlyTravelSlots, setShowOnlyTravelSlots] = useState(false);
  const detectedLocations = useMemo(() => {
    return getUniqueNonDefaultLocations(events);
  }, [events]);
  const minDurationMinutes = minDurationHours * 60 + minDurationMins;
  const { ensureTravelBuffersForLocations } = useGlobalSettings();
  const error = useMemo(() => {
    if (startDate > endDate) {
      return "Start date cannot be after end date.";
    }

    if (dailyStartTime >= dailyEndTime) {
      return "Daily start time must be before daily end time.";
    }

    if (minDurationMinutes < 1) {
      return "Minimum duration must be at least 1 minute.";
    }

    return null;
  }, [startDate, endDate, dailyStartTime, dailyEndTime, minDurationMinutes]);

  const availableDays = useMemo(() => {
    if (!submitted || error) return [];

    return findAvailableQue({
      events,
      startDate,
      endDate,
      dailyStartTime,
      dailyEndTime,
      minDurationMinutes,
    });
  }, [
    submitted,
    error,
    events,
    startDate,
    endDate,
    dailyStartTime,
    dailyEndTime,
    minDurationMinutes,
  ]);

  const displayedAvailableDays = useMemo(() => {
    if (!showOnlyTravelSlots) {
      return availableDays;
    }

    return availableDays
      .map((day) => ({
        ...day,
        slots: day.slots.filter((slot) => {
          const travelContext = getSlotTravelContext(slot, day.date, events);
          return travelContext.requiresTravel;
        }),
      }))
      .filter((day) => day.slots.length > 0);
  }, [availableDays, showOnlyTravelSlots, events]);

  const totalSlots = displayedAvailableDays.reduce(
    (sum, day) => sum + day.slots.length,
    0,
  );

  const copyableText = buildCopyableAvailableQueText(
    displayedAvailableDays,
    events,
  );
  useEffect(() => {
    ensureTravelBuffersForLocations(detectedLocations);
  }, [detectedLocations, ensureTravelBuffersForLocations]);
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-zinc-100">Find Available Que</h2>

        <p className="text-sm text-zinc-400">
          Find free time slots not occupied by events.
        </p>

        <p className="mt-1 text-xs text-zinc-500">
          Using {events.length} currently visible events. Respects current
          filters.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm text-zinc-400">Start date</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none"
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm text-zinc-400">End date</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none"
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm text-zinc-400">Daily start</span>
          <input
            type="time"
            value={dailyStartTime}
            onChange={(e) => setDailyStartTime(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none"
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm text-zinc-400">Daily end</span>
          <input
            type="time"
            value={dailyEndTime}
            onChange={(e) => setDailyEndTime(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none"
          />
        </label>

        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm text-zinc-400">Minimum slot duration</span>

          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <input
                type="number"
                min={0}
                value={minDurationHours}
                onChange={(e) => setMinDurationHours(Number(e.target.value))}
                className="w-24 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none"
              />
              <span className="mt-1 text-xs text-zinc-500">Hours</span>
            </div>

            <span className="mt-[-16px] text-zinc-500">:</span>

            <div className="flex flex-col">
              <input
                type="number"
                min={0}
                max={59}
                value={minDurationMins}
                onChange={(e) =>
                  setMinDurationMins(
                    Math.min(59, Math.max(0, Number(e.target.value))),
                  )
                }
                className="w-24 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none"
              />
              <span className="mt-1 text-xs text-zinc-500">Minutes</span>
            </div>
          </div>

          <p className="text-xs text-zinc-500">
            Current: {formatDuration(minDurationMinutes)}
          </p>
        </label>

        <label className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3 sm:col-span-2">
          <input
            type="checkbox"
            checked={showOnlyTravelSlots}
            onChange={(e) => setShowOnlyTravelSlots(e.target.checked)}
            className="mt-1"
          />

          <span>
            <span className="block text-sm text-zinc-100">
              Show only slots requiring travel
            </span>

            <span className="block text-xs text-zinc-500">
              Shows slots where the nearest previous or next event on the same
              day has a non-default location.
            </span>
          </span>
        </label>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <button
        type="button"
        onClick={() => setSubmitted(true)}
        disabled={Boolean(error)}
        className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
      >
        Find Available Que
      </button>

      {submitted && !error && (
        <div className="mt-5">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-zinc-100">Available slots</p>
              <p className="text-xs text-zinc-500">
                {totalSlots} slots found • Minimum{" "}
                {formatDuration(minDurationMinutes)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowCopyableText((current) => !current)}
                disabled={totalSlots === 0}
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-zinc-900 hover:text-white disabled:opacity-50"
              >
                {showCopyableText ? "Hide Text" : "Show Text"}
              </button>

              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(copyableText);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                disabled={totalSlots === 0}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-black disabled:opacity-50"
              >
                {copied ? "Copied" : "Copy"}
              </button>

              <span className="rounded-full bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300">
                {totalSlots}
              </span>
            </div>
          </div>

          {showCopyableText && (
            <textarea
              readOnly
              value={copyableText}
              className="mb-4 h-72 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 p-3 font-mono text-sm text-zinc-100 outline-none"
            />
          )}

          {totalSlots === 0 ? (
            <p className="text-sm text-zinc-400">No available Que found.</p>
          ) : (
            <div className="h-[60vh] space-y-3 overflow-y-auto pr-2 lg:h-[520px]">
              {displayedAvailableDays.map((day) => (
                <div
                  key={day.date}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 p-4"
                >
                  <p className="mb-3 font-semibold text-zinc-100">
                    {formatDate(day.date, dateFormat)}
                  </p>

                  <div className="space-y-2">
                    {day.slots.map((slot) => {
                      const travelContext = getSlotTravelContext(
                        slot,
                        day.date,
                        events,
                      );

                      return (
                        <div
                          key={`${slot.date}-${slot.start}-${slot.end}`}
                          className="rounded-md border border-zinc-800 bg-black/40 px-3 py-2 text-sm"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-zinc-100">
                              {slot.start} - {slot.end}
                            </span>

                            <span className="text-zinc-500">
                              {formatDuration(slot.durationMinutes)}
                            </span>
                          </div>

                          {travelContext.requiresTravel && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {travelContext.requiresTravelBefore &&
                              travelContext.requiresTravelAfter &&
                              travelContext.previousLocation ===
                                travelContext.nextLocation ? (
                                <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                                  [travel: {travelContext.previousLocation}]
                                </span>
                              ) : (
                                <>
                                  {travelContext.requiresTravelBefore && (
                                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                                      [travel from:{" "}
                                      {travelContext.previousLocation}]
                                    </span>
                                  )}

                                  {travelContext.requiresTravelAfter && (
                                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                                      [next location:{" "}
                                      {travelContext.nextLocation}]
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
