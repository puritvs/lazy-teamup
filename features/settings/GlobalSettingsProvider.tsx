"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
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
  const [events, setEvents] = useState<TeamupEvent[]>([]);
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
