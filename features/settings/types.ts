// features/settings/types.ts
import { TravelBufferMap } from "@/features/travel-buffer/types";

export type TeamupEvent = {
  id: string;
  title: string;
  start_dt: string;
  end_dt: string;
};

export type GlobalSettingsContextValue = {
  events: TeamupEvent[];
  setEvents: React.Dispatch<React.SetStateAction<TeamupEvent[]>>;

  excludedTitles: string[];
  setExcludedTitles: React.Dispatch<React.SetStateAction<string[]>>;

  filteredEvents: TeamupEvent[];

  travelBuffers: TravelBufferMap;
  setTravelBuffers: React.Dispatch<React.SetStateAction<TravelBufferMap>>;

  updateTravelBuffer: (
    location: string,
    key: "from" | "to",
    value: number,
  ) => void;
};
