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
      lane: 0,
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
