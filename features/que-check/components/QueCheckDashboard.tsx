"use client";

import { QueCheckForm } from "./QueCheckForm";
import { useGlobalSettings } from "@/features/settings/GlobalSettingsProvider";

export function QueCheckDashboard() {
  const { filteredEvents, dateFormat } = useGlobalSettings();

  return (
    <div className="space-y-6">
      <QueCheckForm events={filteredEvents} dateFormat={dateFormat} />
    </div>
  );
}
