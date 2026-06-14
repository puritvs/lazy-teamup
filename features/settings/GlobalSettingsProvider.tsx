// features/settings/GlobalSettingsProvider.tsx
"use client";

import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { TravelBufferMap } from "@/features/travel-buffer/types";
import { TeamupEvent, GlobalSettingsContextValue } from "./types";

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

  function updateTravelBuffer(
    location: string,
    key: "from" | "to",
    value: number,
  ) {
    setTravelBuffers((current) => ({
      ...current,
      [location]: {
        from: current[location]?.from ?? 30,
        to: current[location]?.to ?? 30,
        [key]: Math.max(0, value),
      },
    }));
  }

  return (
    <GlobalSettingsContext.Provider
      value={{
        events,
        setEvents,
        excludedTitles,
        setExcludedTitles,
        filteredEvents,
        travelBuffers,
        setTravelBuffers,
        updateTravelBuffer,
      }}
    >
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
