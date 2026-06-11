import { TeamupEvent } from '@/lib/teamup/types';

export type MonthlyEventSummary = {
  totalEvents: number;
  allDayEvents: number;
  timedEvents: number;
  eventsByTitle: Record<string, number>;
  eventsBySubcalendar: Record<string, number>;
  busiestDay: {
    date: string;
    count: number;
  } | null;
};

export function summarizeEvents(events: TeamupEvent[]): MonthlyEventSummary {
  const eventsByTitle: Record<string, number> = {};
  const eventsBySubcalendar: Record<string, number> = {};
  const eventsByDate: Record<string, number> = {};

  let allDayEvents = 0;
  let timedEvents = 0;

  for (const event of events) {
    if (event.all_day) {
      allDayEvents++;
    } else {
      timedEvents++;
    }

    eventsByTitle[event.title] = (eventsByTitle[event.title] ?? 0) + 1;

    for (const subcalendarId of event.subcalendar_ids) {
      const key = String(subcalendarId);
      eventsBySubcalendar[key] = (eventsBySubcalendar[key] ?? 0) + 1;
    }

    const date = event.start_dt.slice(0, 10);
    eventsByDate[date] = (eventsByDate[date] ?? 0) + 1;
  }

  const busiestDayEntry = Object.entries(eventsByDate).sort(
    (a, b) => b[1] - a[1]
  )[0];

  return {
    totalEvents: events.length,
    allDayEvents,
    timedEvents,
    eventsByTitle,
    eventsBySubcalendar,
    busiestDay: busiestDayEntry
      ? {
          date: busiestDayEntry[0],
          count: busiestDayEntry[1],
        }
      : null,
  };
}