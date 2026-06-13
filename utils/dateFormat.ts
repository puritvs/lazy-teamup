import dayjs from "dayjs";

export const DATE_FORMAT = "DD-MM-YYYY";
export const TIME_FORMAT = "HH:mm";
export const DATE_TIME_FORMAT = "DD-MM-YYYY HH:mm";

export function formatDate(value: string | Date) {
  return dayjs(value).format(DATE_FORMAT);
}

export function formatTime(value: string | Date) {
  return dayjs(value).format(TIME_FORMAT);
}

export function formatDateTime(value: string | Date) {
  return dayjs(value).format(DATE_TIME_FORMAT);
}

export function formatDurationMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours.toString().padStart(2, "0")}:${remainingMinutes
    .toString()
    .padStart(2, "0")}`;
}
