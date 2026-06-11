export type TeamupEvent = {
  id: string;
  title: string;
  start_dt: string;
  end_dt: string;
  all_day: boolean;
  subcalendar_ids: number[];
  location?: string;
  who?: string;
  notes?: string;
};

export type TeamupEventsResponse = {
  events: TeamupEvent[];
};