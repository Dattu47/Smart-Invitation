import fs from "fs";
import path from "path";
import { EventData } from "../types";

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "events.json");

// Check and ensure data directories and db.json exist
function initializeDB(): void {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

// Fetch all events from JSON database
export function readEvents(): EventData[] {
  initializeDB();
  try {
    const rawData = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(rawData);
  } catch (error) {
    console.error("Failed to load local events registry", error);
    return [];
  }
}

// Persist events array to JSON database
export function writeEvents(events: EventData[]): void {
  initializeDB();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(events, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to commit changes to local database", error);
  }
}

// Query single event by UID
export function getEventById(id: string): EventData | undefined {
  const events = readEvents();
  return events.find((e) => e.id === id);
}

// Create and store a new event record
export function createEvent(event: Omit<EventData, "createdAt" | "updatedAt">): EventData {
  const events = readEvents();
  const now = new Date().toISOString();
  const newEvent: EventData = {
    ...event,
    createdAt: now,
    updatedAt: now,
  };
  events.push(newEvent);
  writeEvents(events);
  return newEvent;
}

// Update details on an existing event record
export function updateEvent(
  id: string,
  updatedFields: Partial<Omit<EventData, "id" | "createdAt" | "updatedAt">>
): EventData | undefined {
  const events = readEvents();
  const idx = events.findIndex((e) => e.id === id);
  if (idx === -1) return undefined;

  const now = new Date().toISOString();
  const updatedEvent: EventData = {
    ...events[idx],
    ...updatedFields,
    updatedAt: now,
  };

  events[idx] = updatedEvent;
  writeEvents(events);
  return updatedEvent;
}

// Delete an event record
export function deleteEvent(id: string): boolean {
  const events = readEvents();
  const filtered = events.filter((e) => e.id !== id);
  if (filtered.length === events.length) return false;
  writeEvents(filtered);
  return true;
}
