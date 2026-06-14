"use client";

import { useEffect, useMemo } from "react";
import { useGlobalSettings } from "@/features/settings/GlobalSettingsProvider";
import { getUniqueNonDefaultLocations } from "@/features/travel-buffer/utils";

type TeamupEvent = { title: string };

type Props = {
  open: boolean;
  onClose: () => void;
  events: TeamupEvent[];
};

export function GlobalTravelBufferModal({ open, onClose, events }: Props) {
  const { travelBuffers, setTravelBuffers, updateTravelBuffer } =
    useGlobalSettings();

  const detectedLocations = useMemo(() => {
    return getUniqueNonDefaultLocations(events);
  }, [events]);

  useEffect(() => {
    setTravelBuffers((current) => {
      const next = { ...current };
      let changed = false;

      for (const location of detectedLocations) {
        if (!next[location]) {
          next[location] = { from: 30, to: 30 };
          changed = true;
        }
      }

      return changed ? next : current;
    });
  }, [detectedLocations, setTravelBuffers]);

  if (!open) return null;

  // keep your existing JSX here
}
