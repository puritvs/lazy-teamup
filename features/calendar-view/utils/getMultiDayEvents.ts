import { CalendarVisualItem } from "../types";

export type MultiDayEvent = {
  item: CalendarVisualItem;
  startDate: string;
  endDate: string;
  spanDays: number;
};

export function getMultiDayEvents(
  items: CalendarVisualItem[],
): MultiDayEvent[] {
  return items
    .filter((item) => {
      return item.start_dt.slice(0, 10) !== item.end_dt.slice(0, 10);
    })
    .map((item) => {
      const start = new Date(item.start_dt);
      const end = new Date(item.end_dt);

      const startDay = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
      );

      const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());

      const spanDays =
        Math.floor(
          (endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24),
        ) + 1;

      return {
        item,
        startDate: item.start_dt.slice(0, 10),
        endDate: item.end_dt.slice(0, 10),
        spanDays,
      };
    });
}
