"use client";

import { useMemo, useState } from "react";
import { DateDisplayFormat, formatDate } from "@/utils/date";
import { OverlapConflictCard } from "@/features/calendar-overlaps/components/OverlapConflictCard";
import { parseQueMessage } from "../services/parseQueMessage";
import { validateQueOverlap } from "../services/validateQueOverlap";
import { QueCheckEvent } from "../types";

type Props = {
  events: QueCheckEvent[];
  dateFormat: DateDisplayFormat;
};
const sampleMessage = `Title: BUS Rehearsal
Location: Sunray

Start: 14-06-2026 22:30
End: 15-06-2026 00:30

Start: 25-06-2026 19:00
End: 25-06-2026 22:00

Start: 01-07-2026 20:00
End: 01-07-2026 22:00`;
const QUE_CHECK_AI_PROMPT = `Convert the following queue/schedule request into Lazy-Teamup Que Check format.

Rules:
1. Extract the event title.
2. Extract the location if available.
3. Convert all dates to DD-MM-YYYY.
4. Convert all times to 24-hour HH:mm format.
5. Every event must contain:
   - Start: DD-MM-YYYY HH:mm
   - End: DD-MM-YYYY HH:mm
6. If an event crosses midnight, End must contain the next day's date.
7. If a location is not explicitly specified, omit the Location line entirely.
8. Do not guess locations.
9. Output ONLY the final Que Check format.
10. Do not include explanations.
11. Do not include markdown code blocks.

Required output format:

Title: Event Name
Location: Location Name

Start: DD-MM-YYYY HH:mm
End: DD-MM-YYYY HH:mm

Start: DD-MM-YYYY HH:mm
End: DD-MM-YYYY HH:mm

Input:
`;

export function QueCheckForm({ events, dateFormat }: Props) {
  const [message, setMessage] = useState(sampleMessage);
  const [submitted, setSubmitted] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const result = useMemo(() => {
    if (!submitted) return null;

    try {
      const parsedEvents = parseQueMessage(message);
      const checkedEvents = parsedEvents.map((parsed) => ({
        parsed,
        conflictGroup: validateQueOverlap(parsed, events),
      }));

      return {
        checkedEvents,
        error: null,
      };
    } catch (error) {
      return {
        checkedEvents: [],
        error:
          error instanceof Error ? error.message : "Unable to parse message.",
      };
    }
  }, [submitted, message, events]);

  const validCount =
    result?.checkedEvents.filter((item) => !item.conflictGroup).length ?? 0;

  const conflictCount =
    result?.checkedEvents.filter((item) => item.conflictGroup).length ?? 0;

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-zinc-100">Que Check</h2>
        <p className="text-sm text-zinc-400">
          Paste normalized queue text to check for overlapping events.
        </p>
      </div>
      <details className="mb-4 rounded-lg border border-zinc-800 bg-zinc-950">
        <summary className="cursor-pointer p-3 text-sm font-medium text-zinc-100">
          Generate Que Check Format with AI
        </summary>

        <div className="border-t border-zinc-800 p-3">
          <p className="mb-3 text-xs text-zinc-500">
            Copy this prompt into any AI chat, paste the staff message after
            <span className="text-zinc-300"> Input:</span>, then paste the AI
            output back into Que Check.
          </p>

          <textarea
            readOnly
            value={QUE_CHECK_AI_PROMPT}
            className="h-72 w-full resize-none rounded-lg border border-zinc-800 bg-black p-3 font-mono text-xs text-zinc-100 outline-none"
          />

          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(QUE_CHECK_AI_PROMPT);
              setPromptCopied(true);
              setTimeout(() => setPromptCopied(false), 1500);
            }}
            className="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
          >
            {promptCopied ? "Copied" : "Copy AI Prompt"}
          </button>
        </div>
      </details>
      <textarea
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          setSubmitted(false);
        }}
        className="h-48 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 p-3 font-mono text-sm text-zinc-100 outline-none"
      />

      <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-400">
        <p className="mb-1 font-semibold text-zinc-200">Expected format</p>
        <pre className="whitespace-pre-wrap">{`Title: Event Name
Location: Optional Location

Start: DD-MM-YYYY HH:mm
End: DD-MM-YYYY HH:mm

Start: DD-MM-YYYY HH:mm
End: DD-MM-YYYY HH:mm`}</pre>
      </div>

      <button
        type="button"
        onClick={() => setSubmitted(true)}
        className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
      >
        Check Que
      </button>

      {result?.error && (
        <p className="mt-4 rounded-lg border border-red-900 bg-red-950/30 p-3 text-sm text-red-300">
          {result.error}
        </p>
      )}

      {result && !result.error && (
        <div className="mt-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-2xl font-bold text-zinc-100">
                {result.checkedEvents.length}
              </p>
              <p className="text-sm text-zinc-400">Parsed events</p>
            </div>

            <div className="rounded-lg border border-emerald-900 bg-emerald-950/20 p-4">
              <p className="text-2xl font-bold text-emerald-300">
                {validCount}
              </p>
              <p className="text-sm text-zinc-400">No conflict</p>
            </div>

            <div className="rounded-lg border border-red-900 bg-red-950/20 p-4">
              <p className="text-2xl font-bold text-red-300">{conflictCount}</p>
              <p className="text-sm text-zinc-400">Conflicts</p>
            </div>
          </div>

          {result.checkedEvents.map(({ parsed, conflictGroup }) => (
            <div
              key={parsed.id}
              className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
            >
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-zinc-100">{parsed.title}</p>
                  <p className="text-sm text-zinc-400">
                    {formatDate(parsed.date, dateFormat)} {parsed.startTime} -{" "}
                    {parsed.crossesMidnight
                      ? `${formatDate(parsed.endDate, dateFormat)} ${parsed.endTime}`
                      : parsed.endTime}
                  </p>
                  {parsed.crossesMidnight && (
                    <p className="mt-1 text-xs text-amber-300">
                      Crosses midnight
                    </p>
                  )}
                </div>

                <span
                  className={[
                    "w-fit rounded-full px-3 py-1 text-xs",
                    conflictGroup
                      ? "bg-red-950 text-red-200"
                      : "bg-emerald-950 text-emerald-200",
                  ].join(" ")}
                >
                  {conflictGroup ? "Conflict" : "Available"}
                </span>
              </div>

              {conflictGroup ? (
                <OverlapConflictCard
                  group={conflictGroup}
                  dateFormat={dateFormat}
                />
              ) : (
                <p className="rounded-lg border border-emerald-900 bg-emerald-950/20 p-3 text-sm text-emerald-300">
                  No overlapping events found.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
