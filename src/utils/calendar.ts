export function formatDateToICS(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

export interface ICSEventData {
  title: string;
  location: string;
  description: string;
  startDate: string; // ISO Date String
  endDate: string;   // ISO Date String
}

export function generateICSContent(event: ICSEventData): string {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  const now = new Date();

  const formattedStart = formatDateToICS(start);
  const formattedEnd = formatDateToICS(end);
  const formattedNow = formatDateToICS(now);

  const uid = `event-${start.getTime()}-wedding@smartinvitation.com`;

  // Escape special characters in fields
  const escapeText = (text: string) => {
    return text
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");
  };

  const cleanSummary = escapeText(event.title);
  const cleanLocation = escapeText(event.location);
  const cleanDescription = escapeText(event.description);

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Smart Invitation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formattedNow}`,
    `DTSTART:${formattedStart}`,
    `DTEND:${formattedEnd}`,
    `SUMMARY:${cleanSummary}`,
    `LOCATION:${cleanLocation}`,
    `DESCRIPTION:${cleanDescription}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT30M", // 30 minutes before
    "ACTION:DISPLAY",
    "DESCRIPTION:Reminder",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return icsLines.join("\r\n");
}

export function downloadICSFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
