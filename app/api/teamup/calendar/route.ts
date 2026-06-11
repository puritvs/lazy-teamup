// app/api/teamup/calendar/route.ts
import { NextResponse } from "next/server";
import { getTeamupCalendarConfig } from "@/lib/teamup/calendar";

export async function GET() {
  const data = await getTeamupCalendarConfig();

  return NextResponse.json({
    name:
      data.configuration.title ?? data.configuration.name ?? "Teamup Calendar",
  });
}
