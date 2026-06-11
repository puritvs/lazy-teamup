import {
  AvailableQueDay,
  AvailableQueSlot,
  EventForAvailability,
} from "../types";

type Params = {
  events: EventForAvailability[];
  startDate: string;
  endDate: string;
  dailyStartTime: string;
  dailyEndTime: string;
  minDurationMinutes?: number;
};

function toDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

function formatTime(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function findAvailableQue({
  events,
  startDate,
  endDate,
  dailyStartTime,
  dailyEndTime,
  minDurationMinutes = 30,
}: Params): AvailableQueDay[] {
  const result: AvailableQueDay[] = [];

  let currentDate = new Date(`${startDate}T00:00:00`);
  const finalDate = new Date(`${endDate}T00:00:00`);

  while (currentDate <= finalDate) {
    const date = formatDate(currentDate);

    const dayStart = toDateTime(date, dailyStartTime);
    const dayEnd = toDateTime(date, dailyEndTime);

    const busyRanges = events
      .map((event) => ({
        start: new Date(event.start_dt),
        end: new Date(event.end_dt),
      }))
      .filter((range) => range.start < dayEnd && range.end > dayStart)
      .map((range) => ({
        start: range.start < dayStart ? dayStart : range.start,
        end: range.end > dayEnd ? dayEnd : range.end,
      }))
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    const slots: AvailableQueSlot[] = [];
    let cursor = dayStart;

    for (const busy of busyRanges) {
      if (busy.start > cursor) {
        const durationMinutes =
          (busy.start.getTime() - cursor.getTime()) / 1000 / 60;

        if (durationMinutes >= minDurationMinutes) {
          slots.push({
            date,
            start: formatTime(cursor),
            end: formatTime(busy.start),
            durationMinutes,
          });
        }
      }

      if (busy.end > cursor) {
        cursor = busy.end;
      }
    }

    if (cursor < dayEnd) {
      const durationMinutes = (dayEnd.getTime() - cursor.getTime()) / 1000 / 60;

      if (durationMinutes >= minDurationMinutes) {
        slots.push({
          date,
          start: formatTime(cursor),
          end: formatTime(dayEnd),
          durationMinutes,
        });
      }
    }

    result.push({
      date,
      slots,
    });

    currentDate = addDays(currentDate, 1);
  }

  return result;
}
