export type CalendarVisualItemType =
  | "event"
  | "conflict"
  | "available-que"
  | "que-check";

export type CalendarVisualItem = {
  id: string;
  type: CalendarVisualItemType;
  title: string;
  start_dt: string;
  end_dt: string;
  description?: string;
  sourceId?: string;
};

export type MultiDaySegment = {
  itemId: string;
  weekIndex: number;
  startColumn: number;
  spanColumns: number;
};
