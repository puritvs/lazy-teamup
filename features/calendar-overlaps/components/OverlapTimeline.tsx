import { formatEventDateRange } from "@/utils/date";
import { DateDisplayFormat } from "@/utils/date";
import { OverlapGroup } from "../services/findOverlappingEvents";

type Props = {
  group: OverlapGroup;
  dateFormat: DateDisplayFormat;
};
function getMultiDayInfo(startDt: string, endDt: string) {
  const start = new Date(startDt);
  const end = new Date(endDt);

  const startDate = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  );

  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  const dayCount =
    Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1;

  return {
    isMultiDay: dayCount > 1,
    dayCount,
  };
}
function formatTime(time: number) {
  const date = new Date(time);

  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

export function OverlapTimeline({ group, dateFormat }: Props) {
  const totalDuration = group.endTime - group.startTime;

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs text-zinc-500">
        <span>{formatTime(group.startTime)}</span>
        <span>{formatTime(group.endTime)}</span>
      </div>

      <div className="space-y-2">
        {group.events.map((event) => {
          const { isMultiDay, dayCount } = getMultiDayInfo(
            event.start_dt,
            event.end_dt,
          );
          const start = new Date(event.start_dt).getTime();
          const end = new Date(event.end_dt).getTime();

          const left = ((start - group.startTime) / totalDuration) * 100;
          const width = ((end - start) / totalDuration) * 100;

          return (
            <div key={event.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="text-xs font-medium text-zinc-200">
                  {event.title}
                </div>

                {isMultiDay && (
                  <span className="rounded-full bg-violet-950 px-2 py-0.5 text-[10px] text-violet-200">
                    {dayCount}D
                  </span>
                )}
              </div>

              <div className="relative h-3 rounded-full bg-zinc-800">
                <div
                  className={[
                    "absolute top-0 h-3 rounded-full",
                    isMultiDay ? "bg-violet-500" : "bg-red-500",
                  ].join(" ")}
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                  }}
                />
              </div>

              <div className="text-xs text-zinc-500">
                {formatEventDateRange(event.start_dt, event.end_dt, dateFormat)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
