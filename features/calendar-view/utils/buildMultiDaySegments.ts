import dayjs from "dayjs";
import { MultiDaySegment } from "../types";
import { MultiDayEvent } from "./getMultiDayEvents";

export function buildMultiDaySegments(
  weeks: dayjs.Dayjs[][],
  multiDayEvents: MultiDayEvent[],
): MultiDaySegment[] {
  const segments: MultiDaySegment[] = [];

  multiDayEvents.forEach((event) => {
    const weekIndex = weeks.findIndex((week) =>
      week.some((day) => day.format("YYYY-MM-DD") === event.startDate),
    );

    if (weekIndex === -1) {
      return;
    }

    const week = weeks[weekIndex];

    const startColumn = week.findIndex(
      (day) => day.format("YYYY-MM-DD") === event.startDate,
    );

    const endColumn = week.findIndex(
      (day) => day.format("YYYY-MM-DD") === event.endDate,
    );

    if (startColumn === -1 || endColumn === -1) {
      return;
    }

    segments.push({
      itemId: event.item.id,
      title: event.item.title,

      weekIndex,

      startColumn,
      endColumn,

      spanColumns: endColumn - startColumn + 1,

      isStart: true,
      isEnd: true,

      item: event.item,
    });
  });

  return segments;
}
