"use client";

import dayjs from "dayjs";
import { DateDisplayFormat, formatEventDateRange } from "@/utils/date";
import { CalendarVisualItem } from "../types";

export type DetailTab =
  | "all"
  | "event"
  | "conflict"
  | "available-que"
  | "que-check";

const DETAIL_TABS: { value: DetailTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "event", label: "Events" },
  { value: "conflict", label: "Overlaps" },
  { value: "available-que", label: "Available Que" },
  { value: "que-check", label: "Que Check" },
];

type Props = {
  selectedDate: string;
  selectedItems: CalendarVisualItem[];
  detailTab: DetailTab;
  setDetailTab: (tab: DetailTab) => void;
  onClear: () => void;
  dateFormat: DateDisplayFormat;
};

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

function isConflictNotice(item: CalendarVisualItem) {
  return item.type === "conflict" && item.id.startsWith("conflict-notice-");
}

function getFilteredItems(items: CalendarVisualItem[], detailTab: DetailTab) {
  if (detailTab === "all") return items;

  return items.filter((item) => {
    if (detailTab === "event") return item.type === "event";
    if (detailTab === "conflict") return item.type === "conflict";
    return item.type === detailTab;
  });
}

export function SelectedDayPanel({
  selectedDate,
  selectedItems,
  detailTab,
  setDetailTab,
  onClear,
  dateFormat,
}: Props) {
  const filteredSelectedItems = getFilteredItems(selectedItems, detailTab);

  return (
    <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-semibold text-zinc-100">
          {dayjs(selectedDate).format("DD-MM-YYYY")}
        </p>

        <button
          type="button"
          onClick={onClear}
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
                {formatEventDateRange(item.start_dt, item.end_dt, dateFormat)}
              </p>

              {item.description && (
                <p className="mt-2 text-xs opacity-80">{item.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
