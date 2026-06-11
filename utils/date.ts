export type DateDisplayFormat = "month-number" | "month-name";
export function getMonthName(month: number) {
  return new Date(2000, month - 1).toLocaleString("en-US", {
    month: "long",
  });
}

export function getMonthRange(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

export function formatEventDateRange(
  startDateTime: string,
  endDateTime: string,
  format: DateDisplayFormat = "month-number",
) {
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);

  const day = String(start.getDate()).padStart(2, "0");
  const monthNumber = String(start.getMonth() + 1).padStart(2, "0");
  const year = start.getFullYear();
  const monthName = start.toLocaleString("en-US", { month: "short" });

  const date =
    format === "month-name"
      ? `${day} ${monthName} ${year}`
      : `${day}/${monthNumber}/${year}`;

  const startTime = `${String(start.getHours()).padStart(2, "0")}:${String(
    start.getMinutes(),
  ).padStart(2, "0")}`;

  const endTime = `${String(end.getHours()).padStart(2, "0")}:${String(
    end.getMinutes(),
  ).padStart(2, "0")}`;

  return `${date} • ${startTime} - ${endTime}`;
}
