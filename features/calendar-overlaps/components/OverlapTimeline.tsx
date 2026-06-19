import { formatDate, formatEventDateRange } from "@/utils/date";
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

export function OverlapTimeline({ group, dateFormat }: Props) {
  const totalDuration = group.endTime - group.startTime;
  const startDate = new Date(group.startTime);
  const endDate = new Date(group.endTime);

  const dayBoundaries: number[] = [];

  const cursor = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate() + 1,
  );

  while (cursor.getTime() < group.endTime) {
    dayBoundaries.push(cursor.getTime());

    cursor.setDate(cursor.getDate() + 1);
  }
  return (
    <div className="space-y-3">
      <div className="relative h-5 text-xs text-zinc-500">
        <div className="flex justify-between">
          <span>{formatDate(startDate.toISOString(), dateFormat)}</span>
          <span>{formatDate(endDate.toISOString(), dateFormat)}</span>
        </div>
        {dayBoundaries.map((boundary) => {
          const left = ((boundary - group.startTime) / totalDuration) * 100;

          return (
            <div
              key={boundary}
              className="absolute top-0 bottom-0 w-px bg-violet-500/60"
              style={{
                left: `${left}%`,
              }}
            />
          );
        })}
      </div>
      {dayBoundaries.length > 0 && (
        <div className="relative h-4 text-[10px] text-violet-300">
          {dayBoundaries.map((boundary) => {
            const left = ((boundary - group.startTime) / totalDuration) * 100;

            return (
              <span
                key={boundary}
                className="absolute -translate-x-1/2"
                style={{
                  left: `${left}%`,
                }}
              >
                {new Date(boundary).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            );
          })}
        </div>
      )}
      <div className="space-y-2">
        {group.events.map((event) => {
          const { isMultiDay } = getMultiDayInfo(event.start_dt, event.end_dt);
          const start = new Date(event.start_dt).getTime();
          const end = new Date(event.end_dt).getTime();

          const left = ((start - group.startTime) / totalDuration) * 100;
          const width = ((end - start) / totalDuration) * 100;
          const startDate = event.start_dt.slice(0, 10);
          const endDate = event.end_dt.slice(0, 10);
          return (
            <div key={event.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="text-xs font-medium text-zinc-200">
                  {event.title}
                </div>

                {isMultiDay && (
                  <span className="rounded-full bg-violet-950 px-2 py-0.5 text-[10px] text-violet-200">
                    {formatDate(startDate, dateFormat)} →
                    {formatDate(endDate, dateFormat)}
                  </span>
                )}
              </div>

              <div className="relative h-3 rounded-full bg-zinc-800">
                {dayBoundaries.map((boundary) => {
                  const dividerLeft =
                    ((boundary - group.startTime) / totalDuration) * 100;

                  return (
                    <div
                      key={boundary}
                      className="absolute top-0 bottom-0 z-10 w-px bg-white/60"
                      style={{
                        left: `${dividerLeft}%`,
                      }}
                    />
                  );
                })}
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
