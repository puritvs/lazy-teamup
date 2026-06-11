export type CalendarEventForOverlap = {
  id: string;
  title: string;
  start_dt: string;
  end_dt: string;
};

export type OverlapGroup = {
  id: string;
  date: string;
  startTime: number;
  endTime: number;
  events: CalendarEventForOverlap[];
  severity: "low" | "medium" | "high";
};

function overlaps(a: CalendarEventForOverlap, b: CalendarEventForOverlap) {
  const aStart = new Date(a.start_dt).getTime();
  const aEnd = new Date(a.end_dt).getTime();
  const bStart = new Date(b.start_dt).getTime();
  const bEnd = new Date(b.end_dt).getTime();

  return aStart < bEnd && bStart < aEnd;
}

export function findOverlappingEvents(
  events: CalendarEventForOverlap[],
): OverlapGroup[] {
  const sortedEvents = [...events]
    .filter((event) => event.start_dt && event.end_dt)
    .sort(
      (a, b) => new Date(a.start_dt).getTime() - new Date(b.start_dt).getTime(),
    );

  const visited = new Set<string>();
  const groups: OverlapGroup[] = [];

  for (const event of sortedEvents) {
    if (visited.has(event.id)) continue;

    const cluster = new Set<CalendarEventForOverlap>();
    const queue = [event];

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (cluster.has(current)) continue;

      cluster.add(current);

      for (const other of sortedEvents) {
        if (other.id === current.id) continue;

        if (overlaps(current, other) && !cluster.has(other)) {
          queue.push(other);
        }
      }
    }

    if (cluster.size > 1) {
      const clusterEvents = Array.from(cluster).sort(
        (a, b) =>
          new Date(a.start_dt).getTime() - new Date(b.start_dt).getTime(),
      );

      clusterEvents.forEach((item) => visited.add(item.id));

      const startTime = Math.min(
        ...clusterEvents.map((item) => new Date(item.start_dt).getTime()),
      );

      const endTime = Math.max(
        ...clusterEvents.map((item) => new Date(item.end_dt).getTime()),
      );

      groups.push({
        id: clusterEvents.map((item) => item.id).join("|"),
        date: clusterEvents[0].start_dt.slice(0, 10),
        startTime,
        endTime,
        events: clusterEvents,
        severity:
          clusterEvents.length >= 4
            ? "high"
            : clusterEvents.length === 3
              ? "medium"
              : "low",
      });
    }
  }

  return groups;
}

export function getOverlappingEventIds(groups: OverlapGroup[]) {
  return new Set(
    groups.flatMap((group) => group.events.map((event) => event.id)),
  );
}
