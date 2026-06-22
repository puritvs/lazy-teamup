import dayjs from "dayjs";
import { CalendarVisualItem, MultiDaySegment } from "../types";
import { MultiDayEvent } from "./getMultiDayEvents";

export function buildMultiDaySegments(
  weeks: dayjs.Dayjs[][],
  multiDayEvents: MultiDayEvent[],
): MultiDaySegment[] {
  console.log("build multiday segments");
  // implementation
  return false as unknown as MultiDaySegment[];
}
