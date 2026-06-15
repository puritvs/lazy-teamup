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
  highlightedEventIds?: Set<string>;
  year: number;
  month: number;
  dateFormat: DateDisplayFormat;
  onMonthChange?: (year: number, month: number) => void;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_VISIBLE_ITEMS_PER_DAY = 4;
type DetailTab = "all" | "event" | "conflict" | "available-que" | "que-check";

const DETAIL_TABS: { value: DetailTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "event", label: "Events" },
  { value: "conflict", label: "Overlaps" },
  { value: "available-que", label: "Available Que" },
  { value: "que-check", label: "Que Check" },
];

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
  if (type === "conflict") {
    return "border-red-900 bg-red-950/30 text-red-200";
  }

  if (type === "available-que") {
    return "border-emerald-800 bg-emerald-950/70 text-emerald-100";
  }

  if (type === "que-check") {
    return "border-sky-800 bg-sky-950/70 text-sky-100";
  }

  return "border-zinc-700 bg-zinc-800 text-zinc-100";
}

function getItemPrefix(type: CalendarVisualItem["type"]) {
  if (type === "conflict") return "⚠";
  if (type === "available-que") return "Free";
  if (type === "que-check") return "Que";
  return "";
}

function isConflictNotice(item: CalendarVisualItem) {
  return item.type === "conflict" && item.id.startsWith("conflict-notice-");
}

function getVisibleItems(dayItems: CalendarVisualItem[]) {
  const conflictNotices = dayItems.filter(isConflictNotice);
  const otherItems = dayItems.filter((item) => !isConflictNotice(item));

  const visibleConflictNotices = conflictNotices.slice(
    0,
    MAX_VISIBLE_ITEMS_PER_DAY,
  );

  const remainingSlots =
    MAX_VISIBLE_ITEMS_PER_DAY - visibleConflictNotices.length;

  return [
    ...visibleConflictNotices,
    ...otherItems.slice(0, Math.max(0, remainingSlots)),
  ];
}
export function CalendarMonthView({
  events,
  visualItems = [],
  highlightedEventIds = new Set(),
  year,
  month,
  dateFormat,
  onMonthChange,
}: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("all");
  const currentMonth = dayjs(`${year}-${String(month).padStart(2, "0")}-01`);
  const today = dayjs();

  function changeMonth(nextMonth: dayjs.Dayjs) {
    onMonthChange?.(nextMonth.year(), nextMonth.month() + 1);
    setSelectedDate(null);
  }
  const days = useMemo(() => getMonthGrid(year, month), [year, month]);

  const allItems = useMemo<CalendarVisualItem[]>(() => {
    const eventItems: CalendarVisualItem[] = events.map((event) => {
      const isConflict = highlightedEventIds.has(event.id);

      return {
        id: `event-${event.id}`,
        sourceId: event.id,
        type: isConflict ? "conflict" : "event",
        title: event.title,
        start_dt: event.start_dt,
        end_dt: event.end_dt,
        description: isConflict
          ? "This event is involved in a conflict."
          : undefined,
      };
    });

    return [...eventItems, ...visualItems];
  }, [events, visualItems, highlightedEventIds]);

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
        [...dayItems].sort((a, b) => {
          if (isConflictNotice(a) && !isConflictNotice(b)) return -1;
          if (!isConflictNotice(a) && isConflictNotice(b)) return 1;

          return (
            new Date(a.start_dt).getTime() - new Date(b.start_dt).getTime()
          );
        }),
      );
    }

    return map;
  }, [allItems]);

  const selectedItems = selectedDate
    ? (itemsByDate.get(selectedDate) ?? [])
    : [];
  const filteredSelectedItems =
    detailTab === "all"
      ? selectedItems
      : selectedItems.filter((item) => {
          if (detailTab === "event") return item.type === "event";
          if (detailTab === "conflict") return item.type === "conflict";
          return item.type === detailTab;
        });
  const eventCount = events.length;
  const conflictCount = highlightedEventIds.size;
  const availableQueCount = visualItems.filter(
    (item) => item.type === "available-que",
  ).length;
  const queCheckCount = visualItems.filter(
    (item) => item.type === "que-check",
  ).length;
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-100">
            {currentMonth.format("MMMM YYYY")}
          </h2>
          <p className="text-sm text-zinc-400">
            Month view using current filters and enabled visualization layers.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => changeMonth(currentMonth.subtract(1, "month"))}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
          >
            Previous
          </button>

          <button
            type="button"
            onClick={() => changeMonth(today.startOf("month"))}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
          >
            Today
          </button>

          <button
            type="button"
            onClick={() => changeMonth(currentMonth.add(1, "month"))}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
          >
            Next
          </button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-zinc-100">
          Event ({eventCount})
        </span>
        <span className="rounded border border-red-900 bg-red-950/30 px-2 py-1 text-red-200">
          Overlap ({conflictCount})
        </span>
        <span className="rounded border border-emerald-800 bg-emerald-950/70 px-2 py-1 text-emerald-100">
          Available Que ({availableQueCount})
        </span>
        <span className="rounded border border-sky-800 bg-sky-950/70 px-2 py-1 text-sky-100">
          Que Check ({queCheckCount})
        </span>
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
          const visibleItems = getVisibleItems(dayItems);

          const hiddenItems = dayItems.filter(
            (item) =>
              !visibleItems.some((visibleItem) => visibleItem.id === item.id),
          );

          const hiddenConflictCount = hiddenItems.filter(
            (item) => item.type === "conflict" && !isConflictNotice(item),
          ).length;
          const hiddenItemCount = Math.max(
            0,
            dayItems.length - visibleItems.length,
          );
          const hasHiddenItems = hiddenItemCount > 0;
          const isCurrentMonth = day.month() + 1 === month;
          const isSelected = selectedDate === dateKey;

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => {
                setSelectedDate(dateKey);
                setDetailTab("all");
              }}
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
              </div>

              <div className="space-y-1">
                {visibleItems.map((item) => (
                  <div
                    key={`${dateKey}-${item.id}`}
                    className={[
                      "truncate rounded border px-2 py-1 text-[11px]",
                      getItemStyle(item.type),
                      isConflictNotice(item) ? "font-semibold" : "",
                    ].join(" ")}
                    title={item.description ?? item.title}
                  >
                    {getItemPrefix(item.type)}{" "}
                    {isConflictNotice(item)
                      ? item.title
                      : `${dayjs(item.start_dt).format("HH:mm")} ${item.title}`}
                  </div>
                ))}

                {hasHiddenItems && (
                  <div className="rounded border border-amber-800 bg-amber-950/60 px-2 py-1 text-[11px] font-medium text-amber-100">
                    +{hiddenItemCount} hidden items
                    {hiddenConflictCount > 0
                      ? ` • ${hiddenConflictCount} conflicts`
                      : ""}
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
          <div className="mb-3 flex flex-wrap gap-2">
            {DETAIL_TABS.map((tab) => {
              const isActive = detailTab === tab.value;

              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setDetailTab(tab.value)}
                  className={[
                    "rounded-full border px-3 py-1 text-xs transition",
                    isActive
                      ? "border-white bg-white text-black"
                      : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {filteredSelectedItems.length === 0 ? (
            <p className="text-sm text-zinc-500">No items for this tab.</p>
          ) : (
            <div className="space-y-2">
              {filteredSelectedItems.map((item) => (
                <div
                  key={item.id}
                  className={[
                    "rounded-lg border p-3",
                    getItemStyle(item.type),
                    isConflictNotice(item) ? "border-red-800" : "",
                  ].join(" ")}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-black/30 px-2 py-0.5 text-xs uppercase">
                      {isConflictNotice(item) ? "conflict notice" : item.type}
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
