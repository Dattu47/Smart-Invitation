import { notFound } from "next/navigation";
import { getEventById } from "@/lib/db";
import InvitationClientView from "./InvitationClientView";

interface EventPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ theme?: string }>;
}

export default async function EventPage({ params, searchParams }: EventPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const themeQuery = resolvedSearchParams.theme || null;

  // Retrieve event details directly from filesystems on server side
  const event = getEventById(id);
  if (!event) {
    notFound();
  }

  return <InvitationClientView event={event} themeQuery={themeQuery} />;
}
