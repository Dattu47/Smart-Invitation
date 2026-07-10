export interface EventData {
  id: string; // unique Event ID like A8X9KP42
  eventName?: string;
  hostName?: string;
  venueName?: string;
  address: string; // Required
  latitude: number; // Required
  longitude: number; // Required
  date?: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  phone?: string;
  coverImage?: string;
  dressCode?: string;
  parkingInfo?: string;
  website?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
  compressedData?: string;
  isDisabled?: boolean;
  qrCodeUrl?: string;
  updatedFields?: string[];
}
export interface EventDetails {
  title: string;
  coupleNames: string;
  date: string;
  time: string;
  venueName: string;
  address: string;
  latitude: number;
  longitude: number;
  startDateTime: string; // ISO string with timezone or UTC
  endDateTime: string;   // ISO string with timezone or UTC
  description: string;
}
