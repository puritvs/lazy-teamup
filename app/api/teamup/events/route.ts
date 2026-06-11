import { NextRequest, NextResponse } from 'next/server';
import { getTeamupEvents } from '@/lib/teamup/events';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: 'startDate and endDate are required' },
      { status: 400 }
    );
  }

  const data = await getTeamupEvents({
    startDate,
    endDate,
  });

  return NextResponse.json(data);
}