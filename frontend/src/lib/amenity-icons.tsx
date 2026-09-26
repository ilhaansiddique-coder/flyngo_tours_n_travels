import React from 'react';
import {
  Wifi,
  Wind,
  Car,
  Utensils,
  Sparkles,
  Dumbbell,
  Coffee,
  Tv,
  Briefcase,
  Plane,
  Bath,
  ShieldCheck,
  Check,
  Wine,
  Waves,
  HeartHandshake,
  Clock,
  Sparkle,
} from 'lucide-react';

export function getAmenityIcon(amenityName: string): React.ComponentType<{ className?: string }> {
  const norm = amenityName.toLowerCase().replace(/[^a-z0-9]/g, ' ');

  if (norm.includes('wifi') || norm.includes('internet')) return Wifi;
  if (norm.includes('pool') || norm.includes('swim') || norm.includes('beach')) return Waves;
  if (norm.includes('air') || norm.includes('ac') || norm.includes('cooling') || norm.includes('climate')) return Wind;
  if (norm.includes('park') || norm.includes('garage') || norm.includes('valet')) return Car;
  if (norm.includes('breakfast') || norm.includes('coffee') || norm.includes('tea')) return Coffee;
  if (norm.includes('food') || norm.includes('restaurant') || norm.includes('dining') || norm.includes('meal')) return Utensils;
  if (norm.includes('bar') || norm.includes('lounge') || norm.includes('cocktail') || norm.includes('drink')) return Wine;
  if (norm.includes('gym') || norm.includes('fitness') || norm.includes('workout')) return Dumbbell;
  if (norm.includes('spa') || norm.includes('sauna') || norm.includes('massage') || norm.includes('wellness')) return Sparkles;
  if (norm.includes('tv') || norm.includes('television') || norm.includes('cable')) return Tv;
  if (norm.includes('desk') || norm.includes('work') || norm.includes('business')) return Briefcase;
  if (norm.includes('shuttle') || norm.includes('airport') || norm.includes('transfer')) return Plane;
  if (norm.includes('bath') || norm.includes('shower') || norm.includes('tub') || norm.includes('jacuzzi')) return Bath;
  if (norm.includes('safe') || norm.includes('security')) return ShieldCheck;
  if (norm.includes('concierge') || norm.includes('service') || norm.includes('desk')) return HeartHandshake;
  if (norm.includes('24') || norm.includes('hour')) return Clock;

  return Check;
}
