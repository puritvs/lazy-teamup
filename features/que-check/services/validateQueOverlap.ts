import { OverlapGroup } from "@/features/calendar-overlaps/services/findOverlappingEvents";
import { ParsedQueEvent, QueCheckEvent } from "../types";

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

export function validateQueOverlap(
  parsed: ParsedQueEvent,
  existingEvents: QueCheckEvent[],
): OverlapGroup | null {
  const proposedEvent: QueCheckEvent = {
    id: parsed.id,
    title: `[NEW] ${parsed.title}`,
    start_dt: `${parsed.date}T${parsed.startTime}:00`,
    end_dt: `${parsed.endDate}T${parsed.endTime}:00`,
  };

  const proposedStart = new Date(proposedEvent.start_dt).getTime();
  const proposedEnd = new Date(proposedEvent.end_dt).getTime();

  if (proposedEnd <= proposedStart) {
    throw new Error("End time must be after start time.");
  }

  const conflictingEvents = existingEvents.filter((event) => {
    const eventStart = new Date(event.start_dt).getTime();
    const eventEnd = new Date(event.end_dt).getTime();

    return overlaps(proposedStart, proposedEnd, eventStart, eventEnd);
  });

  if (conflictingEvents.length === 0) {
    return null;
  }

  const events = [proposedEvent, ...conflictingEvents];

  return {
    id: events.map((event) => event.id).join("|"),
    date: parsed.date,
    startTime: Math.min(
      ...events.map((event) => new Date(event.start_dt).getTime()),
    ),
    endTime: Math.max(
      ...events.map((event) => new Date(event.end_dt).getTime()),
    ),
    events,
    severity:
      events.length >= 4 ? "high" : events.length === 3 ? "medium" : "low",
  };
}
