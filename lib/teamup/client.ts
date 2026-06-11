const TEAMUP_BASE_URL = 'https://api.teamup.com';

export async function teamupFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const calendarKey = process.env.TEAMUP_CALENDAR_KEY;
  const apiKey = process.env.TEAMUP_API_KEY;

  if (!calendarKey || !apiKey) {
    throw new Error('Missing Teamup environment variables');
  }

  const response = await fetch(`${TEAMUP_BASE_URL}/${calendarKey}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Teamup-Token': apiKey,
      ...options.headers,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Teamup API failed: ${response.status} ${text}`);
  }

  return response.json();
}