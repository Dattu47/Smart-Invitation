import { kv } from "@vercel/kv";
import { EventData } from "../types";

const EVENTS_KEY = "events_registry";

// Fetch all events from KV database
export async function readEvents(): Promise<EventData[]> {
  try {
    const events = await kv.get<EventData[]>(EVENTS_KEY);
    return events || [];
  } catch (error) {
    console.error("Failed to load events from KV", error);
    return [];
  }
}

// Persist events array to KV database
export async function writeEvents(events: EventData[]): Promise<void> {
  try {
    await kv.set(EVENTS_KEY, events);
  } catch (error) {
    console.error("Failed to commit changes to KV database", error);
    throw error;
  }
}

// Query single event by UID
export async function getEventById(id: string): Promise<EventData | undefined> {
  const events = await readEvents();
  return events.find((e) => e.id === id);
}

// Create and store a new event record
export async function createEvent(event: Omit<EventData, "createdAt" | "updatedAt">): Promise<EventData> {
  const events = await readEvents();
  const now = new Date().toISOString();
  const newEvent: EventData = {
    ...event,
    createdAt: now,
    updatedAt: now,
  };
  events.push(newEvent);
  await writeEvents(events);
  return newEvent;
}

// Update details on an existing event record
export async function updateEvent(
  id: string,
  updatedFields: Partial<Omit<EventData, "id" | "createdAt" | "updatedAt">>
): Promise<EventData | undefined> {
  const events = await readEvents();
  const idx = events.findIndex((e) => e.id === id);
  if (idx === -1) return undefined;

  const now = new Date().toISOString();
  const updatedEvent: EventData = {
    ...events[idx],
    ...updatedFields,
    updatedAt: now,
  };

  events[idx] = updatedEvent;
  await writeEvents(events);
  return updatedEvent;
}

// Delete an event record
export async function deleteEvent(id: string): Promise<boolean> {
  const events = await readEvents();
  const filtered = events.filter((e) => e.id !== id);
  if (filtered.length === events.length) return false;
  await writeEvents(filtered);
  return true;
}
