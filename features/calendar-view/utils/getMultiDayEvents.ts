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
  items.forEach((item) => {
    if (item.title.includes("faviq")) {
      console.log({
        title: item.title,
        start_dt: item.start_dt,
        end_dt: item.end_dt,
        startDate: dayjs(item.start_dt).format("YYYY-MM-DD"),
        endDate: dayjs(item.end_dt).format("YYYY-MM-DD"),
      });
    }
  });
  return items
    .filter((item) => {
      const isMultiDay =
        dayjs(item.start_dt).format("YYYY-MM-DD") !==
        dayjs(item.end_dt).format("YYYY-MM-DD");

      if (!isMultiDay) {
        return false;
      }

      if (item.id.startsWith("conflict-notice-")) {
        return false;
      }

      return (
        item.type !== "available-que" &&
        item.type !== "que-check" &&
        item.type !== "conflict"
      );
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
        startDate: dayjs(item.start_dt).format("YYYY-MM-DD"),
        endDate: dayjs(item.end_dt).format("YYYY-MM-DD"),
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
