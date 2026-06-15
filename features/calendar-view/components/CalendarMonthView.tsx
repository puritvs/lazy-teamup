"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { DateDisplayFormat, formatEventDateRange } from "@/utils/date";

type TeamupEvent = {
  id: string;
  title: string;
  start_dt: string;
  end_dt: string;
};

type Props = {
  events: TeamupEvent[];
  year: number;
  month: number;
  dateFormat: DateDisplayFormat;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMonthGrid(year: number, month: number) {
  const firstDay = dayjs(`${year}-${String(month).padStart(2, "0")}-01`);
  const startOffset = firstDay.day() === 0 ? 6 : firstDay.day() - 1;
  const gridStart = firstDay.subtract(startOffset, "day");

  return Array.from({ length: 42 }, (_, index) => {
    return gridStart.add(index, "day");
  });
}

function getEventDateKeys(event: TeamupEvent) {
  const start = dayjs(event.start_dt);
  const end = dayjs(event.end_dt);
  const endForDisplay =
    end.hour() === 0 && end.minute() === 0 ? end.subtract(1, "minute") : end;

  const keys: string[] = [];
  let cursor = start.startOf("day");

  while (
    cursor.isBefore(endForDisplay, "day") ||
    cursor.isSame(endForDisplay, "day")
  ) {
    keys.push(cursor.format("YYYY-MM-DD"));
    cursor = cursor.add(1, "day");
  }

  return keys;
}

export function CalendarMonthView({ events, year, month, dateFormat }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const days = useMemo(() => getMonthGrid(year, month), [year, month]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, TeamupEvent[]>();

    for (const event of events) {
      for (const key of getEventDateKeys(event)) {
        const current = map.get(key) ?? [];
        current.push(event);
        map.set(key, current);
      }
    }

    for (const [key, dayEvents] of map) {
      map.set(
        key,
        [...dayEvents].sort(
          (a, b) =>
            new Date(a.start_dt).getTime() - new Date(b.start_dt).getTime(),
        ),
      );
    }

    return map;
  }, [events]);

  const selectedEvents = selectedDate
    ? (eventsByDate.get(selectedDate) ?? [])
    : [];

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-zinc-100">Calendar</h2>
        <p className="text-sm text-zinc-400">
          Month view using currently visible filtered events.
        </p>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-zinc-800 bg-zinc-800">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="bg-zinc-950 px-2 py-2 text-center text-xs font-semibold text-zinc-400"
          >
            {day}
          </div>
        ))}

        {days.map((day) => {
          const dateKey = day.format("YYYY-MM-DD");
          const dayEvents = eventsByDate.get(dateKey) ?? [];
          const isCurrentMonth = day.month() + 1 === month;
          const isSelected = selectedDate === dateKey;

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => setSelectedDate(dateKey)}
              className={[
                "min-h-28 bg-zinc-950 p-2 text-left align-top transition hover:bg-zinc-900",
                !isCurrentMonth ? "opacity-40" : "",
                isSelected ? "ring-2 ring-white ring-inset" : "",
              ].join(" ")}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300">
                  {day.date()}
                </span>

                {dayEvents.length > 0 && (
                  <span className="rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={`${dateKey}-${event.id}`}
                    className="truncate rounded bg-zinc-800 px-2 py-1 text-[11px] text-zinc-100"
                    title={event.title}
                  >
                    {dayjs(event.start_dt).format("HH:mm")} {event.title}
                  </div>
                ))}

                {dayEvents.length > 3 && (
                  <div className="text-[11px] text-zinc-500">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="font-semibold text-zinc-100">
              {dayjs(selectedDate).format("DD-MM-YYYY")}
            </p>

            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="text-xs text-zinc-500 hover:text-zinc-200"
            >
              Clear
            </button>
          </div>

          {selectedEvents.length === 0 ? (
            <p className="text-sm text-zinc-500">No events on this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg border border-zinc-800 bg-black/40 p-3"
                >
                  <p className="font-medium text-zinc-100">{event.title}</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {formatEventDateRange(
                      event.start_dt,
                      event.end_dt,
                      dateFormat,
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
