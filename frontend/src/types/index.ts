export interface Tour {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  duration: number;
  maxGuests: number;
  destinationId: string;
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
