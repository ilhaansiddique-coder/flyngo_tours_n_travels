import { Section, Container } from '@/components/ui/section';
import { FlightCard } from '@/components/features/flights/flight-card';

const flights = [
  { id: '1', airline: 'Emirates', flightNumber: 'EK501', originCode: 'JFK', originCity: 'New York', destinationCode: 'DXB', destinationCity: 'Dubai', departureTime: '2026-08-01T22:00:00', arrivalTime: '2026-08-02T18:00:00', duration: 720, price: 899, availableSeats: 12 },
  { id: '2', airline: 'Qatar Airways', flightNumber: 'QR702', originCode: 'LHR', originCity: 'London', destinationCode: 'BKK', destinationCity: 'Bangkok', departureTime: '2026-08-15T09:00:00', arrivalTime: '2026-08-16T03:00:00', duration: 660, price: 749, availableSeats: 8 },
  { id: '3', airline: 'Singapore Airlines', flightNumber: 'SQ424', originCode: 'SFO', originCity: 'San Francisco', destinationCode: 'SIN', destinationCity: 'Singapore', departureTime: '2026-09-01T01:00:00', arrivalTime: '2026-09-02T08:00:00', duration: 1020, price: 1099, availableSeats: 5 },
  { id: '4', airline: 'Japan Airlines', flightNumber: 'JL5', originCode: 'LAX', originCity: 'Los Angeles', destinationCode: 'NRT', destinationCity: 'Tokyo', departureTime: '2026-08-20T11:00:00', arrivalTime: '2026-08-21T14:00:00', duration: 660, price: 849, availableSeats: 15 },
  { id: '5', airline: 'Turkish Airlines', flightNumber: 'TK81', originCode: 'JFK', originCity: 'New York', destinationCode: 'IST', destinationCity: 'Istanbul', departureTime: '2026-08-10T18:00:00', arrivalTime: '2026-08-11T11:00:00', duration: 600, price: 679, availableSeats: 20 },
];

export default function FlightsPage() {
  return (
    <>
      <Section background="brand" className="pt-32 pb-24">
        <Container>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white text-center">Find & Book Flights</h1>
          <p className="mt-4 text-lg text-brand-100 text-center max-w-2xl mx-auto">
            Search hundreds of airlines for the best deals worldwide
          </p>
        </Container>
      </Section>
      <Section background="white">
        <Container>
          <div className="space-y-4">
            {flights.map((flight) => (
              <FlightCard key={flight.id} {...flight} />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
