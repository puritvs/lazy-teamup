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

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-100">
            Overlapping Events
          </h2>
          <p className="text-sm text-zinc-400">
            Based on currently visible events.
          </p>
        </div>

        <span className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-300">
          {overlapGroups.length}
        </span>
      </div>

      {overlapGroups.length === 0 ? (
        <p className="text-sm text-zinc-400">No overlapping events found.</p>
      ) : (
        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-2 sm:max-h-[500px]">
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
              <div className="mb-4 flex items-center justify-between">
                <p className="font-semibold text-zinc-100">{group.date}</p>

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
