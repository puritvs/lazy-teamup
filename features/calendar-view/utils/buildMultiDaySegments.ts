import dayjs from "dayjs";
import { MultiDaySegment } from "../types";
import { MultiDayEvent } from "./getMultiDayEvents";
function overlaps(startA: number, endA: number, startB: number, endB: number) {
  return !(endA < startB || startA > endB);
}
function findAvailableLane(
  existingSegments: MultiDaySegment[],
  startColumn: number,
  endColumn: number,
) {
  let lane = 0;

  while (true) {
    const collision = existingSegments.some(
      (segment) =>
        segment.lane === lane &&
        overlaps(
          segment.startColumn,
          segment.endColumn,
          startColumn,
          endColumn,
        ),
    );

    if (!collision) {
      return lane;
    }

    lane++;
  }
}
export function buildMultiDaySegments(
  weeks: dayjs.Dayjs[][],
  multiDayEvents: MultiDayEvent[],
): MultiDaySegment[] {
  const segments: MultiDaySegment[] = [];
  weeks.forEach((week, weekIndex) => {
    const weekSegments: MultiDaySegment[] = [];

    multiDayEvents.forEach((event) => {
      const weekStart = week[0];
      const weekEnd = week[6];

      const eventStart = dayjs(event.startDate);
      const eventEnd = dayjs(event.endDate);

      const overlapsWeek =
        !eventEnd.isBefore(weekStart, "day") &&
        !eventStart.isAfter(weekEnd, "day");

      if (!overlapsWeek) {
        return;
      }

      const visibleStart = eventStart.isAfter(weekStart, "day")
        ? eventStart
        : weekStart;

      const visibleEnd = eventEnd.isBefore(weekEnd, "day") ? eventEnd : weekEnd;

      const startColumn = visibleStart.diff(weekStart, "day");
      const endColumn = visibleEnd.diff(weekStart, "day");
      const lane = findAvailableLane(weekSegments, startColumn, endColumn);
      segments.push({
        itemId: event.item.id,
        title: event.item.title,

        weekIndex,

        startColumn,
        endColumn,

        spanColumns: endColumn - startColumn + 1,

        isStart: visibleStart.isSame(eventStart, "day"),
        isEnd: visibleEnd.isSame(eventEnd, "day"),

        item: event.item,
        lane,
      });
      weekSegments.push({
        itemId: event.item.id,
        title: event.item.title,

        weekIndex,

        startColumn,
        endColumn,

        spanColumns: endColumn - startColumn + 1,

        isStart: visibleStart.isSame(eventStart, "day"),
        isEnd: visibleEnd.isSame(eventEnd, "day"),

        item: event.item,
        lane,
      });
    });
  });
  const segmentsByWeek = new Map<number, MultiDaySegment[]>();

  for (const segment of segments) {
    const current = segmentsByWeek.get(segment.weekIndex) ?? [];
    current.push(segment);
    segmentsByWeek.set(segment.weekIndex, current);
  }

  segmentsByWeek.forEach((weekSegments) => {
    const laneEndColumns: number[] = [];

    weekSegments
      .sort((a, b) => a.startColumn - b.startColumn)
      .forEach((segment) => {
        let lane = 0;

        while (
          laneEndColumns[lane] !== undefined &&
          laneEndColumns[lane] >= segment.startColumn
        ) {
          lane++;
        }

        laneEndColumns[lane] = segment.endColumn;
        segment.lane = lane;
      });
  });

  return segments;
}
