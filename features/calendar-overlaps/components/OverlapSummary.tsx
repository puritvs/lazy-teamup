"use client";

import { useMemo, useState } from "react";
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
};

export function OverlapSummary({ events, dateFormat }: Props) {
  const [showDetails, setShowDetails] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const overlapGroups: OverlapGroup[] = useMemo(() => {
    return findOverlappingEvents(events);
  }, [events]);

  const displayedGroups = expanded ? overlapGroups : overlapGroups.slice(0, 5);

  const conflictingEventCount = useMemo(() => {
    return new Set(
      overlapGroups.flatMap((group) => group.events.map((event) => event.id)),
    ).size;
  }, [overlapGroups]);

  const highSeverityCount = overlapGroups.filter(
    (group) => group.severity === "high",
  ).length;

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-100">
            Overlapping Events
          </h2>
          <p className="text-sm text-zinc-400">
            Based on currently visible events.
          </p>
        </div>

        <span className="w-fit rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-300">
          {overlapGroups.length} groups
        </span>
      </div>

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
          <p className="text-lg font-bold text-red-300">{highSeverityCount}</p>
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
                          {formatDate(group.date, dateFormat)}{" "}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {group.severity} severity
                        </p>
                      </div>

                      <span className="rounded-full bg-red-950 px-2 py-1 text-xs text-red-200">
                        {group.events.length} events
                      </span>
                    </div>

                    <OverlapTimeline group={group} dateFormat={dateFormat} />
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
    </section>
  );
}
