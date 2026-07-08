import { NextResponse } from "next/server";
import { readEvents, createEvent } from "@/lib/db";
import { generateEventId } from "@/utils/id";

export async function GET() {
  try {
    const events = await readEvents();
    // Sort events by creation timestamp descending
    const sorted = [...events].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json(sorted);
  } catch (error) {
    console.error("GET Events error:", error);
    return NextResponse.json({ error: "Failed to load events list" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Required validation rules (only destination is required)
    if (!body.address || body.latitude === undefined || body.longitude === undefined) {
      return NextResponse.json(
        { error: "Destination (address, latitude, and longitude) is required." },
        { status: 400 }
      );
    }

    const id = generateEventId();

    const newEvent = await createEvent({
      id,
      eventName: body.eventName?.trim() || undefined,
      hostName: body.hostName?.trim() || undefined,
      venueName: body.venueName?.trim() || undefined,
      address: body.address.trim(),
      latitude: parseFloat(body.latitude),
      longitude: parseFloat(body.longitude),
      date: body.date || undefined,
      startTime: body.startTime || undefined,
      endTime: body.endTime || undefined,
      description: body.description?.trim() || undefined,
      phone: body.phone?.trim() || undefined,
      coverImage: body.coverImage?.trim() || undefined,
      dressCode: body.dressCode?.trim() || undefined,
      parkingInfo: body.parkingInfo?.trim() || undefined,
      website: body.website?.trim() || undefined,
      email: body.email?.trim() || undefined,
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("POST Event error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
