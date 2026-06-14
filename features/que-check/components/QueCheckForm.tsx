"use client";

import { useEffect, useMemo, useState } from "react";
import { DateDisplayFormat, formatDate } from "@/utils/date";
import { OverlapConflictCard } from "@/features/calendar-overlaps/components/OverlapConflictCard";
import { parseQueMessage } from "../services/parseQueMessage";
import { validateQueOverlap } from "../services/validateQueOverlap";
import { QueCheckEvent } from "../types";
import { TimeSelect } from "@/components/TimeSelect";
type TravelBuffer = {
  from: number;
  to: number;
};

type TravelBufferMap = Record<string, TravelBuffer>;

const DEFAULT_LOCATION = "Default office";
const TRAVEL_BUFFER_STORAGE_KEY = "lazy-teamup-travel-buffers";

function loadTravelBuffers(): TravelBufferMap {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(
      localStorage.getItem(TRAVEL_BUFFER_STORAGE_KEY) ?? "{}",
    ) as TravelBufferMap;
  } catch {
    return {};
  }
}

function extractLocationFromTitle(title: string) {
  const match = title.match(/@(.+)$/);
  return match ? match[1].trim() : DEFAULT_LOCATION;
}

function getTravelWarnings(
  parsed: {
    date: string;
    endDate: string;
    startTime: string;
    endTime: string;
  },
  events: QueCheckEvent[],
  travelBuffers: TravelBufferMap,
) {
  const start = new Date(`${parsed.date}T${parsed.startTime}:00`);
  const end = new Date(`${parsed.endDate}T${parsed.endTime}:00`);

  const sameDayEvents = events.filter(
    (event) => event.start_dt.slice(0, 10) === parsed.date,
  );

  const previousEvent = [...sameDayEvents]
    .filter((event) => new Date(event.end_dt).getTime() <= start.getTime())
    .sort(
      (a, b) => new Date(b.end_dt).getTime() - new Date(a.end_dt).getTime(),
    )[0];

  const nextEvent = sameDayEvents
    .filter((event) => new Date(event.start_dt).getTime() >= end.getTime())
    .sort(
      (a, b) => new Date(a.start_dt).getTime() - new Date(b.start_dt).getTime(),
    )[0];

  const warnings: {
    type: "from" | "to";
    location: string;
    requiredMinutes: number;
    actualMinutes: number;
  }[] = [];

  if (previousEvent) {
    const location = extractLocationFromTitle(previousEvent.title);

    if (location !== DEFAULT_LOCATION) {
      const requiredMinutes = travelBuffers[location]?.from ?? 30;
      const actualMinutes = Math.floor(
        (start.getTime() - new Date(previousEvent.end_dt).getTime()) / 60000,
      );

      if (actualMinutes < requiredMinutes) {
        warnings.push({
          type: "from",
          location,
          requiredMinutes,
          actualMinutes: Math.max(0, actualMinutes),
        });
      }
    }
  }

  if (nextEvent) {
    const location = extractLocationFromTitle(nextEvent.title);

    if (location !== DEFAULT_LOCATION) {
      const requiredMinutes = travelBuffers[location]?.to ?? 30;
      const actualMinutes = Math.floor(
        (new Date(nextEvent.start_dt).getTime() - end.getTime()) / 60000,
      );

      if (actualMinutes < requiredMinutes) {
        warnings.push({
          type: "to",
          location,
          requiredMinutes,
          actualMinutes: Math.max(0, actualMinutes),
        });
      }
    }
  }

  return warnings;
}
type ManualEvent = {
  sameDay: boolean;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
};

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

const PERSONAL_QUE_CHECK_AI_PROMPT = `Extract my personal Que Check schedule from this table/image.

My name/alias: Pu

Context:

* CHOREO. means the choreographer responsible for that row.
* QUE is the event title.
* PLACE is the location.
* REMARK contains additional notes and should not be used to determine ownership unless explicitly stated.
* I only want events that I am responsible for or events that require all choreographers to attend.

Inclusive Sections:
The following section names are considered mandatory for all choreographers and must always be included, even if CHOREO. is blank:

* BLOCKING & RUN THROUGH
* SHOW DAY
* FULL RUN
* RUNTHROUGH
* STAGE BLOCKING

Inclusion Rules:
Include a row if:

1. CHOREO. contains "Pu".
2. The row belongs to one of the Inclusive Sections listed above.
3. The row is clearly part of an Inclusive Section even if the CHOREO. column is empty.

Exclusion Rules:
Exclude a row if:

1. CHOREO. does not contain "Pu".
2. The row is assigned only to other choreographers.
3. "Pu" appears only inside REMARK.
4. The row is not part of an Inclusive Section and is not assigned to Pu.

Title Rules:

* Use the QUE column as the event title.
* Do not use CHOREO. as the title.
* If QUE is blank under an Inclusive Section, use the section name as the Title.

Location Rules:

* Use the PLACE column as the Location.
* If PLACE is blank, omit the Location field entirely.
* Do not guess locations.

Time Rules:

* Convert dates to DD-MM-YYYY.
* Use 24-hour HH:mm format.
* If an event crosses midnight, End must use the following date.
* Any row belonging to the following Inclusive Sections:

  * BLOCKING & RUN THROUGH
  * SHOW DAY
  * FULL RUN
  * RUNTHROUGH
  * STAGE BLOCKING

  must always be treated as a full-day event regardless of any displayed time.

  Output:
  Start: DD-MM-YYYY 00:00
  End: next day DD-MM-YYYY 00:00

Output Format:
For every included event, output exactly:

Title: [QUE or inclusive section name]
Location: [PLACE]

Start: DD-MM-YYYY HH:mm
End: DD-MM-YYYY HH:mm

Requirements:

* Keep Thai text exactly as written.
* Output only confirmed events.
* Do not provide explanations.
* Do not provide reasoning.
* Do not provide summaries.
* Do not provide a "Needs Confirmation" section.
* Do not use markdown code blocks.
* Do not add any extra text before or after the extracted schedule.

Input:
`;
function buildQueCheckText(
  title: string,
  location: string,
  events: ManualEvent[],
) {
  const lines: string[] = [];

  lines.push(`Title: ${title}`);

  if (location.trim()) {
    lines.push(`Location: ${location}`);
  }

  lines.push("");

  events.forEach((event) => {
    const endDate = event.sameDay ? event.startDate : event.endDate;

    if (!event.startDate || !event.startTime || !endDate || !event.endTime) {
      return;
    }

    lines.push(
      `Start: ${formatDateInputToQueDate(event.startDate)} ${event.startTime}`,
    );
    lines.push(`End: ${formatDateInputToQueDate(endDate)} ${event.endTime}`);
    lines.push("");
  });

  return lines.join("\n").trim();
}

function formatDateInputToQueDate(date: string) {
  if (!date) return "";

  const [year, month, day] = date.split("-");
  return `${day}-${month}-${year}`;
}
export function QueCheckForm({ events, dateFormat }: Props) {
  const [message, setMessage] = useState(sampleMessage);
  const [submitted, setSubmitted] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [personalPromptCopied, setPersonalPromptCopied] = useState(false);
  const [showGeneralPrompt, setShowGeneralPrompt] = useState(false);
  const [showPersonalPrompt, setShowPersonalPrompt] = useState(false);
  const [inputMode, setInputMode] = useState<"text" | "manual">("text");

  const [manualTitle, setManualTitle] = useState("");
  const [manualLocation, setManualLocation] = useState("");
  const [travelBuffers] = useState<TravelBufferMap>(() => loadTravelBuffers());
  const [manualEvents, setManualEvents] = useState<ManualEvent[]>([
    {
      sameDay: true,
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
    },
  ]);
  const result = useMemo(() => {
    if (!submitted) return null;

    try {
      const parsedEvents = parseQueMessage(message);
      const checkedEvents = parsedEvents.map((parsed) => ({
        parsed,
        conflictGroup: validateQueOverlap(parsed, events),
        travelWarnings: getTravelWarnings(parsed, events, travelBuffers),
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
  function addManualEvent() {
    setManualEvents((current) => [
      ...current,
      {
        sameDay: true,
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
      },
    ]);
  }

  function removeManualEvent(index: number) {
    setManualEvents((current) => current.filter((_, i) => i !== index));
  }

  function updateManualEvent(
    index: number,
    key: keyof ManualEvent,
    value: string,
  ) {
    setManualEvents((current) =>
      current.map((event, i) =>
        i === index
          ? {
              ...event,
              [key]: value,
            }
          : event,
      ),
    );
  }
  useEffect(() => {
    if (inputMode !== "manual") {
      return;
    }

    setMessage(buildQueCheckText(manualTitle, manualLocation, manualEvents));
  }, [inputMode, manualTitle, manualLocation, manualEvents]);
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
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setInputMode("text")}
          className={[
            "rounded-lg px-4 py-2 text-sm",
            inputMode === "text"
              ? "bg-white text-black"
              : "bg-zinc-900 text-zinc-300",
          ].join(" ")}
        >
          Paste Message
        </button>

        <button
          type="button"
          onClick={() => setInputMode("manual")}
          className={[
            "rounded-lg px-4 py-2 text-sm",
            inputMode === "manual"
              ? "bg-white text-black"
              : "bg-zinc-900 text-zinc-300",
          ].join(" ")}
        >
          Manual Entry
        </button>
      </div>
      <details className="mb-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <summary className="cursor-pointer font-semibold text-zinc-100">
          Generate Que Check Format with AI
        </summary>

        <p className="mt-2 text-sm text-zinc-400">
          Copy one of these prompts into any AI chat, paste the staff message
          after Input:, then paste the AI output back into Que Check.
        </p>

        <div className="mt-4 rounded-lg border border-zinc-800 bg-black/40 p-3">
          <p className="font-medium text-zinc-100">General Que Format Prompt</p>

          <p className="mt-1 text-xs text-zinc-500">
            Use this for normal schedule text conversion.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(QUE_CHECK_AI_PROMPT);
                setPromptCopied(true);
                setTimeout(() => setPromptCopied(false), 1500);
              }}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
            >
              {promptCopied ? "Copied" : "Copy General Prompt"}
            </button>

            <button
              type="button"
              onClick={() => setShowGeneralPrompt((current) => !current)}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
            >
              {showGeneralPrompt ? "Hide Preview" : "Preview"}
            </button>
          </div>

          {showGeneralPrompt && (
            <textarea
              readOnly
              value={QUE_CHECK_AI_PROMPT}
              className="mt-3 h-64 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs text-zinc-100 outline-none"
            />
          )}
        </div>

        <div className="mt-4 rounded-lg border border-zinc-800 bg-black/40 p-3">
          <p className="font-medium text-zinc-100">
            Personal Que Extraction Prompt
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Use this for table/image schedules where you only want rows assigned
            to Pu or inclusive rehearsals.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(
                  PERSONAL_QUE_CHECK_AI_PROMPT,
                );
                setPersonalPromptCopied(true);
                setTimeout(() => setPersonalPromptCopied(false), 1500);
              }}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
            >
              {personalPromptCopied ? "Copied" : "Copy Personal Prompt"}
            </button>

            <button
              type="button"
              onClick={() => setShowPersonalPrompt((current) => !current)}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
            >
              {showPersonalPrompt ? "Hide Preview" : "Preview"}
            </button>
          </div>

          {showPersonalPrompt && (
            <textarea
              readOnly
              value={PERSONAL_QUE_CHECK_AI_PROMPT}
              className="mt-3 h-72 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs text-zinc-100 outline-none"
            />
          )}
        </div>
      </details>
      {inputMode === "manual" && (
        <div className="mb-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <h3 className="mb-4 font-semibold text-zinc-100">Manual Entry</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm text-zinc-400">Title</span>
              <input
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-zinc-100"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm text-zinc-400">Location</span>
              <input
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-zinc-100"
              />
            </label>
          </div>

          <div className="mt-4 space-y-3">
            {manualEvents.map((event, index) => (
              <div
                key={index}
                className="rounded-lg border border-zinc-800 p-3"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-medium text-zinc-200">
                    Event #{index + 1}
                  </span>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-zinc-300">
                      <input
                        type="checkbox"
                        checked={event.sameDay}
                        onChange={(e) => {
                          const checked = e.target.checked;

                          setManualEvents((current) =>
                            current.map((item, i) =>
                              i === index
                                ? {
                                    ...item,
                                    sameDay: checked,
                                    endDate: checked
                                      ? item.startDate
                                      : item.endDate,
                                  }
                                : item,
                            ),
                          );
                        }}
                      />
                      Same day
                    </label>

                    {manualEvents.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeManualEvent(index)}
                        className="text-sm text-red-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      type="date"
                      value={event.startDate}
                      onChange={(e) => {
                        const value = e.target.value;

                        setManualEvents((current) =>
                          current.map((item, i) =>
                            i === index
                              ? {
                                  ...item,
                                  startDate: value,
                                  endDate: item.sameDay ? value : item.endDate,
                                }
                              : item,
                          ),
                        );
                      }}
                      className="rounded border border-zinc-800 bg-black px-3 py-2"
                    />

                    <TimeSelect
                      value={event.startTime || "00:00"}
                      onChange={(value) =>
                        updateManualEvent(index, "startTime", value)
                      }
                    />
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      type="date"
                      value={event.sameDay ? event.startDate : event.endDate}
                      disabled={event.sameDay}
                      onChange={(e) =>
                        updateManualEvent(index, "endDate", e.target.value)
                      }
                      className="rounded border border-zinc-800 bg-black px-3 py-2 disabled:opacity-50"
                    />

                    <TimeSelect
                      value={event.endTime || "00:00"}
                      onChange={(value) =>
                        updateManualEvent(index, "endTime", value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addManualEvent}
            className="mt-4 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200"
          >
            + Add Event
          </button>
        </div>
      )}
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
        <pre className="whitespace-pre-wrap">{`Title: Default Event Name
Location: Optional Default Location

Start: DD-MM-YYYY HH:mm
End: DD-MM-YYYY HH:mm

Title: Different Event Name
Location: Different Location
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

          {result.checkedEvents.map(
            ({ parsed, conflictGroup, travelWarnings }) => (
              <div
                key={parsed.id}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
              >
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-zinc-100">
                      {parsed.title}
                    </p>
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
                {travelWarnings.length > 0 && (
                  <div className="mt-3 rounded-lg border border-amber-900 bg-amber-950/30 p-3 text-sm text-amber-200">
                    <p className="mb-2 font-semibold">Travel warning</p>

                    <div className="space-y-1">
                      {travelWarnings.map((warning, index) => (
                        <p key={index}>
                          {warning.type === "from"
                            ? `[travel from: ${warning.location}]`
                            : `[next location: ${warning.location}]`}{" "}
                          Need {warning.requiredMinutes} min, only{" "}
                          {warning.actualMinutes} min available.
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ),
          )}
        </div>
      )}
    </section>
  );
}
