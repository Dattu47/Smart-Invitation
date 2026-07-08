import { Metadata, ResolvingMetadata } from "next";
import LZString from "lz-string";
import InvitationClientView from "@/components/InvitationClientView";
import { EventData } from "@/types";

interface InvitePageProps {
  searchParams: Promise<{ d?: string; theme?: string }>;
}

export async function generateMetadata(
  props: InvitePageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const compressedData = searchParams.d;
  if (!compressedData) {
    return { title: "Invitation Not Found" };
  }

  try {
    const jsonString = LZString.decompressFromEncodedURIComponent(compressedData);
    if (!jsonString) throw new Error("Decompression failed");
    
    const event = JSON.parse(jsonString) as EventData;
    return {
      title: event.eventName || "Event Invitation",
      description: `You're invited to ${event.venueName || "an event"}. Click to view details.`,
    };
  } catch (error) {
    return { title: "Event Invitation" };
  }
}

export default async function InvitePage(props: InvitePageProps) {
  const searchParams = await props.searchParams;
  const compressedData = searchParams.d;

  if (!compressedData) {
    return (
      <div className="min-h-screen bg-[#0e051d] text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-400 mb-2">Invalid Invitation Link</h1>
        <p className="text-gray-400">The invitation URL appears to be broken or empty.</p>
      </div>
    );
  }

  let event: EventData | null = null;
  try {
    const jsonString = LZString.decompressFromEncodedURIComponent(compressedData);
    if (jsonString) {
      event = JSON.parse(jsonString);
    }
  } catch (err) {
    console.error("Failed to parse event data from URL", err);
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#0e051d] text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-400 mb-2">Corrupted Invitation Data</h1>
        <p className="text-gray-400">We could not read the event details from this link.</p>
      </div>
    );
  }

  return <InvitationClientView event={event} themeQuery={searchParams.theme} />;
}
