import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export type AboutSectionType =
  | 'STORY'
  | 'VISION'
  | 'MISSION'
  | 'SERVICE'
  | 'SERVICES'
  | 'VALUES'
  | 'STATS'
  | 'ACHIEVEMENTS'
  | 'TEAM'
  | 'TRIPS'
  | 'STRATEGIES'
  | 'CONTACT'
  | 'CUSTOM';

export interface AboutPageMetaInput {
  heroEyebrowEn?: string;
  heroEyebrowBn?: string;
  heroTitleEn?: string;
  heroTitleBn?: string;
  heroSubtitleEn?: string;
  heroSubtitleBn?: string;
  heroImageUrl?: string;
  ctaLabelEn?: string;
  ctaLabelBn?: string;
  ctaHref?: string;
  officeAddress?: string;
  officePhone?: string;
  officeEmail?: string;
  sloganEn?: string;
  sloganBn?: string;
  isActive?: boolean;
}

export interface AboutPageSectionInput {
  type: AboutSectionType;
  order?: number;
  titleEn?: string;
  titleBn?: string;
  subtitleEn?: string;
  subtitleBn?: string;
  bodyEn?: string;
  bodyBn?: string;
  payload?: any;
  isActive?: boolean;
}

export interface CeoMessageInput {
  name: string;
  title: string;
  imageUrl?: string;
  bodyEn: string;
  bodyBn?: string;
  signatureEn?: string;
  signatureBn?: string;
  isActive?: boolean;
}

const DEFAULT_META: AboutPageMetaInput = {
  heroEyebrowEn: 'Our Story',
  heroEyebrowBn: 'আমাদের গল্প',
  heroTitleEn: 'About FlynGo',
  heroTitleBn: 'FlynGo সম্পর্কে',
  heroSubtitleEn:
    'FlynGo is a full-service travel platform from Bangladesh — tours, visas, Hajj & Umrah, hotels, flights, and worldwide concierge, all under one roof.',
  heroSubtitleBn:
    'FlynGo বাংলাদেশের একটি পূর্ণ-সেবা ভ্রমণ প্ল্যাটফর্ম — ট্যুর, ভিসা, হজ্জ ও ওমরাহ, হোটেল, ফ্লাইট এবং বিশ্বজুড়ে কনসিয়ার্জ সেবা, সব এক ছাদের নিচে।',
  sloganEn: 'travel · enjoy · save',
  sloganBn: 'ভ্রমণ · উপভোগ · সাশ্রয়',
  officeAddress: 'HM Plaza (11th Floor), Rajlaxmi, Uttara, Dhaka',
  officePhone: '01322913530',
  officeEmail: 'visaflyngo@gmail.com',
  isActive: true,
};

const DEFAULT_SECTIONS: AboutPageSectionInput[] = [
  {
    type: 'STORY',
    order: 0,
    titleEn: 'Our Story',
    titleBn: 'আমাদের গল্প',
    bodyEn:
      'FlynGo is a full-service outbound travel platform from Bangladesh, dedicated to making world exploration accessible, seamless, and unforgettable for every traveler. The team behind FlynGo is built from 100% tourism professionals with deep knowledge of destinations and services across the globe.\n\nWhether you are planning a solo adventure, a family vacation, or a corporate retreat, we provide end-to-end solutions for tours, hotels, flights, visa processing, and pilgrimage journeys. Every department under FlynGo works independently and in sync to deliver the best service to our customers and clients — building long-lasting friendships along the way.\n\nOur contracts and alliances with hotels, tourist organizations, and partners across most countries help us deliver consistently high-quality service, no matter where your journey takes you.',
    bodyBn:
      'FlynGo বাংলাদেশের একটি পূর্ণ-সেবা আউটবাউন্ড ট্রাভেল প্ল্যাটফর্ম, যা প্রতিটি ভ্রমণকারীর জন্য বিশ্ব অন্বেষণকে সহজলভ্য, নির্বিঘ্ন এবং অবিস্মরণীয় করতে প্রতিশ্রুতিবদ্ধ। FlynGo-এর পেছনের দল সম্পূর্ণ ট্যুরিজম পেশাদারদের নিয়ে গঠিত, যাদের বিশ্বজুড়ে গন্তব্য ও পরিষেবা সম্পর্কে গভীর জ্ঞান রয়েছে।\n\nআপনি একক অভিযাত্রা, পারিবারিক ছুটি বা কর্পোরেট রিট্রিট পরিকল্পনা করুন না কেন, আমরা ট্যুর, হোটেল, ফ্লাইট, ভিসা প্রক্রিয়াকরণ এবং তীর্থযাত্রার জন্য সম্পূর্ণ সমাধান প্রদান করি। FlynGo-এর প্রতিটি বিভাগ স্বতন্ত্রভাবে এবং সমন্বিতভাবে আমাদের গ্রাহকদের সেরা পরিষেবা দিতে কাজ করে — পথে দীর্ঘস্থায়ী বন্ধন তৈরি করে।',
  },
  {
    type: 'ACHIEVEMENTS',
    order: 1,
    titleEn: 'Our Achievements',
    titleBn: 'আমাদের অর্জন',
    payload: {
      items: [
        { icon: 'Award', titleEn: 'Government Certified', titleBn: 'সরকার অনুমোদিত', descriptionEn: 'Recognized travel agency — fully licensed and regulated.', descriptionBn: 'স্বীকৃত ট্রাভেল এজেন্সি — সম্পূর্ণ লাইসেন্সপ্রাপ্ত ও নিয়ন্ত্রিত।' },
        { icon: 'BadgeCheck', titleEn: 'IATA Accredited', titleBn: 'IATA স্বীকৃত', descriptionEn: 'International accreditation for airline ticketing.', descriptionBn: 'এয়ারলাইন টিকিটিং-এ আন্তর্জাতিক স্বীকৃতি।' },
        { icon: 'ShieldCheck', titleEn: 'Trusted Network', titleBn: 'বিশ্বস্ত নেটওয়ার্ক', descriptionEn: 'Member of leading national and international travel associations.', descriptionBn: 'শীর্ষস্থানীয় জাতীয় ও আন্তর্জাতিক ভ্রমণ সংস্থার সদস্য।' },
        { icon: 'CreditCard', titleEn: 'Secure Payments', titleBn: 'নিরাপদ পেমেন্ট', descriptionEn: 'Accept all major credit cards with encrypted processing.', descriptionBn: 'এনক্রিপ্টেড প্রসেসিং সহ সকল প্রধান ক্রেডিট কার্ড গ্রহণযোগ্য।' },
      ],
    },
  },
  {
    type: 'VISION',
    order: 2,
    titleEn: 'Vision',
    titleBn: 'আমাদের দৃষ্টি',
    bodyEn:
      'To dominate the tourism industry through excellence in service, innovative concepts, and creative experiences — helping every traveler discover more of the world, on their own terms.',
    bodyBn:
      'পরিষেবার উৎকর্ষ, উদ্ভাবনী ধারণা এবং সৃজনশীল অভিজ্ঞতার মাধ্যমে পর্যটন শিল্পে নেতৃত্ব দেওয়া — যাতে প্রতিটি ভ্রমণকারী নিজের ইচ্ছামতো বিশ্বকে আরও বেশি আবিষ্কার করতে পারে।',
  },
  {
    type: 'MISSION',
    order: 3,
    titleEn: 'Mission',
    titleBn: 'আমাদের লক্ষ্য',
    bodyEn:
      'Provide our clients with unforgettable travel experiences and guaranteed, satisfactory services that exceed their expectations — every single trip, every single time.',
    bodyBn:
      'আমাদের ক্লায়েন্টদের অবিস্মরণীয় ভ্রমণ অভিজ্ঞতা এবং প্রতিটি যাত্রায় তাদের প্রত্যাশা ছাড়িয়ে যাওয়া নিশ্চিত পরিষেবা প্রদান করা — প্রতিবার, প্রতিটি যাত্রায়।',
  },
  {
    type: 'SERVICE',
    order: 4,
    titleEn: 'Service',
    titleBn: 'পরিষেবা',
    bodyEn:
      'Professional customer consultation delivering hassle-free travel. Our creative but determined approach identifies the most appropriate arrangements and the best possible value. FlynGo travel consultants are friendly, polite, professional, and experienced — equally comfortable with seasoned travelers and those new to the world of travel.',
    bodyBn:
      'পেশাদার গ্রাহক পরামর্শের মাধ্যমে ঝামেলামুক্ত ভ্রমণ নিশ্চিত করা। আমাদের সৃজনশীল কিন্তু দৃঢ় পদ্ধতি সবচেয়ে উপযুক্ত ব্যবস্থা এবং সেরা সম্ভাব্য মূল্য খুঁজে বের করে। FlynGo ট্রাভেল কনসালট্যান্টরা বন্ধুসুলভ, ভদ্র, পেশাদার এবং অভিজ্ঞ — অভিজ্ঞ ভ্রমণকারী এবং নতুন ভ্রমণকারী উভয়ের জন্যই সমান স্বাচ্ছন্দ্যে কাজ করেন।',
  },
  {
    type: 'VALUES',
    order: 5,
    titleEn: 'Our Values',
    titleBn: 'আমাদের মূল্যবোধ',
    payload: {
      items: [
        { icon: 'MessageCircle', titleEn: 'Direct & Open Communication', titleBn: 'সরাসরি ও উন্মুক্ত যোগাযোগ', descriptionEn: 'Transparent and respectful at every step.', descriptionBn: 'প্রতিটি ধাপে স্বচ্ছ ও শ্রদ্ধাশীল।' },
        { icon: 'Zap', titleEn: 'Speedy Process', titleBn: 'দ্রুত প্রক্রিয়া', descriptionEn: 'Fast turnaround on every request.', descriptionBn: 'প্রতিটি অনুরোধে দ্রুত সাড়া।' },
        { icon: 'Users', titleEn: 'Teamwork', titleBn: 'দলগত কাজ', descriptionEn: 'One team, one mission.', descriptionBn: 'একটি দল, একটি লক্ষ্য।' },
        { icon: 'Repeat', titleEn: 'Flexibility', titleBn: 'নমনীয়তা', descriptionEn: 'Willingness to accept and adapt to change.', descriptionBn: 'পরিবর্তনকে মেনে নেওয়া ও অভিযোজন।' },
        { icon: 'BookOpen', titleEn: 'Learn from Mistakes', titleBn: 'ভুল থেকে শেখা', descriptionEn: 'Recognize, reflect, and improve.', descriptionBn: 'চিনুন, প্রতিফলিত করুন এবং উন্নত করুন।' },
        { icon: 'Compass', titleEn: 'Risk-taking', titleBn: 'সাহসী পদক্ষেপ', descriptionEn: 'Curated adventures that push boundaries safely.', descriptionBn: 'নিরাপদে সীমানা ঠেলে দেওয়া কিউরেটেড অ্যাডভেঞ্চার।' },
        { icon: 'Heart', titleEn: 'Quality Care', titleBn: 'মানসম্মত যত্ন', descriptionEn: 'Total customer satisfaction and well-being.', descriptionBn: 'সম্পূর্ণ গ্রাহক সন্তুষ্টি ও সুস্থতা।' },
      ],
    },
  },
  {
    type: 'TRIPS',
    order: 6,
    titleEn: 'Our Trips',
    titleBn: 'আমাদের যাত্রা',
    bodyEn:
      'Our trips are carefully crafted to combine cultural and natural riches with comfort, safety, luxury, and adventure — creating journeys our guests talk about for a long time. We have four key components: discovery, value, pace, and choice.',
    bodyBn:
      'আমাদের যাত্রাগুলি সাংস্কৃতিক ও প্রাকৃতিক সম্পদকে আরাম, নিরাপত্তা, বিলাসিতা এবং অ্যাডভেঞ্চারের সাথে মিশ্রিত করে সুচারুভাবে তৈরি করা হয় — এমন যাত্রা যা আমাদের অতিথিরা দীর্ঘ সময় মনে রাখবেন। আমাদের চারটি মূল উপাদান: আবিষ্কার, মূল্য, গতি এবং পছন্দ।',
  },
  {
    type: 'STRATEGIES',
    order: 7,
    titleEn: 'Key Strategies',
    titleBn: 'মূল কৌশল',
    payload: {
      items: [
        { icon: 'TrendingUp', titleEn: 'Financial Health', titleBn: 'আর্থিক সুস্থতা', descriptionEn: 'Always keep the company financially and economically healthy.', descriptionBn: 'সবসময় কোম্পানিকে আর্থিক ও অর্থনৈতিকভাবে সুস্থ রাখুন।' },
        { icon: 'Sparkles', titleEn: 'High-Quality Service', titleBn: 'উচ্চমানের পরিষেবা', descriptionEn: 'Drives customer loyalty, repeat orders, and referrals.', descriptionBn: 'গ্রাহক আনুগত্য, পুনরায় অর্ডার এবং রেফারেল তৈরি করে।' },
        { icon: 'Award', titleEn: 'High-Performing Team', titleBn: 'উচ্চ-প্রদর্শনকারী দল', descriptionEn: 'Customer orientation and results with the highest professional ethics — at the lowest cost in the industry.', descriptionBn: 'সর্বোচ্চ পেশাদার নৈতিকতা এবং সর্বনিম্ন খরচে গ্রাহকমুখী ফলাফল।' },
      ],
    },
  },
  {
    type: 'TEAM',
    order: 8,
    titleEn: 'A Team of Experts',
    titleBn: 'বিশেষজ্ঞদের দল',
    bodyEn:
      'We believe that only an experienced travel expert can help you discover the unique and amazing qualities of a destination. FlynGo has a team of specialists who work with full dedication, great passion, discipline, and knowledge — not only to show you the best of the world but to allow you to feel it with all your senses and feel as if you are floating with joy.',
    bodyBn:
      'আমরা বিশ্বাস করি যে শুধুমাত্র একজন অভিজ্ঞ ভ্রমণ বিশেষজ্ঞই আপনাকে একটি গন্তব্যের অনন্য ও আশ্চর্যজনক গুণাবলী আবিষ্কার করতে সাহায্য করতে পারেন। FlynGo-তে বিশেষজ্ঞদের একটি দল রয়েছে যারা পূর্ণ নিবেদন, দুর্দমনীয় আবেগ, শৃঙ্খলা এবং জ্ঞান নিয়ে কাজ করেন — শুধু আপনাকে বিশ্বের সেরা দেখানো নয়, আপনাকে তা সব ইন্দ্রিয় দিয়ে অনুভব করতে দেওয়া।',
  },
  {
    type: 'SERVICES',
    order: 9,
    titleEn: 'What Can We Do',
    titleBn: 'আমরা যা করতে পারি',
    payload: {
      items: [
        { icon: 'Plane', titleEn: 'International Ticketing', titleBn: 'আন্তর্জাতিক টিকিটিং', descriptionEn: 'Airline reservations and ticketing worldwide.', descriptionBn: 'বিশ্বজুড়ে এয়ারলাইন রিজার্ভেশন ও টিকিটিং।' },
        { icon: 'Ship', titleEn: 'Boat, Bus & Rail Ticketing', titleBn: 'নৌ, বাস ও রেল টিকিটিং', descriptionEn: 'Tickets for boats, buses, and railways.', descriptionBn: 'নৌকা, বাস ও রেলের টিকিট।' },
        { icon: 'FileBadge', titleEn: 'Worldwide Visa Processing', titleBn: 'বিশ্বব্যাপী ভিসা প্রক্রিয়াকরণ', descriptionEn: 'Visas for 50+ countries — embassy in and outside Bangladesh.', descriptionBn: '৫০+ দেশের ভিসা — বাংলাদেশের দূতাবাসে ও বিদেশে।' },
        { icon: 'Hotel', titleEn: 'Worldwide Hotel Reservation', titleBn: 'বিশ্বব্যাপী হোটেল রিজার্ভেশন', descriptionEn: 'Negotiated rates and curated stays.', descriptionBn: 'আলোচিত রেট এবং কিউরেটেড অবস্থান।' },
        { icon: 'Car', titleEn: 'Worldwide Car Rental', titleBn: 'বিশ্বব্যাপী গাড়ি ভাড়া', descriptionEn: 'Cars and full coverage options worldwide.', descriptionBn: 'সম্পূর্ণ কভারেজ সহ বিশ্বব্যাপী গাড়ি ভাড়া।' },
        { icon: 'Map', titleEn: 'Ground Handling', titleBn: 'গ্রাউন্ড হ্যান্ডলিং', descriptionEn: 'Transfers, meet & assist, and guided tours.', descriptionBn: 'ট্রান্সফার, মিট অ্যান্ড অ্যাসিস্ট ও গাইডেড ট্যুর।' },
        { icon: 'Languages', titleEn: 'Tour Guides', titleBn: 'ট্যুর গাইড', descriptionEn: 'Multilingual guides — we speak your language.', descriptionBn: 'বহু-ভাষিক গাইড — আমরা আপনার ভাষায় কথা বলি।' },
        { icon: 'MountainSnow', titleEn: 'Tailor-made Tours', titleBn: 'কাস্টমাইজড ট্যুর', descriptionEn: 'Adventures, eco-tours, cruises, diving, sea resorts, skiing, spa, and more.', descriptionBn: 'অ্যাডভেঞ্চার, ইকো-ট্যুর, ক্রুজ, ডাইভিং, সমুদ্র রিসোর্ট, স্কিইং, স্পা এবং আরও অনেক কিছু।' },
        { icon: 'Briefcase', titleEn: 'Incentive & Special Groups', titleBn: 'ইনসেনটিভ ও স্পেশাল গ্রুপ', descriptionEn: 'Corporate incentives and special-interest group tours.', descriptionBn: 'কর্পোরেট ইনসেনটিভ ও বিশেষ আগ্রহ গোষ্ঠীর ট্যুর।' },
        { icon: 'Heart', titleEn: 'Destination Weddings', titleBn: 'গন্তব্য বিবাহ', descriptionEn: 'Plan your wedding anywhere in the world.', descriptionBn: 'বিশ্বের যেকোনো জায়গায় আপনার বিয়ে পরিকল্পনা করুন।' },
        { icon: 'Building2', titleEn: 'Conferences & MICE', titleBn: 'কনফারেন্স ও MICE', descriptionEn: 'Conferences, meetings, and corporate events.', descriptionBn: 'কনফারেন্স, মিটিং এবং কর্পোরেট ইভেন্ট।' },
        { icon: 'Coffee', titleEn: 'Cruises & Catering', titleBn: 'ক্রুজ ও ক্যাটারিং', descriptionEn: 'Worldwide and local cruises, plus catering services.', descriptionBn: 'বিশ্বব্যাপী ও স্থানীয় ক্রুজ এবং ক্যাটারিং পরিষেবা।' },
        { icon: 'Tent', titleEn: 'Camping & Excursions', titleBn: 'ক্যাম্পিং ও এক্সকার্সন', descriptionEn: 'Year-round excursions, itineraries, and camping services.', descriptionBn: 'সারা বছর এক্সকার্সন, ভ্রমণসূচি এবং ক্যাম্পিং পরিষেবা।' },
      ],
    },
  },
  {
    type: 'STATS',
    order: 10,
    payload: {
      items: [
        { value: '500+', labelEn: 'Destinations', labelBn: 'গন্তব্য' },
        { value: '50K+', labelEn: 'Happy Travelers', labelBn: 'খুশি যাত্রী' },
        { value: '1K+', labelEn: 'Tour Packages', labelBn: 'ট্যুর প্যাকেজ' },
        { value: '24/7', labelEn: 'Concierge', labelBn: 'কনসিয়ার্জ' },
      ],
    },
  },
  {
    type: 'CONTACT',
    order: 11,
    titleEn: 'Office & Contact',
    titleBn: 'অফিস ও যোগাযোগ',
    payload: {
      address: 'HM Plaza (11th Floor), Rajlaxmi, Uttara, Dhaka',
      phone: '01322913530',
      email: 'visaflyngo@gmail.com',
      hours: 'Sat – Thu · 9:00 AM – 7:00 PM',
    },
  },
];

const DEFAULT_CEO: CeoMessageInput = {
  name: 'FlynGo CEO',
  title: 'Founder & Chief Executive Officer, FlynGo',
  imageUrl: '/images/ceo.jpg',
  bodyEn:
    "Dear Travelers and Partners,\n\nWhen we started FlynGo, our goal was simple — to make world-class travel accessible to every Bangladeshi, without the friction of endless forms, opaque pricing, or impersonal service. Every booking we facilitate carries that vision with it.\n\nFrom curated tour packages to end-to-end visa support and pilgrimage journeys, our team works around the clock so that your only task is to look forward to the trip. We blend modern technology with the kind of human attention that travel truly deserves.\n\nThank you for trusting us with your journeys. Whether this is your first adventure with FlynGo or your fiftieth, we are honored to be part of your story.\n\nWith warm regards,",
  bodyBn:
    'প্রিয় ভ্রমণকারী ও পার্টনার,\n\nযখন আমরা FlynGo শুরু করেছিলাম, আমাদের লক্ষ্য ছিল সহজ — বিশ্বমানের ভ্রমণকে প্রতিটি বাংলাদেশির জন্য সহজলভ্য করা, অসীম ফর্ম, অস্পষ্ট মূল্য বা ব্যক্তিহীন পরিষেবার জটিলতা ছাড়াই। আমরা যে প্রতিটি বুকিং সহজতর করি তার মধ্যে সেই দৃষ্টিভঙ্গি বহন করে।\n\nকিউরেটেড ট্যুর প্যাকেজ থেকে শুরু করে ভিসা সহায়তা এবং তীর্থযাত্রা পর্যন্ত, আমাদের দল ২৪ ঘণ্টা কাজ করে যাতে আপনার একমাত্র কাজ হয় যাত্রার জন্য অপেক্ষা করা। আমরা আধুনিক প্রযুক্তিকে মানবিক মনোযোগের সাথে মিশ্রিত করি — যা ভ্রমণ সত্যিই заслуживает।\n\nআমাদের যাত্রায় আপনার আস্থার জন্য ধন্যবাদ। এটি আপনার প্রথম অ্যাডভেঞ্চার হোক বা পঞ্চাশতম, আমরা আপনার গল্পের অংশ হতে পেরে সম্মানিত।\n\nশুভেচ্ছান্তে,',
  signatureEn: 'Founder & CEO, FlynGo',
  signatureBn: 'প্রতিষ্ঠাতা ও সিইও, FlynGo',
  isActive: true,
};

@Injectable()
export class AboutService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------- META ----------------

  async getMeta(tenantId: string) {
    let meta = await this.prisma.aboutPageMeta.findUnique({ where: { tenantId } });
    if (!meta) {
      meta = await this.prisma.aboutPageMeta.create({
        data: { tenantId, ...DEFAULT_META },
      });
    }
    return meta;
  }

  async upsertMeta(tenantId: string, data: AboutPageMetaInput) {
    return this.prisma.aboutPageMeta.upsert({
      where: { tenantId },
      create: { tenantId, ...DEFAULT_META, ...data },
      update: { ...data },
    });
  }

  async getDefaults(): Promise<AboutPageMetaInput> {
    return DEFAULT_META;
  }

  // ---------------- SECTIONS ----------------

  async listSections(tenantId: string) {
    return this.prisma.aboutPageSection.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: [{ type: 'asc' }, { order: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async seedDefaultsIfEmpty(tenantId: string) {
    const count = await this.prisma.aboutPageSection.count({
      where: { tenantId, deletedAt: null },
    });
    if (count > 0) return;
    await this.prisma.aboutPageSection.createMany({
      data: DEFAULT_SECTIONS.map((s) => ({
        tenantId,
        type: s.type as any,
        order: s.order ?? 0,
        titleEn: s.titleEn,
        titleBn: s.titleBn,
        subtitleEn: s.subtitleEn,
        subtitleBn: s.subtitleBn,
        bodyEn: s.bodyEn,
        bodyBn: s.bodyBn,
        payload: (s.payload ?? {}) as any,
        isActive: s.isActive ?? true,
      })),
    });
  }

  async createSection(tenantId: string, data: AboutPageSectionInput) {
    return this.prisma.aboutPageSection.create({
      data: {
        tenantId,
        type: data.type as any,
        order: data.order ?? 0,
        titleEn: data.titleEn,
        titleBn: data.titleBn,
        subtitleEn: data.subtitleEn,
        subtitleBn: data.subtitleBn,
        bodyEn: data.bodyEn,
        bodyBn: data.bodyBn,
        payload: (data.payload ?? {}) as any,
        isActive: data.isActive ?? true,
      },
    });
  }

  async updateSection(id: string, tenantId: string, data: Partial<AboutPageSectionInput>) {
    const existing = await this.prisma.aboutPageSection.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('About section not found');
    return this.prisma.aboutPageSection.update({
      where: { id },
      data: {
        type: data.type as any,
        order: data.order,
        titleEn: data.titleEn,
        titleBn: data.titleBn,
        subtitleEn: data.subtitleEn,
        subtitleBn: data.subtitleBn,
        bodyEn: data.bodyEn,
        bodyBn: data.bodyBn,
        payload: data.payload as any,
        isActive: data.isActive,
      },
    });
  }

  async removeSection(id: string, tenantId: string) {
    const existing = await this.prisma.aboutPageSection.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('About section not found');
    return this.prisma.aboutPageSection.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async reorderSections(tenantId: string, ids: string[]) {
    const updates = ids.map((id, idx) =>
      this.prisma.aboutPageSection.updateMany({
        where: { id, tenantId },
        data: { order: idx },
      }),
    );
    await this.prisma.$transaction(updates);
    return this.listSections(tenantId);
  }

  // ---------------- CEO MESSAGE ----------------

  async getActiveCeoMessage(tenantId: string) {
    let msg = await this.prisma.ceoMessage.findFirst({
      where: { tenantId, deletedAt: null, isActive: true },
      orderBy: { updatedAt: 'desc' },
    });
    if (!msg) {
      msg = await this.prisma.ceoMessage.create({
        data: { tenantId, ...DEFAULT_CEO },
      });
    }
    return msg;
  }

  async listCeoMessages(tenantId: string) {
    return this.prisma.ceoMessage.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async upsertCeoMessage(tenantId: string, data: CeoMessageInput) {
    const existing = await this.prisma.ceoMessage.findFirst({
      where: { tenantId, deletedAt: null, isActive: true },
    });
    if (existing) {
      return this.prisma.ceoMessage.update({
        where: { id: existing.id },
        data: {
          name: data.name,
          title: data.title,
          imageUrl: data.imageUrl,
          bodyEn: data.bodyEn,
          bodyBn: data.bodyBn,
          signatureEn: data.signatureEn,
          signatureBn: data.signatureBn,
          isActive: data.isActive ?? true,
        },
      });
    }
    return this.prisma.ceoMessage.create({
      data: {
        tenantId,
        name: data.name,
        title: data.title,
        imageUrl: data.imageUrl,
        bodyEn: data.bodyEn,
        bodyBn: data.bodyBn,
        signatureEn: data.signatureEn,
        signatureBn: data.signatureBn,
        isActive: data.isActive ?? true,
      },
    });
  }

  async removeCeoMessage(id: string, tenantId: string) {
    const existing = await this.prisma.ceoMessage.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('CEO message not found');
    return this.prisma.ceoMessage.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  // ---------------- COMBINED ----------------

  async getFullAboutPage(tenantId: string) {
    await this.seedDefaultsIfEmpty(tenantId);
    const [meta, sections, ceo] = await Promise.all([
      this.getMeta(tenantId),
      this.listSections(tenantId),
      this.getActiveCeoMessage(tenantId),
    ]);
    return { meta, sections: sections.filter((s) => s.isActive), ceo };
  }

  async getDefaultsAll() {
    return {
      meta: DEFAULT_META,
      sections: DEFAULT_SECTIONS,
      ceo: DEFAULT_CEO,
    };
  }
}
