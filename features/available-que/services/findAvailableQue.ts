import {
  AvailableQueDay,
  AvailableQueSlot,
  EventForAvailability,
} from "../types";
import { TravelBufferMap } from "@/features/travel-buffer/types";
import {
  DEFAULT_LOCATION,
  extractLocationFromTitle,
} from "@/features/travel-buffer/utils";

type Params = {
  events: EventForAvailability[];
  startDate: string;
  endDate: string;
  dailyStartTime: string;
  dailyEndTime: string;
  minDurationMinutes?: number;
  travelBuffers?: TravelBufferMap;
  includeTravelBuffers?: boolean;
};

type BusyRange = {
  start: Date;
  end: Date;
  event: EventForAvailability;
};

function toDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

function formatTime(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

function addMinutes(date: Date, minutes: number) {
  const next = new Date(date);
  next.setMinutes(next.getMinutes() + minutes);
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTravelBufferMinutes(
  event: EventForAvailability | undefined,
  direction: "from" | "to",
  travelBuffers: TravelBufferMap,
) {
  if (!event) return 0;

  const location = extractLocationFromTitle(event.title);

  if (location === DEFAULT_LOCATION) return 0;

  return travelBuffers[location]?.[direction] ?? 30;
}

function buildSlot({
  date,
  start,
  end,
  previousEvent,
  nextEvent,
  minDurationMinutes,
  travelBuffers,
  includeTravelBuffers,
}: {
  date: string;
  start: Date;
  end: Date;
  previousEvent?: EventForAvailability;
  nextEvent?: EventForAvailability;
  minDurationMinutes: number;
  travelBuffers: TravelBufferMap;
  includeTravelBuffers: boolean;
}): AvailableQueSlot | null {
  const adjustedStart = includeTravelBuffers
    ? addMinutes(
        start,
        getTravelBufferMinutes(previousEvent, "from", travelBuffers),
      )
    : start;

  const adjustedEnd = includeTravelBuffers
    ? addMinutes(end, -getTravelBufferMinutes(nextEvent, "to", travelBuffers))
    : end;

  const durationMinutes =
    (adjustedEnd.getTime() - adjustedStart.getTime()) / 1000 / 60;

  if (durationMinutes < minDurationMinutes) {
    return null;
  }

  return {
    date,
    start: formatTime(adjustedStart),
    end: formatTime(adjustedEnd),
    durationMinutes,
  };
}

export function findAvailableQue({
  events,
  startDate,
  endDate,
  dailyStartTime,
  dailyEndTime,
  minDurationMinutes = 30,
  travelBuffers = {},
  includeTravelBuffers = true,
}: Params): AvailableQueDay[] {
  const result: AvailableQueDay[] = [];

  let currentDate = new Date(`${startDate}T00:00:00`);
  const finalDate = new Date(`${endDate}T00:00:00`);

  while (currentDate <= finalDate) {
    const date = formatDate(currentDate);

    const dayStart = toDateTime(date, dailyStartTime);
    const dayEnd = toDateTime(date, dailyEndTime);

    const busyRanges: BusyRange[] = events
      .map((event) => ({
        start: new Date(event.start_dt),
        end: new Date(event.end_dt),
        event,
      }))
      .filter((range) => range.start < dayEnd && range.end > dayStart)
      .map((range) => ({
        start: range.start < dayStart ? dayStart : range.start,
        end: range.end > dayEnd ? dayEnd : range.end,
        event: range.event,
      }))
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    const slots: AvailableQueSlot[] = [];
    let cursor = dayStart;
    let previousEvent: EventForAvailability | undefined;

    for (const busy of busyRanges) {
      if (busy.start > cursor) {
        const slot = buildSlot({
          date,
          start: cursor,
          end: busy.start,
          previousEvent,
          nextEvent: busy.event,
          minDurationMinutes,
          travelBuffers,
          includeTravelBuffers,
        });

        if (slot) {
          slots.push(slot);
        }
      }

      if (busy.end > cursor) {
        cursor = busy.end;
        previousEvent = busy.event;
      }
    }

    if (cursor < dayEnd) {
      const slot = buildSlot({
        date,
        start: cursor,
        end: dayEnd,
        previousEvent,
        minDurationMinutes,
        travelBuffers,
        includeTravelBuffers,
      });

      if (slot) {
        slots.push(slot);
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
