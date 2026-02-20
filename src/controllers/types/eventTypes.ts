// Your interfaces
export interface ItineraryItem {
  time?: string;
  activity?: string;
  description?: string;
}

export interface EventGuide {
  whatToWear?: string[];
  whatToCarry?: string[];
  preparationTips?: string[];
}

export interface EventRow {
  id: string;
  title: string;
  description: string;
  event_datetime: string;
  location: string;
  distance: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  max_participants: number;
  image_url: string | null;
  price: number;
  itinerary: ItineraryItem[] | null;
  guide: EventGuide | null;
  created_at: Date;
  updated_at: Date;
}

export interface EventRowWithParticipants extends EventRow {
  current_participants: string;
  spots_remaining: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  eventDateTime: string;
  location: string;
  distance: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  maxParticipants: number;
  imageUrl: string;
  price: number;
  itinerary: ItineraryItem[];
  guide: EventGuide;
}

export interface EventDetails extends Event {
  currentParticipants: number;
  spotsRemaining: number;
  createdAt: Date;
  updatedAt: Date;
}

// Form data (what users can edit - no id, timestamps, or computed fields)
export interface EventFormData {
  title: string;
  description: string;
  event_datetime: string;
  location: string;
  distance: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  maxParticipants: number;
  imageUrl: string;
  price: number;
  itinerary: ItineraryItem[];
  guide: EventGuide;
}

// What to send when creating an event
export type CreateEventPayload = EventFormData;

// What to send when updating an event
export type UpdateEventPayload = Partial<EventFormData>;

// For getAllEvents (basic conversion)
export const eventRowToEvent = (row: EventRow): Event => ({
  id: row.id,
  title: row.title,
  description: row.description,
  eventDateTime: row.event_datetime,
  location: row.location,
  distance: row.distance,
  difficulty: row.difficulty,
  imageUrl: row.image_url || "",
  maxParticipants: row.max_participants,
  price: row.price,
  itinerary: row.itinerary || [],
  guide: row.guide || {
    whatToWear: [],
    whatToCarry: [],
    preparationTips: [],
  },
});

// For getEventById (includes participation data)
export const eventRowToEventDetails = (
  row: EventRowWithParticipants,
): EventDetails => ({
  id: row.id,
  title: row.title,
  description: row.description,
  eventDateTime: row.event_datetime,
  location: row.location,
  distance: row.distance,
  difficulty: row.difficulty,
  imageUrl: row.image_url || "",
  maxParticipants: row.max_participants,
  currentParticipants: Number(row.current_participants),
  spotsRemaining: Number(row.spots_remaining),
  price: row.price,
  itinerary: row.itinerary || [],
  guide: row.guide || {
    whatToWear: [],
    whatToCarry: [],
    preparationTips: [],
  },
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});
