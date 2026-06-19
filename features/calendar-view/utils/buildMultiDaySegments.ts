import { CalendarVisualItem } from "../types";

export type MultiDaySegment = {
  itemId: string;
  title: string;

  weekIndex: number;

  startColumn: number;
  endColumn: number;

  spanColumns: number;

  item: CalendarVisualItem;
};
