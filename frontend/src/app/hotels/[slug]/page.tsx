'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { hotelImage } from '@/lib/entity-image';
import { Button } from '@/components/ui/button';
import { ShareMenu } from '@/components/shared/share-menu';
import { ReviewsSection } from '@/components/features/reviews/reviews-section';
import { HotelPhotosSlider } from '@/components/features/hotels/hotel-photos-slider';
import { getAmenityIcon } from '@/lib/amenity-icons';
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  Sparkles,
  BedDouble,
  Users,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  CreditCard,
  PhoneCall,
  ExternalLink,
  Heart,
  ChevronRight,
  Maximize2,
  BadgeCheck,
  ArrowRight,
  Coffee,
  Info,
} from 'lucide-react';

interface HotelImage {
  id: string;
  url: string;
  alt?: string | null;
}

interface HotelRoom {
  id: string;
  name: string;
  description?: string | null;
  pricePerNight: number | string;
  currency: string;
  capacity: number;
  available: number;
  amenities?: string[];
}

interface HotelDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  starRating: number;
  address?: string | null;
  pricePerNight: number | string;
  currency: string;
  amenities: string[];
  checkInTime?: string | null;
  checkOutTime?: string | null;
  coverImageUrl?: string | null;
  destination?: { id: string; name: string; country: string; slug: string } | null;
  additionalDestinations?: Array<{ destination?: { id?: string; name: string; country?: string } }>;
  images: HotelImage[];
  rooms?: HotelRoom[];
}

export default function HotelDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug;

  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reservation form state
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(tomorrowStr);
  const [guests, setGuests] = useState(2);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    api
      .get<HotelDetail>(`/hotels/${slug}`)
      .then((data) => {
        setHotel(data ?? null);
        if (data?.rooms && data.rooms.length > 0) {
          setSelectedRoomId(data.rooms[0].id);
        }
      })
      .catch((err: any) => setError(err?.message || 'Failed to load hotel'))
      .finally(() => setLoading(false));
  }, [slug]);

  // Calculate nights
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [checkIn, checkOut]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background pt-32 pb-20 px-4 sm:px-6 lg:px-16 max-w-[1300px] mx-auto">
        <div className="text-center py-24">
          <div className="inline-block w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-on-surface-variant font-medium">Loading hotel details…</p>
        </div>
      </main>
    );
  }

  if (error || !hotel) {
    return (
      <main className="min-h-screen bg-background pt-32 pb-20 px-4 sm:px-6 lg:px-16 max-w-[1300px] mx-auto">
        <Link href="/hotels" className="inline-flex items-center gap-2 text-sm mb-6 hover:underline text-accent">
          <ArrowLeft className="w-4 h-4" /> Back to hotels
        </Link>
        <div className="glass-deep rounded-2xl p-10 text-center border border-outline-variant/40">
          <h1 className="text-2xl font-display font-bold text-on-surface mb-2">Hotel not found</h1>
          <p className="text-on-surface-variant mb-6">
            {error || 'The hotel you are looking for does not exist or is no longer available.'}
          </p>
          <Button as="a" href="/hotels" variant="primary">
            Browse all hotels
          </Button>
        </div>
      </main>
    );
  }

  const coverPhoto = hotel.coverImageUrl || hotelImage(hotel, 1200, 700);

  // Other photos (rooms, interior, amenities, views) excluding the cover photo
  const otherPhotos = (hotel.images ?? [])
    .filter((img) => img.url && img.url !== hotel.coverImageUrl);

  // Combined photo list for full gallery lightbox view
  const allPhotos = [coverPhoto, ...otherPhotos.map((p) => p.url)];

  // Active selected room
  const activeRoom = hotel.rooms?.find((r) => r.id === selectedRoomId);
  const activePricePerNight = activeRoom ? Number(activeRoom.pricePerNight) : Number(hotel.pricePerNight);
  const subtotal = activePricePerNight * nights;
  const estimatedTax = Math.round(subtotal * 0.05);
  const totalCost = subtotal + estimatedTax;

  const destinationTitle = hotel.destination?.name || 'Destination';
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${hotel.name} ${hotel.address || ''} ${destinationTitle}`,
  )}`;

  const handleBookNow = () => {
    const q = new URLSearchParams({
      type: 'hotel',
      id: hotel.id,
      checkIn,
      checkOut,
      guests: String(guests),
    });
    if (selectedRoomId) q.set('roomId', selectedRoomId);
    router.push(`/booking?${q.toString()}`);
  };

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    const reservationSection = document.getElementById('reservation-card');
    if (reservationSection) {
      reservationSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <main className="min-h-screen bg-background pt-24 pb-24 px-4 sm:px-6 lg:px-16 max-w-[1300px] mx-auto">
      {/* Breadcrumb Navigation & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <nav className="flex items-center gap-1.5 text-xs text-on-surface-variant overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-on-surface transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-muted shrink-0" />
          <Link href="/hotels" className="hover:text-on-surface transition-colors">Hotels</Link>
          {hotel.destination && (
            <>
              <ChevronRight className="w-3 h-3 text-muted shrink-0" />
              <Link
                href={`/hotels?q=${encodeURIComponent(hotel.destination.name)}`}
                className="hover:text-on-surface transition-colors truncate max-w-[150px]"
              >
                {hotel.destination.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3 text-muted shrink-0" />
          <span className="text-on-surface font-medium truncate max-w-[200px]">{hotel.name}</span>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsSaved(!isSaved)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              isSaved
                ? 'border-red-400 bg-red-500/10 text-red-500'
                : 'border-outline-variant hover:bg-surface-container text-on-surface'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
            {isSaved ? 'Saved' : 'Save'}
          </button>
          <ShareMenu path={`/hotels/${slug}`} title={hotel.name} />
        </div>
      </div>

      {/* Hotel Title & Badges Bar */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/15 border border-amber-400/30 text-amber-600 dark:text-amber-400">
            <Star className="w-3.5 h-3.5 fill-current" />
            {hotel.starRating}-Star Hotel
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <BadgeCheck className="w-3.5 h-3.5" />
            Verified Stay
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            Best Rate Guaranteed
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-on-surface tracking-tight leading-tight">
          {hotel.name}
        </h1>

        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-on-surface-variant mt-2.5">
          {(hotel.address || hotel.destination) && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-accent hover:underline transition-colors"
            >
              <MapPin className="w-4 h-4 text-accent shrink-0" />
              <span>
                {[hotel.address, hotel.destination?.name, hotel.destination?.country !== hotel.destination?.name ? hotel.destination?.country : null].filter(Boolean).join(', ')}
              </span>
              <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
            </a>
          )}
          {hotel.checkInTime && (
            <span className="inline-flex items-center gap-1.5 text-muted">
              <Clock className="w-3.5 h-3.5 text-accent" /> Check-in: {hotel.checkInTime}
            </span>
          )}
          {hotel.checkOutTime && (
            <span className="inline-flex items-center gap-1.5 text-muted">
              <Clock className="w-3.5 h-3.5 text-accent" /> Check-out: {hotel.checkOutTime}
            </span>
          )}
        </div>
      </div>

      {/* World-Class Hero Photo Showcase (Bento Grid) */}
      <section className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 rounded-3xl overflow-hidden border border-outline-variant/40 p-2 sm:p-2.5 bg-surface-container-low shadow-sm">
          {/* Main Primary Cover Photo */}
          <div
            className={`relative overflow-hidden rounded-2xl cursor-pointer group ${
              otherPhotos.length >= 2 ? 'md:col-span-2 md:row-span-2 h-72 sm:h-96 md:h-[460px]' : 'md:col-span-4 h-80 sm:h-[420px]'
            }`}
            onClick={() => setLightboxIndex(0)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverPhoto}
              alt={hotel.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

            <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/65 backdrop-blur-md text-white border border-white/15 shadow-sm">
                Cover Photo
              </span>
            </div>

            <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-white text-xs font-medium">
              <span className="drop-shadow-md">Main Property View</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20">
                <Maximize2 className="w-3 h-3" /> Expand
              </span>
            </div>
          </div>

          {/* Adjacent Room & Property Photo Thumbnails */}
          {otherPhotos.slice(0, 4).map((photo, i) => {
            const isLast = i === 3 || i === otherPhotos.length - 1;
            const remainingCount = otherPhotos.length - 4;

            return (
              <div
                key={`${photo.url}-${i}`}
                className="relative h-44 sm:h-52 md:h-[222px] overflow-hidden rounded-2xl cursor-pointer group"
                onClick={() => setLightboxIndex(i + 1)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.alt || `${hotel.name} room photo ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />

                {/* If last thumbnail with extra photos, show overlay */}
                {isLast && remainingCount > 0 ? (
                  <div className="absolute inset-0 bg-black/60 hover:bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center text-white transition-all">
                    <BedDouble className="w-6 h-6 mb-1 text-accent" />
                    <span className="text-base sm:text-lg font-bold">+{remainingCount} more</span>
                    <span className="text-xs text-white/80 font-medium">View all photos</span>
                  </div>
                ) : (
                  <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="p-1.5 rounded-full bg-black/60 text-white inline-flex backdrop-blur-xs">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Content & Sticky Reservation Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 xl:gap-12">
        {/* Left Column: Details, Rooms, Amenities, Policies */}
        <div className="space-y-10">
          {/* Quick Perks Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-surface-container border border-outline-variant/30 text-center">
            <div className="flex flex-col items-center gap-1">
              <Clock className="w-5 h-5 text-accent" />
              <span className="text-xs font-semibold text-on-surface">Flexible Hours</span>
              <span className="text-[11px] text-on-surface-variant">Check-in from {hotel.checkInTime || '14:00'}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="text-xs font-semibold text-on-surface">Top Cleanliness</span>
              <span className="text-[11px] text-on-surface-variant">Daily sanitization</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <CheckCircle2 className="w-5 h-5 text-accent" />
              <span className="text-xs font-semibold text-on-surface">Instant Confirmation</span>
              <span className="text-[11px] text-on-surface-variant">Direct voucher issued</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <PhoneCall className="w-5 h-5 text-accent" />
              <span className="text-xs font-semibold text-on-surface">24/7 Support</span>
              <span className="text-[11px] text-on-surface-variant">Concierge assistance</span>
            </div>
          </div>

          {/* Bookable Rooms Section (World-Class Standard!) */}
          {hotel.rooms && hotel.rooms.length > 0 && (
            <section id="available-rooms" className="scroll-mt-32">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-accent/10 text-accent">
                    <BedDouble className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-on-surface">
                      Available Rooms &amp; Suites
                    </h2>
                    <p className="text-xs text-on-surface-variant">
                      Choose from {hotel.rooms.length} room {hotel.rooms.length === 1 ? 'type' : 'types'} tailored to your comfort
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {hotel.rooms.map((room) => {
                  const isSelected = selectedRoomId === room.id;
                  const roomPrice = Number(room.pricePerNight);

                  return (
                    <div
                      key={room.id}
                      className={`rounded-2xl border p-5 sm:p-6 transition-all duration-300 ${
                        isSelected
                          ? 'border-accent bg-accent/5 ring-2 ring-accent/30 shadow-md'
                          : 'border-outline-variant/60 bg-surface-container hover:border-accent/40 hover:bg-surface-container-high'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-display font-bold text-on-surface">
                              {room.name}
                            </h3>
                            {isSelected && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-accent text-on-accent">
                                Selected Room
                              </span>
                            )}
                          </div>

                          {room.description && (
                            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                              {room.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-high text-on-surface font-medium border border-outline-variant/40">
                              <Users className="w-3.5 h-3.5 text-accent" />
                              Up to {room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Free Cancellation
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                              <Coffee className="w-3.5 h-3.5" />
                              Breakfast Included
                            </span>
                          </div>

                          {room.amenities && room.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {room.amenities.map((a, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] px-2 py-0.5 rounded-full bg-surface text-on-surface-variant border border-outline-variant/50 capitalize"
                                >
                                  {a.replace(/_/g, ' ')}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-outline-variant/40 shrink-0 gap-3">
                          <div className="text-left md:text-right">
                            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted">
                              Nightly Rate
                            </div>
                            <div className="text-xl sm:text-2xl font-display font-extrabold text-accent">
                              {formatCurrency(roomPrice, room.currency || hotel.currency)}
                            </div>
                            <div className="text-[11px] text-muted">Includes taxes &amp; fees</div>
                          </div>

                          <Button
                            type="button"
                            variant={isSelected ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => handleSelectRoom(room.id)}
                            className="font-semibold shadow-xs"
                          >
                            {isSelected ? 'Room Selected' : 'Choose Room'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Interactive Room & Property Photos Slider (Auto & Manually Slidable) */}
          {otherPhotos.length > 0 && (
            <section className="scroll-mt-32">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-accent/10 text-accent">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-on-surface">
                      Room &amp; Property Gallery
                    </h2>
                    <p className="text-xs text-on-surface-variant">
                      Auto &amp; manually slidable tour of rooms, suites, amenities, and property grounds
                    </p>
                  </div>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent font-semibold">
                  {otherPhotos.length} {otherPhotos.length === 1 ? 'photo' : 'photos'}
                </span>
              </div>
              <HotelPhotosSlider images={otherPhotos} hotelName={hotel.name} />
            </section>
          )}

          {/* About this Hotel Section */}
          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container p-6 sm:p-8 space-y-4">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-on-surface">
              About {hotel.name}
            </h2>
            <div className="prose prose-sm dark:prose-invert max-w-none text-on-surface-variant leading-relaxed whitespace-pre-line text-sm sm:text-base">
              {hotel.description}
            </div>
          </section>

          {/* Categorized Amenities with World-Class Icons */}
          {hotel.amenities?.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-accent/10 text-accent">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-on-surface">
                    Hotel Amenities &amp; Services
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    Everything you need for an effortless, luxurious stay
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {hotel.amenities.map((amenity, i) => {
                  const IconComp = getAmenityIcon(amenity);
                  const cleanName = amenity.replace(/_/g, ' ');

                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-container border border-outline-variant/40 hover:border-accent/40 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-accent/10 text-accent shrink-0">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-on-surface capitalize truncate">
                        {cleanName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Hotel Policies & House Rules */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-on-surface">
              Hotel Policies &amp; House Rules
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant/40 space-y-2">
                <div className="flex items-center gap-2 text-accent font-semibold text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Check-in &amp; Check-out</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Check-in starts at <strong className="text-on-surface">{hotel.checkInTime || '14:00'}</strong>.
                  Check-out is expected by <strong className="text-on-surface">{hotel.checkOutTime || '12:00'}</strong>. Express check-in available upon request.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant/40 space-y-2">
                <div className="flex items-center gap-2 text-accent font-semibold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Cancellation &amp; Prepayment</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Free cancellation available up to 48 hours prior to arrival. Late cancellations may incur a 1-night fee depending on room policy.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant/40 space-y-2">
                <div className="flex items-center gap-2 text-accent font-semibold text-sm">
                  <Users className="w-4 h-4" />
                  <span>Children &amp; Extra Beds</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Children of all ages are welcome. Cribs and extra rollaway beds can be arranged directly with the front desk upon confirmation.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant/40 space-y-2">
                <div className="flex items-center gap-2 text-accent font-semibold text-sm">
                  <CreditCard className="w-4 h-4" />
                  <span>Accepted Payments</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  We accept bKash, Nagad, Visa, MasterCard, and American Express. Secure encrypted transactions guaranteed.
                </p>
              </div>
            </div>
          </section>

          {/* Location Map & Surrounding Details */}
          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-display font-bold text-on-surface">Location &amp; Neighborhood</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {hotel.address || hotel.destination?.name || 'Central location'}
                </p>
              </div>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-accent text-on-accent hover:opacity-90 transition-opacity shrink-0 shadow-xs"
              >
                <MapPin className="w-3.5 h-3.5" /> Open in Google Maps
              </a>
            </div>
          </section>
        </div>

        {/* Right Column: Sticky Interactive Reservation Card */}
        <aside className="lg:sticky lg:top-28 self-start space-y-4">
          <div
            id="reservation-card"
            className="rounded-3xl border border-outline-variant/60 bg-surface p-6 shadow-xl backdrop-blur-md space-y-5"
          >
            {/* Price Header */}
            <div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-muted">
                    {activeRoom ? activeRoom.name : 'Best Nightly Rate'}
                  </span>
                  <div className="text-3xl font-display font-extrabold text-accent">
                    {formatCurrency(activePricePerNight, activeRoom?.currency || hotel.currency)}
                  </div>
                </div>
                <span className="text-xs text-muted text-right">
                  per night · {nights} {nights === 1 ? 'night' : 'nights'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Special web member discount applied
              </p>
            </div>

            {/* Date Pickers */}
            <div className="p-3 rounded-2xl bg-surface-container border border-outline-variant/50 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-muted mb-1">Check-in</label>
                  <input
                    type="date"
                    value={checkIn}
                    min={todayStr}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full text-xs bg-surface border border-outline-variant rounded-lg p-2 font-medium outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-muted mb-1">Check-out</label>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn || todayStr}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full text-xs bg-surface border border-outline-variant rounded-lg p-2 font-medium outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Guests Selector */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-muted mb-1">Guests</label>
                <div className="flex items-center justify-between bg-surface border border-outline-variant rounded-lg p-2">
                  <span className="text-xs font-medium text-on-surface">
                    {guests} {guests === 1 ? 'Guest' : 'Guests'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={guests <= 1}
                      onClick={() => setGuests((g) => Math.max(1, g - 1))}
                      className="w-6 h-6 rounded bg-surface-container hover:bg-surface-container-high text-xs font-bold disabled:opacity-30 cursor-pointer"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      disabled={guests >= 8}
                      onClick={() => setGuests((g) => Math.min(8, g + 1))}
                      className="w-6 h-6 rounded bg-surface-container hover:bg-surface-container-high text-xs font-bold disabled:opacity-30 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Room selector if rooms exist */}
              {hotel.rooms && hotel.rooms.length > 0 && (
                <div>
                  <label className="block text-[10px] uppercase font-bold text-muted mb-1">Selected Room</label>
                  <select
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="w-full text-xs bg-surface border border-outline-variant rounded-lg p-2 font-medium outline-none focus:border-accent"
                  >
                    {hotel.rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} — {formatCurrency(Number(r.pricePerNight), r.currency || hotel.currency)}/night
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs text-on-surface-variant pt-1 border-t border-hairline">
              <div className="flex justify-between">
                <span>
                  {formatCurrency(activePricePerNight, hotel.currency)} × {nights} {nights === 1 ? 'night' : 'nights'}
                </span>
                <span className="font-semibold text-on-surface">
                  {formatCurrency(subtotal, hotel.currency)}
                </span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Estimated taxes &amp; fees (5%)</span>
                <span>{formatCurrency(estimatedTax, hotel.currency)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-on-surface pt-2 border-t border-hairline">
                <span>Total amount</span>
                <span className="text-accent text-base font-display">
                  {formatCurrency(totalCost, hotel.currency)}
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              type="button"
              size="lg"
              onClick={handleBookNow}
              className="w-full font-bold text-base shadow-lg shadow-accent/20 cursor-pointer gap-2"
            >
              Reserve Room <ArrowRight className="w-4 h-4" />
            </Button>

            <p className="text-[11px] text-center text-muted">
              You won&apos;t be charged yet. Instant confirmation.
            </p>

            {/* Trust Assurances */}
            <div className="pt-3 border-t border-hairline space-y-2 text-xs text-on-surface-variant">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Best Rate Guarantee — No hidden fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Free cancellation up to 48h prior</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-accent shrink-0" />
                <span>24/7 Dedicated Customer Concierge</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Guest Reviews Section */}
      <div className="mt-16">
        <ReviewsSection itemType="hotel" itemId={hotel.id} />
      </div>

      {/* Mobile Floating Bottom Bar for Instant Booking */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-outline-variant/60 p-3 sm:px-6 flex items-center justify-between shadow-2xl">
        <div>
          <div className="text-[10px] uppercase font-bold text-muted">Total for {nights} {nights === 1 ? 'night' : 'nights'}</div>
          <div className="text-lg font-display font-extrabold text-accent">
            {formatCurrency(totalCost, hotel.currency)}
          </div>
        </div>
        <Button
          type="button"
          size="md"
          onClick={handleBookNow}
          className="font-bold shadow-md cursor-pointer"
        >
          Reserve Now
        </Button>
      </div>

      {/* Full Screen Lightbox Modal when clicking any photo */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-6"
          onClick={() => setLightboxIndex(null)}
        >
          <div className="flex items-center justify-between text-white z-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <span className="font-display font-semibold text-lg">{hotel.name}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20">
                {lightboxIndex + 1} of {allPhotos.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div
            className="relative flex-1 flex items-center justify-center my-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={allPhotos[lightboxIndex]}
              alt={`${hotel.name} gallery`}
              className="max-h-full max-w-full object-contain rounded-xl shadow-2xl"
            />
          </div>

          {allPhotos.length > 1 && (
            <div
              className="flex justify-center gap-2 overflow-x-auto py-2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {allPhotos.map((url, idx) => (
                <button
                  key={`hero-lb-${url}-${idx}`}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className={`w-16 h-12 shrink-0 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                    idx === lightboxIndex ? 'border-accent ring-2 ring-accent/50 opacity-100 scale-105' : 'border-white/30 opacity-50 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
