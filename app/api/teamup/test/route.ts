export async function GET() {
  const calendarKey = process.env.TEAMUP_CALENDAR_KEY!;
  const apiKey = process.env.TEAMUP_API_KEY!;

  const response = await fetch(
    `https://api.teamup.com/${calendarKey}/subcalendars`,
    {
      headers: {
        'Teamup-Token': apiKey,
      },
    }
  );

  const data = await response.json();

  return Response.json(data);
}