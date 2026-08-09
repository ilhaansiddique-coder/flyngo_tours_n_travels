export type PackageCategory = 'tour' | 'visa' | 'hajj' | 'umrah' | 'custom';

export interface Package {
  id: string;
  category: PackageCategory;
  title: string;
  titleBn: string;
  destination: string;
  durationDays: number;
  priceUsd: number;
  badge?: string;
  badgeBn?: string;
  image: string;
  highlights: string[];
  highlightsBn: string[];
  href: string;
  accent?: 'blue' | 'amber' | 'emerald' | 'rose';
}

export const POPULAR_PACKAGES: Package[] = [
  {
    id: 'pkg-santorini-luxury',
    category: 'tour',
    title: 'Santorini Sky Loft',
    titleBn: 'সান্তোরিনি স্কাই লফট',
    destination: 'Santorini, Greece',
    durationDays: 6,
    priceUsd: 2400,
    badge: 'Seasonal Feature',
    badgeBn: 'সিজনাল ফিচার',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCf5QzdFaYkZ_qkiyWWRq-WCpLwdY3Yx_zBdrsh3Ung7SxjFOTDIrHQw4bB0hMfJtFfq-oSxIWfjUWCiyEaYfmzERYqDlrVZPm0OPD2Npb_Agn6Bt2BdAVJl_2gpyRrkbLG9ElZrSLK4B2fkZpzzfN0zUaMIvs8ig7pNifGwbLOKTU2SZH3hcsntX5TXx79EzeifHcLX0xcOptF4yVDe3FZPbm_zgbWEqSqZOgV8JYAPzWwEr1TsUVKmw',
    highlights: ['Private cliffside villa', 'Sunset yacht cruise', 'Wine tasting tour'],
    highlightsBn: ['প্রাইভেট ক্লিফসাইড ভিলা', 'সানসেট ইয়ট ক্রুজ', 'ওয়াইন টেস্টিং ট্যুর'],
    href: '/tours/santorini-sky-loft',
    accent: 'blue',
  },
  {
    id: 'pkg-bali-paradise',
    category: 'tour',
    title: 'Bali Paradise Escape',
    titleBn: 'বালি প্যারাডাইস এস্কেপ',
    destination: 'Bali, Indonesia',
    durationDays: 7,
    priceUsd: 1380,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80',
    highlights: ['Beachfront resort', 'Temple & rice terrace tour', 'Spa & wellness day'],
    highlightsBn: ['বিচফ্রন্ট রিসোর্ট', 'মন্দির ও ধান টেরেস ট্যুর', 'স্পা ও ওয়েলনেস ডে'],
    href: '/tours/bali-paradise',
    accent: 'emerald',
  },
  {
    id: 'pkg-dubai-visa-bundle',
    category: 'visa',
    title: 'Dubai 30-Day Tourist Visa',
    titleBn: 'দুবাই ৩০ দিনের ট্যুরিস্ট ভিসা',
    destination: 'United Arab Emirates',
    durationDays: 30,
    priceUsd: 220,
    badge: 'Most Booked',
    badgeBn: 'সবচেয়ে বেশি বুকড',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80',
    highlights: ['30-day single entry', 'Express processing 3-5 days', 'Document review included'],
    highlightsBn: ['৩০ দিন একক প্রবেশ', 'এক্সপ্রেস প্রসেসিং ৩-৫ দিন', 'ডকুমেন্ট রিভিউ অন্তর্ভুক্ত'],
    href: '/visa/dubai-tourist',
    accent: 'amber',
  },
  {
    id: 'pkg-schengen-visa',
    category: 'visa',
    title: 'Schengen Visa Processing',
    titleBn: 'শেনজেন ভিসা প্রসেসিং',
    destination: '26 European Countries',
    durationDays: 90,
    priceUsd: 380,
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80',
    highlights: ['Appointment booking', 'Itinerary & cover letter', 'Insurance coordination'],
    highlightsBn: ['অ্যাপয়েন্টমেন্ট বুকিং', 'ইটিনারারি ও কভার লেটার', 'ইন্সুরেন্স সমন্বয়'],
    href: '/visa/schengen',
    accent: 'blue',
  },
  {
    id: 'pkg-hajj-premium',
    category: 'hajj',
    title: 'Hajj Premium Package 2026',
    titleBn: 'হজ্জ প্রিমিয়াম প্যাকেজ ২০২৬',
    destination: 'Makkah & Madinah',
    durationDays: 21,
    priceUsd: 6800,
    badge: 'Limited Seats',
    badgeBn: 'সীমিত আসন',
    image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&q=80',
    highlights: ['5-star hotel near Haram', 'Visa & processing', 'Guided Ziyarat & transport'],
    highlightsBn: ['হারামের কাছে ৫-স্টার হোটেল', 'ভিসা ও প্রসেসিং', 'গাইডেড জিয়ারত ও পরিবহন'],
    href: '/hajj/premium',
    accent: 'amber',
  },
  {
    id: 'pkg-umrah-economy',
    category: 'umrah',
    title: 'Umrah Economy Saver',
    titleBn: 'ওমরাহ ইকোনমি সেভার',
    destination: 'Makkah & Madinah',
    durationDays: 10,
    priceUsd: 1850,
    image: 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?w=1200&q=80',
    highlights: ['Visa + flights + hotel', 'Airport transfers', 'Ziyarat of historical sites'],
    highlightsBn: ['ভিসা + ফ্লাইট + হোটেল', 'এয়ারপোর্ট ট্রান্সফার', 'ঐতিহাসিক স্থানের জিয়ারত'],
    href: '/hajj/umrah-economy',
    accent: 'emerald',
  },
];
