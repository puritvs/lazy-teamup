"use client";

import { useEffect, useMemo, useState } from "react";
import { DateDisplayFormat, formatDate } from "@/utils/date";
import {
  findOverlappingEvents,
  OverlapGroup,
} from "../services/findOverlappingEvents";
import { OverlapTimeline } from "./OverlapTimeline";

type TeamupEvent = {
  id: string;
  title: string;
  start_dt: string;
  end_dt: string;
};

type Props = {
  events: TeamupEvent[];
  dateFormat: DateDisplayFormat;
  year: number;
  month: number;
};

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDefaultStartDate(year: number, month: number) {
  const now = new Date();
  const selectedMonth = month - 1;

  const isCurrentMonth =
    now.getFullYear() === year && now.getMonth() === selectedMonth;

  if (isCurrentMonth) {
    return toDateInputValue(now);
  }

  return toDateInputValue(new Date(year, selectedMonth, 1));
}

function getDefaultEndDate(year: number, month: number) {
  return toDateInputValue(new Date(year, month, 0));
}

function eventOverlapsDateRange(
  event: TeamupEvent,
  startDate: string,
  endDate: string,
) {
  const rangeStart = new Date(`${startDate}T00:00:00`).getTime();
  const rangeEnd = new Date(`${endDate}T23:59:59`).getTime();

  const eventStart = new Date(event.start_dt).getTime();
  const eventEnd = new Date(event.end_dt).getTime();

  return eventStart <= rangeEnd && eventEnd >= rangeStart;
}

export function OverlapSummary({ events, dateFormat, year, month }: Props) {
  const [showDetails, setShowDetails] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const [startDate, setStartDate] = useState(() =>
    getDefaultStartDate(year, month),
  );
  const [endDate, setEndDate] = useState(() => getDefaultEndDate(year, month));

  useEffect(() => {
    setStartDate(getDefaultStartDate(year, month));
    setEndDate(getDefaultEndDate(year, month));
    setExpanded(false);
  }, [year, month]);

  const dateFilteredEvents = useMemo(() => {
    return events.filter((event) =>
      eventOverlapsDateRange(event, startDate, endDate),
    );
  }, [events, startDate, endDate]);

  const overlapGroups: OverlapGroup[] = useMemo(() => {
    return findOverlappingEvents(dateFilteredEvents);
  }, [dateFilteredEvents]);

  const displayedGroups = expanded ? overlapGroups : overlapGroups.slice(0, 5);

  const conflictingEventCount = useMemo(() => {
    return new Set(
      overlapGroups.flatMap((group) => group.events.map((event) => event.id)),
    ).size;
  }, [overlapGroups]);

  const highSeverityCount = overlapGroups.filter(
    (group) => group.severity === "high",
  ).length;

  const dateError = startDate > endDate;

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-100">
            Overlapping Events
            <span className="ml-2 text-zinc-500">({overlapGroups.length})</span>
          </h2>
          <p className="text-sm text-zinc-400">
            Based on currently visible events and selected date range.
          </p>
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm text-zinc-400">Overlap start date</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none"
          />
          <p className="text-xs text-zinc-500">
            {formatDate(startDate, dateFormat)}
          </p>
        </label>

        <label className="space-y-1">
          <span className="text-sm text-zinc-400">Overlap end date</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none"
          />
          <p className="text-xs text-zinc-500">
            {formatDate(endDate, dateFormat)}
          </p>
        </label>
      </div>

      {dateError && (
        <p className="mb-4 rounded-lg border border-red-900 bg-red-950/30 p-3 text-sm text-red-300">
          Start date cannot be after end date.
        </p>
      )}

      {!dateError && (
        <>
          <div className="mb-4 grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
              <p className="text-lg font-bold text-zinc-100">
                {overlapGroups.length}
              </p>
              <p className="text-xs text-zinc-500">Groups</p>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
              <p className="text-lg font-bold text-zinc-100">
                {conflictingEventCount}
              </p>
              <p className="text-xs text-zinc-500">Events</p>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
              <p className="text-lg font-bold text-red-300">
                {highSeverityCount}
              </p>
              <p className="text-xs text-zinc-500">High</p>
            </div>
          </div>

          {overlapGroups.length === 0 ? (
            <p className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
              No overlapping events found.
            </p>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setShowDetails((current) => !current)}
                className="mb-4 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
              >
                {showDetails ? "Hide Details" : "Show Details"}
              </button>

              {showDetails && (
                <>
                  <div className="space-y-3">
                    {displayedGroups.map((group) => (
                      <div
                        key={group.id}
                        className={[
                          "rounded-lg border p-4",
                          group.severity === "high"
                            ? "border-red-700 bg-red-950/30"
                            : group.severity === "medium"
                              ? "border-amber-700 bg-amber-950/20"
                              : "border-zinc-700 bg-zinc-950",
                        ].join(" ")}
                      >
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-zinc-100">
                              {formatDate(group.date, dateFormat)}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {group.severity} severity
                            </p>
                          </div>

                          <span className="rounded-full bg-red-950 px-2 py-1 text-xs text-red-200">
                            {group.events.length} events
                          </span>
                        </div>

                        <OverlapTimeline
                          group={group}
                          dateFormat={dateFormat}
                        />
                      </div>
                    ))}
                  </div>

                  {overlapGroups.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setExpanded((current) => !current)}
                      className="mt-4 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                    >
                      {expanded
                        ? "Show Less"
                        : `Show ${overlapGroups.length - 5} More`}
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}
