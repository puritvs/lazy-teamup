"use client";

import { useMemo, useState } from "react";
import { findAvailableQue } from "../services/findAvailableQue";
import { EventForAvailability } from "../types";
import { DateDisplayFormat, formatDate } from "@/utils/date";

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
function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}
export function AvailableQueFinder({ events, dateFormat }: Props) {
  const [startDate, setStartDate] = useState(getToday());
  const [endDate, setEndDate] = useState(getEndOfCurrentMonth());
  const [dailyStartTime, setDailyStartTime] = useState("10:00");
  const [dailyEndTime, setDailyEndTime] = useState("22:00");
  const [minDurationMinutes, setMinDurationMinutes] = useState(30);
  const [submitted, setSubmitted] = useState(false);

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

  const totalSlots = availableDays.reduce(
    (sum, day) => sum + day.slots.length,
    0,
  );

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

        <label className="space-y-1 sm:col-span-2">
          <span className="text-sm text-zinc-400">
            Minimum slot duration / minutes
          </span>
          <input
            type="number"
            min={1}
            value={minDurationMinutes}
            onChange={(e) => setMinDurationMinutes(Number(e.target.value))}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none"
          />
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
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold text-zinc-100">Available slots</p>
            <span className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-300">
              {totalSlots}
            </span>
          </div>

          {totalSlots === 0 ? (
            <p className="text-sm text-zinc-400">No available Que found.</p>
          ) : (
            <div className="h-[60vh] space-y-3 overflow-y-auto pr-2 lg:h-[520px]">
              {availableDays
                .filter((day) => day.slots.length > 0)
                .map((day) => (
                  <div
                    key={day.date}
                    className="rounded-lg border border-zinc-800 bg-zinc-950 p-4"
                  >
                    <p className="mb-3 font-semibold text-zinc-100">
                      {formatDate(day.date, dateFormat)}{" "}
                    </p>

                    <div className="space-y-2">
                      {day.slots.map((slot) => (
                        <div
                          key={`${slot.date}-${slot.start}-${slot.end}`}
                          className="flex items-center justify-between rounded-md border border-zinc-800 bg-black/40 px-3 py-2 text-sm"
                        >
                          <span className="text-zinc-100">
                            {slot.start} - {slot.end}
                          </span>

                          <span className="text-zinc-500">
                            {formatDuration(slot.durationMinutes)}
                          </span>
                        </div>
                      ))}
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
