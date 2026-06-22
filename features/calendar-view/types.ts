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
  title: string;

  weekIndex: number;

  startColumn: number;
  endColumn: number;

  spanColumns: number;

  isStart: boolean;
  isEnd: boolean;

  item: CalendarVisualItem;
};
