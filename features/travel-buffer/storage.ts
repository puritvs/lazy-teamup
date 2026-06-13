import { TravelBufferMap } from "./types";

export const TRAVEL_BUFFER_STORAGE_KEY = "lazy-teamup-travel-buffers";

export function loadTravelBuffers(): TravelBufferMap {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(
      localStorage.getItem(TRAVEL_BUFFER_STORAGE_KEY) ?? "{}",
    ) as TravelBufferMap;
  } catch {
    return {};
  }
}

export function saveTravelBuffers(buffers: TravelBufferMap) {
  localStorage.setItem(TRAVEL_BUFFER_STORAGE_KEY, JSON.stringify(buffers));
  window.dispatchEvent(new Event("lazy-teamup-local-storage-change"));
}
