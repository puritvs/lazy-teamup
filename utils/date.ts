export type DateDisplayFormat = "day/month/year" | "month-name";

export function getMonthName(month: number): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return months[month - 1] ?? "";
}

export function getMonthRange(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}
export function formatDate(
  dateInput: string | Date,
  format: DateDisplayFormat = "day/month/year",
): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  if (format === "month-name") {
    const monthName = date.toLocaleString("en-US", {
      month: "short",
    });

    return `${day} ${monthName} ${year}`;
  }

  return `${day}/${month}/${year}`;
}

export function formatEventDateRange(
  startDt: string,
  endDt: string,
  format: DateDisplayFormat = "day/month/year",
): string {
  const start = new Date(startDt);
  const end = new Date(endDt);

  const startTime = `${String(start.getHours()).padStart(2, "0")}:${String(
    start.getMinutes(),
  ).padStart(2, "0")}`;

  const endTime = `${String(end.getHours()).padStart(2, "0")}:${String(
    end.getMinutes(),
  ).padStart(2, "0")}`;

  return `${formatDate(start, format)} ${startTime} - ${endTime}`;
}
