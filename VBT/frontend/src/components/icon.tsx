import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Building,
  Droplets,
  Facebook,
  Gift,
  GraduationCap,
  HandHeart,
  Heart,
  HeartHandshake,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  Mic2,
  Phone,
  Ruler,
  ShieldCheck,
  Shirt,
  Sprout,
  Truck,
  Twitter,
  Users,
  Utensils,
  Video,
  Wine,
  X,
  Youtube,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  'arrow-right': ArrowRight,
  'book-open': BookOpen,
  briefcase: Briefcase,
  building: Building,
  droplets: Droplets,
  facebook: Facebook,
  gift: Gift,
  graduation: GraduationCap,
  'hand-heart': HandHeart,
  heart: Heart,
  'heart-handshake': HeartHandshake,
  linkedin: Linkedin,
  mail: Mail,
  'map-pin': MapPin,
  menu: Menu,
  mosque: Building,
  phone: Phone,
  ruler: Ruler,
  'shield-check': ShieldCheck,
  shirt: Shirt,
  sprout: Sprout,
  truck: Truck,
  twitter: Twitter,
  users: Users,
  utensils: Utensils,
  video: Video,
  'wine': Wine,
  x: X,
  youtube: Youtube,
  'mic-2': Mic2,
};

export function Icon({
  name,
  className,
  size,
  strokeWidth = 1.8,
}: {
  name?: string | null;
  className?: string;
  size?: number;
  strokeWidth?: number;
}) {
  const Cmp = (name && iconMap[name]) || Heart;
  return <Cmp className={className} size={size} strokeWidth={strokeWidth} />;
}