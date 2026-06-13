export const DEFAULT_LOCATION = "Default office";

export type EventWithTitle = {
  title: string;
};

export function extractLocationFromTitle(title: string) {
  const match = title.match(/@(.+)$/);
  return match ? match[1].trim() : DEFAULT_LOCATION;
}

export function getUniqueNonDefaultLocations(events: EventWithTitle[]) {
  return Array.from(
    new Set(
      events
        .map((event) => extractLocationFromTitle(event.title))
        .filter((location) => location !== DEFAULT_LOCATION),
    ),
  ).sort();
}
