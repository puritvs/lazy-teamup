import { Dispatch, SetStateAction } from "react";
import { TravelBufferMap } from "@/features/travel-buffer/types";
import { CalendarVisualItem } from "@/features/calendar-view/types";
export type TeamupEvent = {
  id: string;
  title: string;
  start_dt: string;
  end_dt: string;
};

export type GlobalSettingsContextValue = {
  events: TeamupEvent[];
  setEvents: Dispatch<SetStateAction<TeamupEvent[]>>;

  excludedTitles: string[];
  setExcludedTitles: Dispatch<SetStateAction<string[]>>;

  filteredEvents: TeamupEvent[];

  travelBuffers: TravelBufferMap;
  setTravelBuffers: Dispatch<SetStateAction<TravelBufferMap>>;

  updateTravelBuffer: (
    location: string,
    key: "from" | "to",
    value: number,
  ) => void;

  ensureTravelBuffersForLocations: (locations: string[]) => void;
  calendarLayers: {
    availableQue: CalendarVisualItem[];
    queCheck: CalendarVisualItem[];
  };

  setAvailableQueCalendarItems: (items: CalendarVisualItem[]) => void;
  setQueCheckCalendarItems: (items: CalendarVisualItem[]) => void;
  clearCalendarLayer: (layer: "availableQue" | "queCheck") => void;
};
