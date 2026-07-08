import { kv } from "@vercel/kv";
import fs from "fs";
import path from "path";
import { EventData } from "../types";

const EVENTS_KEY = "events_registry";

// Determine if we should use local fallback (when KV env vars are missing, like on localhost)
const useLocalFallback = !process.env.KV_REST_API_URL;
const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "events.json");

// Helper for local fallback initialization
function initializeLocalDB(): void {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

// Fetch all events
export async function readEvents(): Promise<EventData[]> {
  if (useLocalFallback) {
    try {
      initializeLocalDB();
      const rawData = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(rawData);
    } catch (error) {
      console.error("Failed to load local events registry", error);
      return [];
    }
  }

  try {
    const events = await kv.get<EventData[]>(EVENTS_KEY);
    return events || [];
  } catch (error) {
    console.error("Failed to load events from KV", error);
    return [];
  }
}

// Persist events array
export async function writeEvents(events: EventData[]): Promise<void> {
  if (useLocalFallback) {
    try {
      initializeLocalDB();
      fs.writeFileSync(DB_FILE, JSON.stringify(events, null, 2), "utf-8");
      return;
    } catch (error) {
      console.error("Failed to commit changes to local database", error);
      throw error;
    }
  }

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
