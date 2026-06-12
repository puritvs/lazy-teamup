import { DateDisplayFormat, formatDate } from "@/utils/date";
import { OverlapGroup } from "../services/findOverlappingEvents";
import { OverlapTimeline } from "./OverlapTimeline";

type Props = {
  group: OverlapGroup;
  dateFormat: DateDisplayFormat;
};

export function OverlapConflictCard({ group, dateFormat }: Props) {
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

        <span className="rounded-full bg-red-950 px-2 py-1 text-xs text-red-200">
          {group.events.length} events
        </span>
      </div>

      <OverlapTimeline group={group} dateFormat={dateFormat} />
    </div>
  );
}
