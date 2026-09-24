/**
 * Curated manual dictionary of Bangla translations for travel, visa, tour,
 * and service submission terms in FlynGo.
 *
 * Used both for instantaneous offline translation of key domain terms,
 * and as high-priority overrides for auto-translation to guarantee
 * culturally accurate and industry-standard Bangladeshi travel phrasing.
 */

export interface TranslationEntry {
  en: string;
  bn: string;
  category: 'visa' | 'tour' | 'document' | 'hajj_umrah' | 'general' | 'booking';
}

export const MANUAL_BANGLA_WORDS: TranslationEntry[] = [
  // ── Visa Services & Processing ────────────────────────────
  { en: 'tourist visa', bn: 'ট্যুরিস্ট ভিসা', category: 'visa' },
  { en: 'business visa', bn: 'বিজনেস ভিসা', category: 'visa' },
  { en: 'student visa', bn: 'স্টুডেন্ট ভিসা', category: 'visa' },
  { en: 'work visa', bn: 'ওয়ার্ক ভিসা', category: 'visa' },
  { en: 'transit visa', bn: 'ট্রানজিট ভিসা', category: 'visa' },
  { en: 'medical visa', bn: 'মেডিকেল ভিসা', category: 'visa' },
  { en: 'visa processing', bn: 'ভিসা প্রসেসিং', category: 'visa' },
  { en: 'processing time', bn: 'প্রসেসিং সময়', category: 'visa' },
  { en: 'working days', bn: 'কর্মদিবস', category: 'visa' },
  { en: 'days', bn: 'দিন', category: 'visa' },
  { en: 'weeks', bn: 'সপ্তাহ', category: 'visa' },
  { en: 'months', bn: 'মাস', category: 'visa' },
  { en: 'validity', bn: 'মেয়াদ', category: 'visa' },
  { en: 'stay duration', bn: 'অবস্থানের সময়সীমা', category: 'visa' },
  { en: 'entry type', bn: 'এন্ট্রির ধরন', category: 'visa' },
  { en: 'single entry', bn: 'সিঙ্গেল এন্ট্রি', category: 'visa' },
  { en: 'multiple entry', bn: 'মাল্টিপল এন্ট্রি', category: 'visa' },
  { en: 'double entry', bn: 'ডাবল এন্ট্রি', category: 'visa' },
  { en: 'visa fee', bn: 'ভিসা ফি', category: 'visa' },
  { en: 'embassy fee', bn: 'দূতাবাস ফি', category: 'visa' },
  { en: 'service fee', bn: 'সার্ভিস চার্জ', category: 'visa' },
  { en: 'submission', bn: 'আবেদন জমা', category: 'visa' },
  { en: 'biometrics', bn: 'বায়োমেট্রিক', category: 'visa' },
  { en: 'interview required', bn: 'সাক্ষাৎকার আবশ্যক', category: 'visa' },
  { en: 'no interview', bn: 'সাক্ষাৎকার প্রয়োজন নেই', category: 'visa' },

  // ── Required Documents & Requirements ─────────────────────
  { en: 'required documents', bn: 'প্রয়োজনীয় ডকুমেন্টস', category: 'document' },
  { en: 'requirements', bn: 'প্রয়োজনীয় কাগজপত্র ও শর্তাবলী', category: 'document' },
  { en: 'passport', bn: 'পাসপোর্ট', category: 'document' },
  { en: 'passport with at least 6 months validity', bn: 'কমপক্ষে ৬ মাসের মেয়াদসহ মূল পাসপোর্ট', category: 'document' },
  { en: 'valid passport', bn: 'বৈধ পাসপোর্ট', category: 'document' },
  { en: 'old passport', bn: 'পূর্ববর্তী পাসপোর্ট (যদি থাকে)', category: 'document' },
  { en: 'photograph', bn: 'ছবি', category: 'document' },
  { en: 'passport size photo', bn: 'পাসপোর্ট সাইজ ল্যাব প্রিন্ট ছবি (সাদা ব্যাকগ্রাউন্ড)', category: 'document' },
  { en: 'recent passport photo', bn: 'সাম্প্রতিক পাসপোর্ট সাইজ ছবি', category: 'document' },
  { en: 'white background photo', bn: 'সাদা ব্যাকগ্রাউন্ডে ছবি', category: 'document' },
  { en: 'bank statement', bn: 'ব্যাংক স্টেটমেন্ট (বিগত ৬ মাস)', category: 'document' },
  { en: 'bank solvency certificate', bn: 'ব্যাংক সলভেন্সি সার্টিফিকেট', category: 'document' },
  { en: 'financial proof', bn: 'আর্থিক স্বচ্ছলতার প্রমাণপত্র', category: 'document' },
  { en: 'trade license', bn: 'হালনাগাদ ট্রেড লাইসেন্স ও ইংরেজি অনুবাদসহ নোটারাইজড কপি', category: 'document' },
  { en: 'tin certificate', bn: 'টিন সার্টিফিকেট ও ট্যাক্স রিটার্ন প্রাপ্তিস্বীকার', category: 'document' },
  { en: 'visiting card', bn: 'ভিজিটিং কার্ড ও অফিস আইডি কার্ড', category: 'document' },
  { en: 'company letterhead', bn: 'কোম্পানি প্যাড ও ফরওয়ার্ডিং লেটার', category: 'document' },
  { en: 'noc', bn: 'এনওসি (NOC) বা অনাপত্তিপত্র', category: 'document' },
  { en: 'no objection certificate', bn: 'অনাপত্তিপত্র (No Objection Certificate)', category: 'document' },
  { en: 'salary certificate', bn: 'বেতন সনদপত্র (Salary Certificate)', category: 'document' },
  { en: 'pay slip', bn: 'বিগত ৩ মাসের পে স্লিপ', category: 'document' },
  { en: 'marriage certificate', bn: 'বিবাহ সনদ / নিকাহনামা (প্রযোজ্য ক্ষেত্রে)', category: 'document' },
  { en: 'birth certificate', bn: 'জন্ম নিবন্ধন সনদপত্র', category: 'document' },
  { en: 'national id', bn: 'জাতীয় পরিচয়পত্র (NID) কপি', category: 'document' },
  { en: 'nid card', bn: 'এনআইডি কার্ড', category: 'document' },
  { en: 'student id card', bn: 'স্টুডেন্ট আইডি কার্ড ও লিভ লেটার', category: 'document' },
  { en: 'air ticket booking', bn: 'কনফার্মড এয়ার টিকিট বুকিং কপি', category: 'document' },
  { en: 'hotel booking', bn: 'হোটেল বুকিং ভাউচার', category: 'document' },
  { en: 'travel insurance', bn: 'ভ্রমণ বীমা (Travel Insurance)', category: 'document' },
  { en: 'invitation letter', bn: 'আমন্ত্রণপত্র (যদি প্রযোজ্য হয়)', category: 'document' },
  { en: 'vaccine certificate', bn: 'টিকা সনদপত্র', category: 'document' },

  // ── Tour & Travel Services ────────────────────────────────
  { en: 'tour package', bn: 'ট্যুর প্যাকেজ', category: 'tour' },
  { en: 'group tour', bn: 'গ্রুপ ট্যুর', category: 'tour' },
  { en: 'custom tour', bn: 'কাস্টমাইজড ট্যুর', category: 'tour' },
  { en: 'sightseeing', bn: 'দর্শনীয় স্থান ভ্রমণ', category: 'tour' },
  { en: 'itinerary', bn: 'ভ্রমণসূচি (আইটিনারি)', category: 'tour' },
  { en: 'inclusions', bn: 'প্যাকেজে যা যা অন্তর্ভুক্ত', category: 'tour' },
  { en: 'exclusions', bn: 'প্যাকেজে যা যা অন্তর্ভুক্ত নয়', category: 'tour' },
  { en: 'tour guide', bn: 'অভিজ্ঞ ট্যুর গাইড', category: 'tour' },
  { en: 'highlights', bn: 'প্রধান আকর্ষণসমূহ', category: 'tour' },
  { en: 'departure', bn: 'যাত্রা শুরু', category: 'tour' },
  { en: 'return', bn: 'প্রত্যাবর্তন', category: 'tour' },
  { en: 'duration', bn: 'সময়কাল', category: 'tour' },
  { en: 'hotel accommodation', bn: 'হোটেল থাকার ব্যবস্থা', category: 'tour' },
  { en: 'airport transfer', bn: 'বিমানবন্দর পিক অ্যান্ড ড্রপ', category: 'tour' },
  { en: 'breakfast included', bn: 'সকালের নাশতা অন্তর্ভুক্ত', category: 'tour' },
  { en: 'all meals', bn: 'সকল বেলার খাবার', category: 'tour' },

  // ── Hajj & Umrah ──────────────────────────────────────────
  { en: 'hajj package', bn: 'হজ্জ প্যাকেজ', category: 'hajj_umrah' },
  { en: 'umrah package', bn: 'ওমরাহ প্যাকেজ', category: 'hajj_umrah' },
  { en: 'pilgrimage', bn: 'পবিত্র তীর্থযাত্রা', category: 'hajj_umrah' },
  { en: 'makkah', bn: 'পবিত্র মক্কা শরীফ', category: 'hajj_umrah' },
  { en: 'madinah', bn: 'পবিত্র মদিনা মনোয়ারা', category: 'hajj_umrah' },
  { en: 'ziyarah', bn: 'ঐতিহাসিক স্থান জিয়ারত', category: 'hajj_umrah' },
  { en: 'shifting', bn: 'শিফটিং প্যাকেজ', category: 'hajj_umrah' },
  { en: 'non-shifting', bn: 'নন-শিফটিং প্যাকেজ', category: 'hajj_umrah' },
  { en: 'pre-registration', bn: 'প্রাক-নিবন্ধন', category: 'hajj_umrah' },
  { en: 'vip package', bn: 'ভিআইপি প্যাকেজ', category: 'hajj_umrah' },
  { en: 'economy package', bn: 'সাশ্রয়ী প্যাকেজ', category: 'hajj_umrah' },

  // ── Booking & Submission ──────────────────────────────────
  { en: 'new service', bn: 'নতুন সার্ভিস', category: 'booking' },
  { en: 'submit', bn: 'জমা দিন', category: 'booking' },
  { en: 'submit application', bn: 'আবেদন জমা দিন', category: 'booking' },
  { en: 'book now', bn: 'এখনই বুক করুন', category: 'booking' },
  { en: 'view details', bn: 'বিস্তারিত দেখুন', category: 'booking' },
  { en: 'special requests', bn: 'বিশেষ অনুরোধ বা চাহিদা', category: 'booking' },
  { en: 'notes', bn: 'মন্তব্য বা অতিরিক্ত তথ্য', category: 'booking' },
  { en: 'number of guests', bn: 'যাত্রীর সংখ্যা', category: 'booking' },
  { en: 'adults', bn: 'প্রাপ্তবয়স্ক', category: 'booking' },
  { en: 'children', bn: 'শিশু', category: 'booking' },
  { en: 'total price', bn: 'মোট মূল্য', category: 'booking' },
  { en: 'confirmed', bn: 'নিশ্চিতকৃত', category: 'booking' },
  { en: 'pending', bn: 'অপেক্ষমাণ', category: 'booking' },
  { en: 'active', bn: 'সক্রিয়', category: 'booking' },
  { en: 'inactive', bn: 'নিষ্ক্রিয়', category: 'booking' },
];

/** Fast lookup map normalized to lowercase */
export const BANGLA_DICTIONARY_MAP: Record<string, string> = MANUAL_BANGLA_WORDS.reduce(
  (acc, item) => {
    acc[item.en.toLowerCase().trim()] = item.bn;
    return acc;
  },
  {} as Record<string, string>,
);

/**
 * Given an English string, attempts to find an exact manual Bangla translation
 * or performs intelligent phrase-level replacements based on the manual dictionary.
 */
export function translateWithManualDictionary(input: string): string | null {
  if (!input || !input.trim()) return '';
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  // 1. Direct match
  if (BANGLA_DICTIONARY_MAP[lower]) {
    return BANGLA_DICTIONARY_MAP[lower];
  }

  // 2. Multi-word phrase replacement (longest matches first)
  let result = trimmed;
  let hasReplaced = false;

  const sortedKeys = Object.keys(BANGLA_DICTIONARY_MAP).sort((a, b) => b.length - a.length);

  for (const phrase of sortedKeys) {
    if (phrase.length < 3) continue;
    const regex = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, 'gi');
    if (regex.test(result)) {
      result = result.replace(regex, BANGLA_DICTIONARY_MAP[phrase]);
      hasReplaced = true;
    }
  }

  return hasReplaced ? result : null;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
