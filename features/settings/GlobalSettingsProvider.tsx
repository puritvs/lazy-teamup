"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { TravelBufferMap } from "@/features/travel-buffer/types";
import { TeamupEvent, GlobalSettingsContextValue } from "./types";
import { CalendarVisualItem } from "@/features/calendar-view/types";
const DEFAULT_TRAVEL_BUFFER_MINUTES = 30;

const GlobalSettingsContext = createContext<GlobalSettingsContextValue | null>(
  null,
);

export function GlobalSettingsProvider({ children }: { children: ReactNode }) {
  const today = new Date();

  const [calendarMonth, setCalendarMonth] = useState(today.getMonth() + 1);
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [dateFormat, setDateFormat] = useState<"day/month/year" | "month-name">(
    "day/month/year",
  );

  const [events, setEvents] = useState<TeamupEvent[]>([]);
  const [rawEvents, setRawEvents] = useState<TeamupEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [availableQueCalendarItems, setAvailableQueCalendarItems] = useState<
    CalendarVisualItem[]
  >([]);

  const [queCheckCalendarItems, setQueCheckCalendarItems] = useState<
    CalendarVisualItem[]
  >([]);

  const clearCalendarLayer = useCallback(
    (layer: "availableQue" | "queCheck") => {
      if (layer === "availableQue") {
        setAvailableQueCalendarItems([]);
        return;
      }

      setQueCheckCalendarItems([]);
    },
    [],
  );
  const [excludedTitles, setExcludedTitles] = useLocalStorage<string[]>(
    "lazy-teamup-excluded-titles",
    [],
  );

  const [travelBuffers, setTravelBuffers] = useLocalStorage<TravelBufferMap>(
    "lazy-teamup-travel-buffers",
    {},
  );
  const loadEvents = useCallback(async () => {
    setLoadingEvents(true);

    try {
      const res = await fetch(
        `/api/teamup/events/by-month?year=${calendarYear}&month=${calendarMonth}`,
      );

      const data = await res.json();
      const nextEvents = data.events ?? data;

      setRawEvents(nextEvents);
      setEvents(nextEvents);
    } finally {
      setLoadingEvents(false);
    }
  }, [calendarMonth, calendarYear]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);
  const filteredEvents = useMemo(() => {
    return events.filter((event) => !excludedTitles.includes(event.title));
  }, [events, excludedTitles]);

  const updateTravelBuffer = useCallback(
    (location: string, key: "from" | "to", value: number) => {
      setTravelBuffers((current) => ({
        ...current,
        [location]: {
          from: current[location]?.from ?? DEFAULT_TRAVEL_BUFFER_MINUTES,
          to: current[location]?.to ?? DEFAULT_TRAVEL_BUFFER_MINUTES,
          [key]: Math.max(0, value),
        },
      }));
    },
    [setTravelBuffers],
  );

  const ensureTravelBuffersForLocations = useCallback(
    (locations: string[]) => {
      setTravelBuffers((current) => {
        const next = { ...current };
        let changed = false;

        for (const location of locations) {
          if (!next[location]) {
            next[location] = {
              from: DEFAULT_TRAVEL_BUFFER_MINUTES,
              to: DEFAULT_TRAVEL_BUFFER_MINUTES,
            };
            changed = true;
          }
        }

        return changed ? next : current;
      });
    },
    [setTravelBuffers],
  );

  const value = useMemo<GlobalSettingsContextValue>(
    () => ({
      events,
      setEvents,
      excludedTitles,
      setExcludedTitles,
      filteredEvents,
      travelBuffers,
      setTravelBuffers,
      updateTravelBuffer,
      ensureTravelBuffersForLocations,
      calendarLayers: {
        availableQue: availableQueCalendarItems,
        queCheck: queCheckCalendarItems,
      },
      setAvailableQueCalendarItems,
      setQueCheckCalendarItems,
      clearCalendarLayer,
      calendarMonth,
      setCalendarMonth,
      calendarYear,
      setCalendarYear,
      dateFormat,
      setDateFormat,
      rawEvents,
      loadingEvents,
      loadEvents,
    }),
    [
      events,
      excludedTitles,
      setExcludedTitles,
      filteredEvents,
      travelBuffers,
      setTravelBuffers,
      updateTravelBuffer,
      ensureTravelBuffersForLocations,
      availableQueCalendarItems,
      queCheckCalendarItems,
      clearCalendarLayer,
      calendarMonth,
      calendarYear,
      dateFormat,
      rawEvents,
      loadingEvents,
      loadEvents,
    ],
  );

  return (
    <GlobalSettingsContext.Provider value={value}>
      {children}
    </GlobalSettingsContext.Provider>
  );
}

export function useGlobalSettings() {
  const value = useContext(GlobalSettingsContext);

  if (!value) {
    throw new Error(
      "useGlobalSettings must be used inside GlobalSettingsProvider",
    );
  }

  return value;
}
