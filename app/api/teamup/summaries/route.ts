import { NextRequest, NextResponse } from 'next/server';
import { getTeamupEvents } from '@/lib/teamup/events';
import { getMonthRange } from '@/utils/date';
import { summarizeEvents } from '@/features/calendar-summary/services/summarizeEvents';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const year = Number(searchParams.get('year'));
  const month = Number(searchParams.get('month'));

  if (!year || !month || month < 1 || month > 12) {
    return NextResponse.json(
      { error: 'Valid year and month are required' },
      { status: 400 }
    );
  }

  const { startDate, endDate } = getMonthRange(year, month);

  const data = await getTeamupEvents({
    startDate,
    endDate,
  });

  const summary = summarizeEvents(data.events);

  return NextResponse.json({
    year,
    month,
    startDate,
    endDate,
    summary,
  });
}