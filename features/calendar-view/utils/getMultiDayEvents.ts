import { CalendarVisualItem } from "../types";
import dayjs from "dayjs";
export type MultiDayState = "single-day" | "start" | "middle" | "end";
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

export function getMultiDayState(
  item: CalendarVisualItem,
  dateKey: string,
): MultiDayState {
  const startDate = dayjs(item.start_dt).format("YYYY-MM-DD");
  const endDate = dayjs(item.end_dt).format("YYYY-MM-DD");

  if (startDate === endDate) {
    return "single-day";
  }

  if (dateKey === startDate) {
    return "start";
  }

  if (dateKey === endDate) {
    return "end";
  }

  return "middle";
}
