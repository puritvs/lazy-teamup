import dayjs from "dayjs";

export function getCalendarWeeks(days: dayjs.Dayjs[]) {
  const weeks: dayjs.Dayjs[][] = [];

  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return weeks;
}
