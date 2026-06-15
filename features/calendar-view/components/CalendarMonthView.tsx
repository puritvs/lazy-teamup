"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { DateDisplayFormat, formatEventDateRange } from "@/utils/date";
import { CalendarVisualItem } from "../types";

type TeamupEvent = {
  id: string;
  title: string;
  start_dt: string;
  end_dt: string;
};

type Props = {
  events: TeamupEvent[];
  visualItems?: CalendarVisualItem[];
  year: number;
  month: number;
  dateFormat: DateDisplayFormat;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMonthGrid(year: number, month: number) {
  const firstDay = dayjs(`${year}-${String(month).padStart(2, "0")}-01`);
  const startOffset = firstDay.day() === 0 ? 6 : firstDay.day() - 1;
  const gridStart = firstDay.subtract(startOffset, "day");

  return Array.from({ length: 42 }, (_, index) => gridStart.add(index, "day"));
}

function getItemDateKeys(item: { start_dt: string; end_dt: string }) {
  const start = dayjs(item.start_dt);
  const end = dayjs(item.end_dt);

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

function getItemStyle(type: CalendarVisualItem["type"]) {
  if (type === "conflict") return "border-red-800 bg-red-950/70 text-red-100";
  if (type === "available-que")
    return "border-emerald-800 bg-emerald-950/70 text-emerald-100";
  if (type === "que-check") return "border-sky-800 bg-sky-950/70 text-sky-100";

  return "border-zinc-700 bg-zinc-800 text-zinc-100";
}

function getItemPrefix(type: CalendarVisualItem["type"]) {
  if (type === "conflict") return "⚠";
  if (type === "available-que") return "Free";
  if (type === "que-check") return "Que";
  return "";
}

export function CalendarMonthView({
  events,
  visualItems = [],
  year,
  month,
  dateFormat,
}: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const days = useMemo(() => getMonthGrid(year, month), [year, month]);

  const allItems = useMemo<CalendarVisualItem[]>(() => {
    const eventItems: CalendarVisualItem[] = events.map((event) => ({
      id: `event-${event.id}`,
      sourceId: event.id,
      type: "event",
      title: event.title,
      start_dt: event.start_dt,
      end_dt: event.end_dt,
    }));

    return [...eventItems, ...visualItems];
  }, [events, visualItems]);

  const itemsByDate = useMemo(() => {
    const map = new Map<string, CalendarVisualItem[]>();

    for (const item of allItems) {
      for (const key of getItemDateKeys(item)) {
        const current = map.get(key) ?? [];
        current.push(item);
        map.set(key, current);
      }
    }

    for (const [key, dayItems] of map) {
      map.set(
        key,
        [...dayItems].sort(
          (a, b) =>
            new Date(a.start_dt).getTime() - new Date(b.start_dt).getTime(),
        ),
      );
    }

    return map;
  }, [allItems]);

  const selectedItems = selectedDate
    ? (itemsByDate.get(selectedDate) ?? [])
    : [];

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-zinc-100">Calendar</h2>
        <p className="text-sm text-zinc-400">
          Month view using current filters and enabled visualization layers.
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
          const dayItems = itemsByDate.get(dateKey) ?? [];
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

                {dayItems.length > 0 && (
                  <span className="rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300">
                    {dayItems.length}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                {dayItems.slice(0, 4).map((item) => (
                  <div
                    key={`${dateKey}-${item.id}`}
                    className={[
                      "truncate rounded border px-2 py-1 text-[11px]",
                      getItemStyle(item.type),
                    ].join(" ")}
                    title={item.title}
                  >
                    {getItemPrefix(item.type)}{" "}
                    {dayjs(item.start_dt).format("HH:mm")} {item.title}
                  </div>
                ))}

                {dayItems.length > 4 && (
                  <div className="text-[11px] text-zinc-500">
                    +{dayItems.length - 4} more
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

          {selectedItems.length === 0 ? (
            <p className="text-sm text-zinc-500">No items on this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className={[
                    "rounded-lg border p-3",
                    getItemStyle(item.type),
                  ].join(" ")}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-black/30 px-2 py-0.5 text-xs uppercase">
                      {item.type}
                    </span>

                    <p className="font-medium">{item.title}</p>
                  </div>

                  <p className="mt-1 text-sm opacity-80">
                    {formatEventDateRange(
                      item.start_dt,
                      item.end_dt,
                      dateFormat,
                    )}
                  </p>

                  {item.description && (
                    <p className="mt-2 text-xs opacity-80">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
