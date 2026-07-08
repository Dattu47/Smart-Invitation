import { NextResponse } from "next/server";
import { getEventById, updateEvent, deleteEvent } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const event = await getEventById(id);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json(event);
  } catch (error) {
    console.error("GET Event ID error:", error);
    return NextResponse.json({ error: "Failed to retrieve event details" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Perform update
    const updated = await updateEvent(id, {
      eventName: body.eventName?.trim() || undefined,
      hostName: body.hostName?.trim() || undefined,
      venueName: body.venueName?.trim() || undefined,
      address: body.address?.trim() || undefined,
      latitude: body.latitude !== undefined ? parseFloat(body.latitude) : undefined,
      longitude: body.longitude !== undefined ? parseFloat(body.longitude) : undefined,
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

    if (!updated) {
      return NextResponse.json({ error: "Event not found or failed to update" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT Event error:", error);
    return NextResponse.json({ error: "Failed to update event details" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await deleteEvent(id);
    if (!deleted) {
      return NextResponse.json({ error: "Event not found to delete" }, { status: 404 });
    }
    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("DELETE Event error:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
