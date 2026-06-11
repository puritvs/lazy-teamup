"use client";

import { useMemo } from "react";
import { DateDisplayFormat } from "@/utils/date";
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
  const overlapGroups: OverlapGroup[] = useMemo(() => {
    return findOverlappingEvents(events);
  }, [events]);

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
        <div className="h-[60vh] space-y-3 overflow-y-auto pr-2 xl:h-[520px]">
          {overlapGroups.map((group) => (
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
                  <p className="font-semibold text-zinc-100">{group.date}</p>
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
      )}
    </section>
  );
}
