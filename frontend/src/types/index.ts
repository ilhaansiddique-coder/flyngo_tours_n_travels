export interface Tour {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number | null;
  duration: number;
  maxGuests: number;
  destinationId: string;
  coverImageUrl?: string | null;
  imageUrl?: string | null;
  images?: Array<{ id?: string; url: string; alt?: string | null }>;
  destination?: { id?: string; name: string; country: string; slug?: string } | null;
  additionalDestinations?: Array<{ destination?: { id?: string; name: string; country?: string } }>;
  highlights?: string[];
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: Array<{ id: string; day: number; title: string; description: string; activities: string[] }>;
}

export interface Hotel {
  id: string;
  name: string;
  slug: string;
  description: string;
  starRating: number;
  pricePerNight: number;
  destinationId: string;
}

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  originCode: string;
  destinationCode: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  country: string;
  continent?: string;
  description?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  isFeatured?: boolean;
}
