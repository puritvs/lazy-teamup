// components/AppNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { GlobalFilterModal } from "./GlobalFilterModal";
import { GlobalTravelBufferModal } from "./GlobalTravelBufferModal";
import { useGlobalSettings } from "@/features/settings/GlobalSettingsProvider";
const months = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];
export function AppNav() {
  const pathname = usePathname();
  const [showFilters, setShowFilters] = useState(false);
  const [showTravelBuffers, setShowTravelBuffers] = useState(false);

  const {
    events,
    filteredEvents,
    excludedTitles,
    setExcludedTitles,
    calendarMonth,
    setCalendarMonth,
    calendarYear,
    setCalendarYear,
    dateFormat,
    setDateFormat,
    rawEvents,
    loadingEvents,
    loadEvents,
  } = useGlobalSettings();

  const dashboardActive = pathname === "/";
  const queCheckActive = pathname === "/que-check";

  return (
    <>
      <nav className="sticky top-0 z-40 hidden border-b border-zinc-800 bg-black/80 px-6 py-4 backdrop-blur md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex gap-3">
            <Link
              href="/"
              className={[
                "rounded-lg px-3 py-2 text-sm transition",
                dashboardActive
                  ? "bg-white text-black"
                  : "text-zinc-100 hover:bg-zinc-900 hover:text-white",
              ].join(" ")}
            >
              Dashboard
            </Link>

            <Link
              href="/que-check"
              className={[
                "rounded-lg px-3 py-2 text-sm transition",
                queCheckActive
                  ? "bg-white text-black"
                  : "text-zinc-100 hover:bg-zinc-900 hover:text-white",
              ].join(" ")}
            >
              Que Check
            </Link>
          </div>
          <div className="hidden items-center gap-2 xl:flex">
            <select
              value={calendarMonth}
              onChange={(e) => setCalendarMonth(Number(e.target.value))}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none"
            >
              {months.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={calendarYear}
              onChange={(e) => setCalendarYear(Number(e.target.value))}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none"
            >
              {Array.from({ length: 21 }, (_, index) => 2020 + index).map(
                (item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ),
              )}
            </select>

            <select
              value={dateFormat}
              onChange={(e) =>
                setDateFormat(e.target.value as "day-month-year" | "month-name")
              }
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none"
            >
              <option value="day-month-year">01-06-2026</option>
              <option value="month-name">01 Jun 2026</option>
            </select>

            <button
              type="button"
              onClick={loadEvents}
              disabled={loadingEvents}
              className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black disabled:opacity-50"
            >
              {loadingEvents ? "Loading..." : "Refresh"}
            </button>

            <span className="text-xs text-zinc-500">
              {filteredEvents.length}/{rawEvents.length}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(true)}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Filters ({excludedTitles.length})
            </button>

            <button
              type="button"
              onClick={() => setShowTravelBuffers(true)}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Travel Buffers
            </button>
          </div>
        </div>
      </nav>
      <div className="sticky top-0 z-40 border-b border-zinc-800 bg-black/95 px-3 py-2 backdrop-blur md:hidden">
        <div className="grid grid-cols-3 gap-2">
          <select
            value={calendarMonth}
            onChange={(e) => setCalendarMonth(Number(e.target.value))}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-2 text-xs text-zinc-100"
          >
            {months.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            value={calendarYear}
            onChange={(e) => setCalendarYear(Number(e.target.value))}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-2 text-xs text-zinc-100"
          >
            {Array.from({ length: 21 }, (_, index) => 2020 + index).map(
              (item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ),
            )}
          </select>

          <button
            type="button"
            onClick={loadEvents}
            disabled={loadingEvents}
            className="rounded-lg bg-white px-2 py-2 text-xs font-medium text-black disabled:opacity-50"
          >
            {loadingEvents ? "..." : "Refresh"}
          </button>
        </div>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800 bg-black/95 px-2 py-2 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
          <Link
            href="/"
            className={[
              "rounded-lg px-2 py-2 text-center text-xs transition",
              dashboardActive
                ? "bg-white text-black"
                : "bg-zinc-900 text-zinc-300",
            ].join(" ")}
          >
            Dashboard
          </Link>

          <Link
            href="/que-check"
            className={[
              "rounded-lg px-2 py-2 text-center text-xs transition",
              queCheckActive
                ? "bg-white text-black"
                : "bg-zinc-900 text-zinc-300",
            ].join(" ")}
          >
            Que Check
          </Link>

          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="rounded-lg bg-zinc-900 px-2 py-2 text-xs text-zinc-300"
          >
            Filters
            {excludedTitles.length > 0 ? ` (${excludedTitles.length})` : ""}
          </button>

          <button
            type="button"
            onClick={() => setShowTravelBuffers(true)}
            className="rounded-lg bg-zinc-900 px-2 py-2 text-xs text-zinc-300"
          >
            Travel
          </button>
        </div>
      </nav>

      <GlobalFilterModal
        open={showFilters}
        onClose={() => setShowFilters(false)}
        events={events}
        filteredEvents={filteredEvents}
        excludedTitles={excludedTitles}
        setExcludedTitles={setExcludedTitles}
      />

      <GlobalTravelBufferModal
        open={showTravelBuffers}
        onClose={() => setShowTravelBuffers(false)}
        events={filteredEvents}
      />
    </>
  );
}
