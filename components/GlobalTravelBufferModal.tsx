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
  return (
    <div className="fixed inset-0 z-50 bg-black/70 p-3">
      <div className="mx-auto max-h-[90vh] max-w-3xl overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Travel Buffers</h2>
            <p className="text-sm text-zinc-400">
              Shared across Available Que and Que Check.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-800 px-3 py-1 text-sm text-zinc-300"
          >
            Close
          </button>
        </div>

        {detectedLocations.length === 0 ? (
          <p className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-400">
            No non-default locations detected from current visible events.
          </p>
        ) : (
          <div className="space-y-2">
            {detectedLocations.map((location) => (
              <div
                key={location}
                className="grid gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-3 sm:grid-cols-[1fr_120px_120px]"
              >
                <div>
                  <p className="font-medium text-zinc-100">{location}</p>
                  <p className="text-xs text-zinc-500">
                    Detected from @Location in event titles.
                  </p>
                </div>

                <label className="space-y-1">
                  <span className="text-xs text-zinc-500">From</span>
                  <input
                    type="number"
                    min={0}
                    value={travelBuffers[location]?.from ?? 30}
                    onChange={(e) =>
                      updateTravelBuffer(
                        location,
                        "from",
                        Number(e.target.value),
                      )
                    }
                    className="w-full rounded border border-zinc-800 bg-black px-2 py-1 text-sm text-zinc-100"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs text-zinc-500">To</span>
                  <input
                    type="number"
                    min={0}
                    value={travelBuffers[location]?.to ?? 30}
                    onChange={(e) =>
                      updateTravelBuffer(location, "to", Number(e.target.value))
                    }
                    className="w-full rounded border border-zinc-800 bg-black px-2 py-1 text-sm text-zinc-100"
                  />
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
