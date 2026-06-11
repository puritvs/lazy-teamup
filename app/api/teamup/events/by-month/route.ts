import { NextRequest, NextResponse } from "next/server";
import { getTeamupEvents } from "@/lib/teamup/events";
import { getMonthRange } from "@/utils/date";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month"));

  if (!year || year < 2000 || year > 2100) {
    return NextResponse.json(
      { error: "Year must be between 2000 and 2100." },
      { status: 400 },
    );
  }

  if (!month || month < 1 || month > 12) {
    return NextResponse.json(
      { error: "Month must be between 1 and 12." },
      { status: 400 },
    );
  }

  const { startDate, endDate } = getMonthRange(year, month);

  const data = await getTeamupEvents({
    startDate,
    endDate,
  });

  return NextResponse.json(data);
}
