import { teamupFetch } from './client';
import { TeamupEventsResponse } from './types';

export async function getTeamupEvents(params: {
  startDate: string;
  endDate: string;
  timezone?: string;
}) {
  const timezone = params.timezone ?? 'Asia/Bangkok';

  const searchParams = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
    tz: timezone,
  });

  return teamupFetch<TeamupEventsResponse>(
    `/events?${searchParams.toString()}`
  );
}