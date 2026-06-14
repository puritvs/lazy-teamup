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
import { TeamupEvent, GlobalSettingsContextValue } from "./types";
import { TravelBufferMap } from "@/features/travel-buffer/types";

const DEFAULT_TRAVEL_BUFFER_MINUTES = 30;

const GlobalSettingsContext = createContext<GlobalSettingsContextValue | null>(
  null,
);

export function GlobalSettingsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<TeamupEvent[]>([]);

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
        let changed = false;
        const next = { ...current };

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
    }),
    [
      events,
      setEvents,
      excludedTitles,
      setExcludedTitles,
      filteredEvents,
      travelBuffers,
      setTravelBuffers,
      updateTravelBuffer,
      ensureTravelBuffersForLocations,
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
