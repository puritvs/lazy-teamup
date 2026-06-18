import { DateDisplayFormat, formatDate } from "@/utils/date";
import { OverlapGroup } from "../services/findOverlappingEvents";
import { OverlapTimeline } from "./OverlapTimeline";

type Props = {
  group: OverlapGroup;
  dateFormat: DateDisplayFormat;
};
function isMultiDay(start: string, end: string) {
  const startDate = start.slice(0, 10);
  const endDate = end.slice(0, 10);

  return startDate !== endDate;
}
export function OverlapConflictCard({ group, dateFormat }: Props) {
  const multiDayCount = group.events.filter((event) =>
    isMultiDay(event.start_dt, event.end_dt),
  ).length;
  const multiDayEvents = group.events.filter((event) => {
    return event.start_dt.slice(0, 10) !== event.end_dt.slice(0, 10);
  });

  const spanStart =
    multiDayEvents.length > 0
      ? multiDayEvents.reduce(
          (earliest, event) =>
            event.start_dt < earliest ? event.start_dt : earliest,
          multiDayEvents[0].start_dt,
        )
      : null;

  const spanEnd =
    multiDayEvents.length > 0
      ? multiDayEvents.reduce(
          (latest, event) => (event.end_dt > latest ? event.end_dt : latest),
          multiDayEvents[0].end_dt,
        )
      : null;

  return (
    <div
      className={[
        "rounded-lg border p-4",
        group.severity === "high"
          ? "border-red-700 bg-red-950/30"
          : group.severity === "medium"
            ? "border-amber-700 bg-amber-950/20"
            : "border-zinc-700 bg-zinc-950",
      ].join(" ")}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-zinc-100">
            {formatDate(group.date, dateFormat)}
          </p>

          <p className="text-xs text-zinc-500">{group.severity} severity</p>
        </div>

        <div className="flex gap-2">
          <span className="rounded-full bg-red-950 px-2 py-1 text-xs text-red-200">
            {group.events.length} events
          </span>

          {multiDayCount > 0 && spanStart && spanEnd && (
            <span className="rounded-full bg-violet-950 px-2 py-1 text-xs text-violet-200">
              {multiDayCount} multi-day · {formatDate(spanStart, dateFormat)} →{" "}
              {formatDate(spanEnd, dateFormat)}
            </span>
          )}
        </div>
      </div>

      <OverlapTimeline group={group} dateFormat={dateFormat} />
    </div>
  );
}
