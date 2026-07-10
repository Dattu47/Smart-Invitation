import { Metadata } from "next";
import InvitationClientView from "@/components/InvitationClientView";
import { EventData } from "@/types";
import { supabase } from "@/lib/supabase";
import { CalendarOff } from "lucide-react";

interface InvitePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ theme?: string }>;
}

interface SupabaseEventRow {
  id: string;
  event_name?: string | null;
  host_name?: string | null;
  venue_name?: string | null;
  address: string;
  latitude: number;
  longitude: number;
  date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  dress_code?: string | null;
  parking_info?: string | null;
  cover_image?: string | null;
  is_disabled?: boolean | null;
  qr_code_url?: string | null;
  created_at: string;
  updated_at: string;
}

function isEventExpired(dateStr?: string): boolean {
  if (!dateStr) return false;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventDate = new Date(dateStr);
    eventDate.setHours(0, 0, 0, 0);

    // Next date of event (expires day after event)
    const expiryDate = new Date(eventDate);
    expiryDate.setDate(expiryDate.getDate() + 1);

    return today > expiryDate;
  } catch (e) {
    console.error("Error checking event expiration:", e);
    return false;
  }
}

function mapSupabaseToEventData(data: SupabaseEventRow): EventData {
  return {
    id: data.id,
    eventName: data.event_name || undefined,
    hostName: data.host_name || undefined,
    venueName: data.venue_name || undefined,
    address: data.address,
    latitude: data.latitude,
    longitude: data.longitude,
    date: data.date || undefined,
    startTime: data.start_time || undefined,
    endTime: data.end_time || undefined,
    description: data.description || undefined,
    phone: data.phone || undefined,
    email: data.email || undefined,
    website: data.website || undefined,
    dressCode: data.dress_code || undefined,
    parkingInfo: data.parking_info || undefined,
    coverImage: data.cover_image || undefined,
    isDisabled: data.is_disabled || false,
    qrCodeUrl: data.qr_code_url || undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function generateMetadata(
  props: InvitePageProps
): Promise<Metadata> {
  const params = await props.params;
  const id = params.id;
  
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();
      
    if (data && !error) {
      const event = mapSupabaseToEventData(data);
      return {
        title: event.eventName || "Event Invitation",
        description: `You're invited to ${event.venueName || "an event"}. Click to view details.`,
      };
    }
  } catch (err) {
    console.error(err);
  }
  
  return { title: "Event Invitation" };
}

export default async function InvitePage(props: InvitePageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const id = params.id;

  let event: EventData | null = null;
  
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();
      
    if (data && !error) {
      event = mapSupabaseToEventData(data);
    } else if (error) {
      console.error("Failed to fetch event data from Supabase:", error.message);
    }
  } catch (err) {
    console.error("Failed to fetch event data from Supabase", err);
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#0e051d] text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-400 mb-2">Invalid Invitation Link</h1>
        <p className="text-gray-400">The invitation URL appears to be broken or the event was deleted.</p>
      </div>
    );
  }

  // Check if manually disabled by the organizer
  if (event.isDisabled) {
    return (
      <div className="min-h-screen bg-[#0e051d] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute top-[-10%] left-[-15%] w-[70%] aspect-square rounded-full bg-gradient-to-br from-[#2a1b4e] to-[#4c2d82] opacity-30 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-15%] w-[70%] aspect-square rounded-full bg-gradient-to-br from-[#4c2d82] to-[#ec4899] opacity-15 blur-[120px] pointer-events-none" />
        
        <div className="relative max-w-md w-full bg-[#150a26]/40 border border-white/5 rounded-3xl p-8 backdrop-blur-md shadow-2xl text-center select-none">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <CalendarOff className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-gold-gradient mb-3">Invitation Deactivated</h1>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            This invitation and QR code have been manually deactivated by the event organizer.
          </p>
          <div className="h-px bg-white/5 w-full mb-6" />
          <p className="text-xs text-gray-500 font-mono">ID: {event.id}</p>
        </div>
      </div>
    );
  }

  // Deactivate QR Code / Expire the invitation if date is in the past
  if (isEventExpired(event.date)) {
    const formattedDate = event.date
      ? new Date(event.date).toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "";

    return (
      <div className="min-h-screen bg-[#0e051d] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute top-[-10%] left-[-15%] w-[70%] aspect-square rounded-full bg-gradient-to-br from-[#2a1b4e] to-[#4c2d82] opacity-30 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-15%] w-[70%] aspect-square rounded-full bg-gradient-to-br from-[#4c2d82] to-[#ec4899] opacity-15 blur-[120px] pointer-events-none" />
        
        <div className="relative max-w-md w-full bg-[#150a26]/40 border border-white/5 rounded-3xl p-8 backdrop-blur-md shadow-2xl text-center select-none">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <CalendarOff className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-gold-gradient mb-3">Invitation Expired</h1>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            This invitation and QR code have been deactivated because the event date {formattedDate ? `(${formattedDate})` : ""} has already passed.
          </p>
          <div className="h-px bg-white/5 w-full mb-6" />
          <p className="text-xs text-gray-500 font-mono">ID: {event.id}</p>
        </div>
      </div>
    );
  }

  return <InvitationClientView event={event} themeQuery={searchParams.theme} />;
}
