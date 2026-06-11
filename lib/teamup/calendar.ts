// lib/teamup/calendar.ts
import { teamupFetch } from "./client";

export type TeamupCalendarConfig = {
  configuration: {
    title?: string;
    name?: string;
  };
};

export async function getTeamupCalendarConfig() {
  return teamupFetch<TeamupCalendarConfig>("/configuration");
}
