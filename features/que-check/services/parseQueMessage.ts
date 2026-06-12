import { ParsedQueEvent } from "../types";

function parseDateTimeToISO(dateTime: string) {
  const match = dateTime.match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})$/);

  if (!match) {
    throw new Error("Date time must be in DD-MM-YYYY HH:mm format.");
  }

  const [, day, month, year, hour, minute] = match;

  return {
    isoDate: `${year}-${month}-${day}`,
    time: `${hour}:${minute}`,
    dateTime: `${year}-${month}-${day}T${hour}:${minute}:00`,
  };
}

export function parseQueMessage(message: string): ParsedQueEvent[] {
  const titleMatch = message.match(/^Title:\s*(.+)$/im);
  const locationMatch = message.match(/^Location:\s*(.+)$/im);

  if (!titleMatch) {
    throw new Error("Missing Title.");
  }

  const title = titleMatch[1].trim();
  const location = locationMatch?.[1]?.trim();

  const eventBlocks = message.match(/Start:\s*.+\nEnd:\s*.+/g);

  if (!eventBlocks || eventBlocks.length === 0) {
    throw new Error("Missing Start/End event blocks.");
  }

  return eventBlocks.map((block, index) => {
    const startMatch = block.match(/^Start:\s*(.+)$/im);
    const endMatch = block.match(/^End:\s*(.+)$/im);

    if (!startMatch || !endMatch) {
      throw new Error(`Invalid event block ${index + 1}.`);
    }

    const start = parseDateTimeToISO(startMatch[1].trim());
    const end = parseDateTimeToISO(endMatch[1].trim());

    const startMs = new Date(start.dateTime).getTime();
    const endMs = new Date(end.dateTime).getTime();

    if (endMs <= startMs) {
      throw new Error(`Event block ${index + 1}: End must be after Start.`);
    }

    return {
      id: `proposed-event-${index}`,
      title: location ? `${title} @${location}` : title,
      date: start.isoDate,
      endDate: end.isoDate,
      startTime: start.time,
      endTime: end.time,
      crossesMidnight: start.isoDate !== end.isoDate,
    };
  });
}
