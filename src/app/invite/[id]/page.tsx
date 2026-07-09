import { Metadata } from "next";
import InvitationClientView from "@/components/InvitationClientView";
import { EventData } from "@/types";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface InvitePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ theme?: string }>;
}

export async function generateMetadata(
  props: InvitePageProps
): Promise<Metadata> {
  const params = await props.params;
  const id = params.id;
  
  try {
    const docRef = doc(db, "events", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const event = docSnap.data() as EventData;
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
    const docRef = doc(db, "events", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      event = { id: docSnap.id, ...docSnap.data() } as EventData;
    }
  } catch (err) {
    console.error("Failed to fetch event data from Firestore", err);
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
