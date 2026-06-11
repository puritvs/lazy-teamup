"use client";

import { DateDisplayFormat, formatEventDateRange } from "@/utils/date";

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

export function EventList({ events, dateFormat }: Props) {
  return (
    <div className="max-h-[70vh] overflow-y-auto rounded-xl border border-zinc-800 bg-black/30 p-2 sm:max-h-[600px]">
      {events.length === 0 ? (
        <p className="p-4 text-sm text-zinc-400">No events to display.</p>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => (
            <li
              key={event.id}
              className="rounded-lg border border-zinc-800 bg-zinc-950 p-4"
            >
              <div className="font-semibold text-zinc-100">{event.title}</div>

              <div className="mt-1 text-sm text-zinc-400">
                {formatEventDateRange(event.start_dt, event.end_dt, dateFormat)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
