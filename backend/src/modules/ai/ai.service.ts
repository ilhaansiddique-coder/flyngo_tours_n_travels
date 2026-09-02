import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

interface UmrahItineraryInput {
  nights: number;                  // total nights on trip
  makkahNights: number;
  madinahNights: number;
  startDate?: string;
  route: 'makkah_first' | 'madinah_first' | 'combined';
  travelers: number;
  hasChildren?: boolean;
  hasElderly?: boolean;
  budgetTier?: 'economy' | 'standard' | 'premium' | 'vip';
  walkingMax?: number;             // meters willing to walk to Haram / Prophet's Mosque
  language?: 'en' | 'bn' | 'ur' | 'ar';
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getTravelRecommendations(preferences: {
    budget?: number;
    duration?: number;
    interests?: string[];
    season?: string;
  }) {
    this.logger.log('Generating travel recommendations...');

    const where: any = { deletedAt: null };
    if (preferences.budget) {
      where.price = { lte: preferences.budget };
    }

    const tours = await this.prisma.tour.findMany({
      where,
      take: 6,
      include: { destination: { select: { name: true, country: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const recommendations = tours.map((tour) => ({
      id: tour.id,
      title: tour.title,
      destination: tour.destination?.name,
      country: tour.destination?.country,
      price: Number(tour.price),
      currency: tour.currency,
      reason: this.matchReason(preferences, tour),
    }));

    return {
      recommendations,
      count: recommendations.length,
      generatedBy: 'flyngo-recommendations-v1',
    };
  }

  private matchReason(preferences: { budget?: number; interests?: string[]; season?: string }, tour: any): string {
    const reasons: string[] = [];
    if (preferences.budget && Number(tour.price) <= preferences.budget) reasons.push('Within your budget');
    if (preferences.interests?.length) reasons.push('Matches your interests');
    if (preferences.season) reasons.push(`Great for ${preferences.season} travel`);
    return reasons.length > 0 ? reasons[0] : 'Popular choice';
  }

  async getVisaAssistance(destination: string, nationality: string) {
    this.logger.log(`Checking visa requirements for ${nationality} → ${destination}`);

    const visaService = await this.prisma.visaService.findFirst({
      where: {
        deletedAt: null,
        OR: [
          { title: { contains: destination, mode: 'insensitive' } },
          { country: { is: { name: { contains: destination, mode: 'insensitive' } } } },
        ],
      },
      include: { country: { select: { name: true, country: true } } },
    });

    if (visaService) {
      return {
        destination,
        nationality,
        available: true,
        visaType: visaService.title,
        processingTime: visaService.processingTime || '5-7 business days',
        requirements: [
          'Valid passport (min 6 months validity)',
          'Recent passport-size photos',
          'Bank statement (last 6 months)',
          'Flight itinerary',
          'Hotel booking confirmation',
        ],
        notes: visaService.description || `Visa processing available for ${destination}`,
        serviceId: visaService.id,
      };
    }

    return {
      destination,
      nationality,
      available: false,
      requirements: [
        'Valid passport (min 6 months validity)',
        'Recent passport-size photos',
        'Bank statement (last 6 months)',
      ],
      notes: `Standard visa requirements for ${nationality} citizens traveling to ${destination}. Contact us for personalized assistance.`,
    };
  }

  /**
   * Build a structured Umrah itinerary based on traveler preferences.
   * This is a deterministic, opinionated builder — no external LLM dependency.
   */
  async planUmrahItinerary(input: UmrahItineraryInput) {
    const lang = input.language ?? 'en';
    const days = Math.max(1, Math.ceil(input.nights / 1));
    const itinerary: any[] = [];

    const t = (en: string, bn?: string, ur?: string, ar?: string) =>
      ({ en, bn: bn ?? en, ur: ur ?? en, ar: ar ?? en }[lang] ?? en);

    // Phase 1: Arrival
    if (input.route === 'madinah_first') {
      itinerary.push({
        day: 1,
        title: t(
          'Arrival in Madinah',
          'মদীনায় আগমন',
          'مدینہ میں آمد',
          'الوصول إلى المدينة',
        ),
        activities: [
          t('Airport pickup', 'এয়ারপোর্ট পিকআপ', 'ہوائی اڈہ پک اپ', 'الاستقبال في المطار'),
          t('Check-in at hotel near Prophet\'s Mosque', 'মসজিদে নববীর কাছে হোটেলে চে�-ইন', 'مسجد نبوی کے قریب ہوٹل میں چیک ان', 'تسجيل الدخول في الفندق القريب من المسجد النبوي'),
          t('Rest and hydration', 'বিশ্রাম � পানি পান', 'آرام اور پانی', 'الراحة والترطيب'),
        ],
        tips: [
          t('Best hotels are within 300m of the Prophet\'s Mosque for easy access to all 5 prayers.', 'মসজিদে নববীর ৩০০ মিটারের মধ্যে হোটেল সবচেয়ে ভালো।', 'مسجد نبوی کے 300 میٹر کے اندر ہوٹل بہترین ہیں۔', 'أفضل الفنادق على بعد 300 م من المسجد النبوي'),
        ],
      });
    } else {
      itinerary.push({
        day: 1,
        title: t(
          'Arrival in Jeddah / Makkah',
          'জেদ্দা / মক্কায় আগমন',
          'جدہ / مکہ میں آمد',
          'الوصول إلى جدة / مكة',
        ),
        activities: [
          t('Airport pickup at Jeddah / Makkah airport', 'জেদ্দা / মক্কা এয়ারপোর্টে পিকআপ', 'جد� / مکہ ہوائی اڈے پر پک اپ', 'الاستقبال في مطار جدة / مكة'),
          t('Check-in at hotel near Al-Masjid Al-Haram', 'মসজিদুল হারামের কা�ে হোটেলে চেক-ইন', 'مسجد الحرام کے قریب ہوٹل', 'تسجيل الدخول في فندق قريب من الحرم'),
          t('Perform Umrah (Tawaf + Sa\'i)', '�মরাহ পালন (তাওয়াফ + সাঈ)', 'عمرہ ادائیگی (طواف + سعی)', 'أداء العمرة (الطواف والسعي)'),
        ],
        tips: [
          t('Hotels within 200m of the Haram save you 30+ minutes per walk and are kinder on elderly travelers.', 'হারামের ২০০ মিটারের মধ্যে হোটেল প্রতিটি প্রার্থনায় ৩০+ মিনিট সাশ্রয় করে।', 'مسجد الحرام سے 200 میٹر کے اندر ہوٹل فی نماز 30+ منٹ بچاتے ہیں�', 'الفنادق على بعد 200 م من الحرام توفر 30+ دقيقة لكل صلاة'),
        ],
      });
    }

    // Phase 2: Stay days
    let dayCounter = 2;
    const makkahDays = Math.max(1, Math.ceil(input.makkahNights / 1));
    const madinahDays = Math.max(1, Math.ceil(input.madinahNights / 1));

    if (input.route === 'madinah_first') {
      for (let i = 0; i < madinahDays - 1; i++) {
        itinerary.push({
          day: dayCounter++,
          title: t(
            'Madinah ziyarat day',
            'মদীনা জিয়ারত দিবস',
            'مدینہ زیارت کا دن',
            'يوم زيارة المدينة',
          ),
          activities: [
            t('Fajr at Prophet\'s Mosque', 'মসজিদে নববীতে ফজর', 'مسجد نبوی میں فجر', 'صلاة الفجر في المسجد النبوي'),
            t('Visit Masjid Quba (first mosque in Islam)', 'মসজিদ কুবা পরিদর্শন', 'مسجد قباء کی زیارت', 'زيارة مسجد قباء'),
            t('Visit Uhud Mountain & Martyrs\' Cemetery', 'উহুদ পাহাড় ও শহীদ কবরস্থান', 'کوہ احد اور شہداء کی قبرستان', 'جبل أحد ومقبرة الشهداء'),
            t('Rest at hotel', 'হোটেলে বিশ্রাম', 'ہوٹل میں آرام', 'الراحة في الفندق'),
          ],
        });
      }

      itinerary.push({
        day: dayCounter++,
        title: t(
          'Travel Madinah → Makkah',
          'মদীনা → মক্�া ভ্রমণ',
          'مدینہ سے مکہ کا سفر',
          'السفر من المدينة إلى مكة',
        ),
        activities: [
          t('Check-out and travel by private AC coach or train', 'চেক-আউট এবং ব্যক্তিগত এসি কো� বা ট্রেনে ভ্রমণ', 'چیک آؤٹ اور پرائیویٹ اے سی کوچ یا ٹرین سے سفر', 'تسجيل المغادرة والسفر بحافلة خاصة مكيفة أو قطار'),
          t('Arrive Makkah, check in', 'মক্কায় পৌঁছে চেক-ইন', 'مکہ پہنچ کر چیک ان', 'الوصول إلى مكة وتسجيل الدخول'),
          t('Umrah if not yet performed', 'যদি এখনও উমরাহ না করে থাকেন', 'اگر ابھی تک عمرہ نہیں کیا', 'أداء العمرة إن لم تتم'),
        ],
      });

      for (let i = 0; i < makkahDays - 1; i++) {
        itinerary.push({
          day: dayCounter++,
          title: t(
            'Makkah worship day',
            'মক্কা ইবাদত দিবস',
            'مکہ عبادت کا دن',
            'يوم عبادة في مكة',
          ),
          activities: [
            t('Pray all 5 prayers at Al-Masjid Al-Haram', 'মসজিদুল হারামে ৫ ওয়াক্ত নামাজ', 'مسجد الحرام میں پانچوں نمازیں', 'الصلوات الخمس في المسجد الحرام'),
            t('Optional: visit Jabal al-Nour (Cave Hira)', '�চ্ছিক: জাবাল আন-নূর (গুহা হিরা)', 'اختیاری: جبل النور (غار حرا)', 'اختياري: جبل النور (غار حراء)'),
            t('Optional: visit Jabal Thawr', 'ঐচ্ছিক: জাবাল সাওর', 'اختیاری: جبل ثور', 'اختياري: جبل ثور'),
            t('Rest and prepare for next day', 'বিশ্রাম ও প্রস্তুতি', 'آرام اور اگلے دن کی تیاری', 'الراحة والتحضير لليوم التالي'),
          ],
        });
      }
    } else {
      // makkah_first (default)
      for (let i = 0; i < makkahDays - 1; i++) {
        itinerary.push({
          day: dayCounter++,
          title: t(
            'Makkah worship day',
            'মক্কা ইবাদত দিবস',
            'مکہ عبادت کا دن',
            'يوم عبادة في مكة',
          ),
          activities: [
            t('Pray all 5 prayers at Al-Masjid Al-Haram', 'মসজিদুল হারামে ৫ ওয়াক্ত নামাজ', 'مسجد الحرام میں پانچوں نمازیں', 'الصلوات الخمس في المسجد الحرام'),
            t('Optional ziyarat: Jabal al-Nour, Jabal Thawr, Mina/Arafat', 'ঐচ্ছিক জিয়ারত: জাবাল নূর, সাওর, মিনা/আরাফাত', 'اختیاری زیارت: جبل النور، جبل ثور، منی/عرفات', 'زيارات اختيارية: جبل النور، جبل ثور، منى/عرفات'),
          ],
        });
      }

      itinerary.push({
        day: dayCounter++,
        title: t(
          'Travel Makkah → Madinah',
          'মক্কা → মদীনা ভ্রমণ',
          'مکہ سے مدینہ کا سفر',
          'السفر من مكة إلى المدينة',
        ),
        activities: [
          t('Check-out Makkah hotel', 'মক্কা হোটে� থেকে চেক-আউট', 'مکہ ہوٹل سے چیک آؤٹ', 'تسجيل المغادرة من فندق مكة'),
          t('Travel by private AC coach or train', 'ব্যক্তি�ত এসি কোচ বা ট্রেনে ভ্রমণ', 'پرائیویٹ اے سی کوچ یا ٹرین سے سفر', 'السفر بحافلة خاصة مكيفة أو قطار'),
          t('Check-in Madinah hotel', 'মদীনা হোটেলে চেক-ইন', 'مدینہ ہوٹل میں چیک ان', 'تسجيل الدخول في فندق المدينة'),
        ],
      });

      for (let i = 0; i < madinahDays - 1; i++) {
        itinerary.push({
          day: dayCounter++,
          title: t(
            'Madinah worship day',
            'মদীনা ইবাদত দিবস',
            'مدینہ عبادت کا دن',
            'يوم عبادة في المدينة',
          ),
          activities: [
            t('Fajr at Prophet\'s Mosque', 'মসজিদে নববীতে ফজর', 'مسجد نبوی میں فجر', 'صلاة الفجر في المسجد النبوي'),
            t('Visit Masjid Quba', 'মসজিদ কুবা পরিদর্শন', 'مسجد قباء کی زیارت', 'زيارة مسجد قباء'),
            t('Visit Uhud & Martyrs\' Cemetery', 'উহুদ ও শহীদ কবরস্থান', 'کوہ احد اور شہداء کی قبرستان', 'جبل أحد ومقبرة الشهداء'),
          ],
        });
      }
    }

    // Final: Departure
    itinerary.push({
      day: dayCounter,
      title: t(
        'Departure',
        'প্রস্থান',
        'واپسی',
        'المغادرة',
      ),
      activities: [
        t('Check-out and transfer to airport', 'চেক-আউট এবং এয়ারপোর্ট ট্রান্সফার', 'چیک آؤٹ اور ہوائی اڈے تک', 'تسجيل المغادرة والانتقال إلى المطار'),
        t('Departure flight', 'ফিরতি ফ্লাইট', 'واپسی کی پرواز', 'رحلة العودة'),
      ],
    });

    // Recommendations
    const recommendations: string[] = [];
    if (input.walkingMax && input.walkingMax < 500) {
      recommendations.push(t(
        'Choose a hotel within 200m of the Haram — you specified limited walking tolerance.',
        'হারামের ২০০ মিটারের মধ্যে হোটেল বেছে নিন — আপনি সীমিত হাঁটার সহনশীলতা উল্লেখ করেছেন।',
        'مسجد الحرام سے 200 میٹر کے اندر ہوٹل منتخب کریں — آپ نے محدود چلنے کی صلاحیت بتائی ہے۔',
        'اختر فندقًا على بعد 200 م من الحرم — لقد حددت تحملًا محدودًا للمشي.',
      ));
    }
    if (input.hasElderly) {
      recommendations.push(t(
        'Request a hotel with elevator access and a wheelchair-friendly room.',
        'লিফট এবং হুইলচেয়ার-বান্ধব রুম সহ হোটেলের অনুরোধ করুন।',
        'لفٹ اور وہیل چیئر دوست کمرے والا ہوٹل مانگیں۔',
        'اطلب فندقًا به مصعد وغرفة ودودة للكراسي المتحركة.',
      ));
    }
    if (input.hasChildren) {
      recommendations.push(t(
        'Book a quad-sharing room to keep kids with parents, and request ground-floor proximity to restaurants.',
        'সন্তানদের সাথে রাখতে কোয়াড শেয়ারিং রুম বুক করুন।',
        'بچوں کے ساتھ رکھنے کے لیے کوارڈ شیئرنگ روم بک کریں۔',
        'احجز غرفة رباعية لإبقاء الأطفال مع الوالدين.',
      ));
    }
    recommendations.push(t(
      'Pre-book airport transfers and visa processing to save 4+ hours on arrival.',
      'এয়ারপোর্ট �্রান্সফার এবং ভিসা প্রসেসি� আগেই বুক করুন — ৪+ ঘণ্�া বাঁচবে।',
      'ہوائی اڈے کی ٹرانسفر اور ویزا پروسیسنگ پہلے سے بک کریں — 4+ گھنٹے بچیں گے۔',
      'احجز مسبقًا خدمات النقل من المطار ومعالجة التأشيرة لتوفير 4+ ساعات.',
    ));

    return {
      route: input.route,
      totalDays: dayCounter,
      totalNights: input.nights,
      itinerary,
      recommendations,
      generatedBy: 'flyngo-ai-v1',
    };
  }

  async planItinerary(params: {
    destination: string;
    days: number;
    budget: number;
    interests: string[];
  }) {
    this.logger.log(`Planning itinerary for ${params.destination}`);

    const destination = await this.prisma.destination.findFirst({
      where: {
        deletedAt: null,
        name: { contains: params.destination, mode: 'insensitive' },
      },
    });

    const daysPlan: any[] = [];
    for (let i = 1; i <= params.days; i++) {
      const activities: string[] = [];
      const tips: string[] = [];

      if (i === 1) {
        activities.push(`Arrive in ${params.destination}`);
        activities.push('Check in at hotel');
        activities.push('Explore the local area');
        tips.push('Keep important documents in your hotel safe');
      } else if (i === params.days) {
        activities.push('Last-minute shopping and souvenirs');
        activities.push('Check out and transfer to airport');
        tips.push('Arrive at airport 3 hours before international flights');
      } else {
        if (params.interests.includes('culture') || params.interests.includes('history')) {
          activities.push(`Visit historical sites and museums in ${params.destination}`);
          activities.push('Local cultural experience');
        }
        if (params.interests.includes('adventure')) {
          activities.push('Outdoor adventure activity');
        }
        if (params.interests.includes('food')) {
          activities.push('Local food tour');
        }
        if (activities.length === 0) {
          activities.push(`Explore ${params.destination} at your own pace`);
          activities.push('Visit local attractions');
        }
        tips.push(`Budget tip: daily spend ~${Math.round(params.budget / params.days)} ${params.budget > 5000 ? 'BDT' : 'USD'}`);
      }

      daysPlan.push({
        day: i,
        title: i === 1 ? 'Arrival' : i === params.days ? 'Departure' : `Day ${i} in ${params.destination}`,
        activities,
        tips,
      });
    }

    return {
      destination: params.destination,
      totalDays: params.days,
      budget: params.budget,
      interests: params.interests,
      itinerary: daysPlan,
      generatedBy: 'flyngo-itinerary-v1',
    };
  }
}
