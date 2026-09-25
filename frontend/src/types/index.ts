export interface Tour {
  id: string;
  title: string;
  titleBn?: string;
  slug: string;
  description: string;
  descriptionBn?: string;
  /** Serialised from Prisma Decimal — coerce with Number() before arithmetic */
  price: number | string;
  salePrice?: number | string | null;
  currency?: string;
  duration: number;
  maxGuests: number;
  difficulty?: string | null;
  tourType?: string | null;
  startLocation?: string | null;
  endLocation?: string | null;
  destinationId: string;
  coverImageUrl?: string | null;
  imageUrl?: string | null;
  images?: Array<{ id?: string; url: string; alt?: string | null }>;
  destination?: { id?: string; name: string; country: string; slug?: string } | null;
  additionalDestinations?: Array<{ destination?: { id?: string; name: string; country?: string } }>;
  highlights?: string[];
  highlightsBn?: string[];
  inclusions?: string[];
  inclusionsBn?: string[];
  exclusions?: string[];
  requirements?: string[];
  requirementsBn?: string[];
  itinerary?: Array<{ id: string; day: number; title: string; description: string; activities: string[] }>;
  isActive?: boolean;
  isFeatured?: boolean;
  pointsAwarded?: number;
}

export interface Hotel {
  id: string;
  name: string;
  slug: string;
  description: string;
  starRating: number;
  /** Serialised from Prisma Decimal — coerce with Number() before arithmetic */
  pricePerNight: number | string;
  currency?: string;
  destinationId: string;
  destination?: { id?: string; name: string; country: string; slug?: string } | null;
  additionalDestinations?: Array<{ destination?: { id?: string; name: string; country?: string } }>;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  amenities?: string[];
  checkInTime?: string | null;
  checkOutTime?: string | null;
  coverImageUrl?: string | null;
  imageUrl?: string | null;
  images?: Array<{ id?: string; url: string; alt?: string | null }>;
  rooms?: Array<{
    id: string;
    name: string;
    description?: string | null;
    /** Serialised from Prisma Decimal — coerce with Number() before arithmetic */
    pricePerNight: number | string;
    currency?: string;
    capacity: number;
    available?: number;
    amenities?: string[];
  }>;
  isActive?: boolean;
  pointsAwarded?: number;
}

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  originCode: string;
  originCity?: string | null;
  destinationCode: string;
  destinationCity?: string | null;
  departureTime: string;
  arrivalTime: string;
  duration?: number | null;
  /** Serialised from Prisma Decimal — coerce with Number() before arithmetic */
  price: number | string;
  currency?: string;
  availableSeats: number;
  cabinClass?: string | null;
  coverImageUrl?: string | null;
  isActive?: boolean;
  pointsAwarded?: number;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  country: string;
  continent?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  flagUrl?: string | null;
  coverImageUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isFeatured?: boolean;
}
