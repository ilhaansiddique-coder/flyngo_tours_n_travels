export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  roleId: string;
  tenantId: string;
  role?: Role;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  permissions?: RolePermission[];
}

export interface RolePermission {
  permission: Permission;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
}

export interface Tour {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  duration: number;
  maxGuests: number;
  destinationId: string;
  destination?: Destination;
  images?: Media[];
  itinerary?: ItineraryDay[];
}

export interface Hotel {
  id: string;
  name: string;
  slug: string;
  description: string;
  starRating: number;
  pricePerNight: number;
  destinationId: string;
  destination?: Destination;
  images?: Media[];
  rooms?: Room[];
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

export interface Booking {
  id: string;
  bookingCode: string;
  bookingType: 'tour' | 'hotel' | 'flight' | 'visa' | 'package';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  guests: number;
  totalAmount: number;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  method: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId: string;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  country: string;
  description: string;
  imageUrl?: string;
}

export interface Media {
  id: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface ItineraryDay {
  id: string;
  day: number;
  title: string;
  description: string;
  activities: string[];
}

export interface Room {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  amenities: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
