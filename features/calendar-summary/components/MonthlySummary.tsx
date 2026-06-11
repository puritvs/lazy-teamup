"use client";

import { useEffect, useState } from "react";
import { DateDisplayFormat, getMonthName } from "@/utils/date";

type Props = {
  year: number;
  month: number;
  dateFormat: DateDisplayFormat;
  embedded?: boolean;
};

type Summary = {
  totalEvents: number;
  allDayEvents: number;
  timedEvents: number;
  busiestDay: {
    date: string;
    count: number;
  } | null;
};

export function MonthlySummary({
  year,
  month,
  dateFormat,
  embedded = false,
}: Props) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSummary() {
      setLoading(true);

      try {
        const res = await fetch(
          `/api/teamup/summaries?year=${year}&month=${month}`,
        );

        const data = await res.json();
        setSummary(data.summary);
      } finally {
        setLoading(false);
      }
    }

    loadSummary();
  }, [year, month]);

  const title =
    dateFormat === "month-name"
      ? `${getMonthName(month)} ${year}`
      : `${month}/${year}`;

  return (
    <section
      className={
        embedded ? "" : "rounded-xl border border-zinc-800 bg-zinc-900/60 p-5"
      }
    >
      <h2 className="mb-4 text-lg font-bold">Event Summary: {title}</h2>
      {loading && <p className="text-sm text-zinc-400">Loading...</p>}
      {!loading && summary && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-2xl font-bold">{summary.totalEvents}</p>
              <p className="text-sm text-zinc-400">Total events</p>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-2xl font-bold">{summary.timedEvents}</p>
              <p className="text-sm text-zinc-400">Timed events</p>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-2xl font-bold">{summary.allDayEvents}</p>
              <p className="text-sm text-zinc-400">All-day events</p>
            </div>
          </div>

          {summary.busiestDay && (
            <p className="text-sm text-zinc-300">
              Busiest day: {summary.busiestDay.date} ({summary.busiestDay.count}{" "}
              events)
            </p>
          )}
        </div>
      )}
    </section>
  );
}
