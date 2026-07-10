import { Metadata } from "next";
import InvitationClientView from "@/components/InvitationClientView";
import { EventData } from "@/types";
import { supabase } from "@/lib/supabase";

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
  created_at: string;
  updated_at: string;
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

  return <InvitationClientView event={event} themeQuery={searchParams.theme} />;
}
