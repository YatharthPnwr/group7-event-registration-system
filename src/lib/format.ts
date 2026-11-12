const dateTime = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

/** e.g. "20 Nov 2026, 10:00 am" in Indian time, whatever the server's timezone. */
export function formatDateTime(date: Date): string {
  return dateTime.format(date);
}
