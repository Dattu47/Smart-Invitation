export interface EventDetails {
  title: string;
  coupleNames: string;
  date: string;
  time: string;
  venueName: string;
  address: string;
  latitude: number;
  longitude: number;
  startDateTime: string; // ISO string with timezone or UTC
  endDateTime: string;   // ISO string with timezone or UTC
  description: string;
}

export const EVENT_DETAILS: EventDetails = {
  title: "John & Emma Wedding",
  coupleNames: "John & Emma",
  date: "20 December 2026",
  time: "6:30 PM",
  venueName: "Royal Grand Convention Hall",
  address: "123 Main Road, Hyderabad",
  latitude: 17.385044,
  longitude: 78.486671,
  // Start: Dec 20, 2026 at 6:30 PM IST (UTC +5:30)
  startDateTime: "2026-12-20T18:30:00+05:30",
  // End: Dec 20, 2026 at 10:30 PM IST (UTC +5:30)
  endDateTime: "2026-12-20T22:30:00+05:30",
  description: "We look forward to celebrating with you.",
};
