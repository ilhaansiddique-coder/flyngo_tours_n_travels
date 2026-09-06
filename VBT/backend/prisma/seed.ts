import { PrismaClient, Prisma, ProductType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function upsertSetting(key: string, value: Prisma.InputJsonValue) {
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

async function main() {
  console.log('==> VBT seed running...');

  // ---------------------------------------------------------------------------
  // Admin
  // ---------------------------------------------------------------------------
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@vbt.world';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: { email: adminEmail, passwordHash, name: 'VBT Admin' },
  });
  console.log(`    - admin: ${adminEmail}`);

  // ---------------------------------------------------------------------------
  // Site settings (site --wide configuration)
  // ---------------------------------------------------------------------------
  await upsertSetting('site', {
    name: 'Volunteer Bangladesh Trust',
    nameBn: 'ভলান্টিয়ার বাংলাদেশ ট্রাস্ট',
    sloganEn: 'Cleanliness is half of faith — for Humanity',
    sloganBn: 'পরিচ্ছন্নতা ঈমানের অর্ধেক — মানবতার জন্য',
    description:
      'A registered non-political, non-profit religious charity organisation devoted to education, Dawah and full-scale human welfare.',
    descriptionBn:
      'শিক্ষা, দাওয়াহ এবং সর্বাঙ্গীণ মানবকল্যাণে নিবেদিত একটি নিবন্ধিত, অরাজনৈতিক, অলাভজনক সেবামূলক প্রতিষ্ঠান।',
    founded: 2017,
    registration: 'S-13111/2019',
    chairman: 'Shaykh Ahmadullah',
    email: 'info@volunteerbdtrust.org',
    phone: '01970534363',
    addressLine1: 'HM Plaza (11th Floor), Rajlaxmi, Uttara',
    addressLine2: 'Dhaka, Bangladesh',
    socials: {
      facebook: 'https://www.facebook.com/volunteerbdtrust',
      youtube: 'https://www.youtube.com/@VolunteerBangladeshTrust',
      linkedin: 'https://www.linkedin.com/company/volunteer-bangladesh-trust',
      twitter: '#',
    },
    footer: {
      about:
        'Volunteer Bangladesh Trust is a government-registered Bangladeshi charity in education, Dawah and service, following the path of the Salaf as-Salih.',
    },
  });

  await upsertSetting('zakatNisab', {
    gold: 105000,
    silver: 75000,
    currency: 'BDT',
    updatedLabel: 'Updated quarterly',
  });

  await upsertSetting('contact', {
    officeHours: 'Sat – Thu, 9:00 AM – 5:00 PM',
    hotline: '01970534363',
    bankInfo: {
      bank: 'Prime Bank PLC',
      accountName: 'Volunteer Bangladesh Trust (Welfare Account)',
      accountNumber: '1202 1500 0088',
      routing: '170260413',
    },
    paymentNote:
      'After donating via bKash/Nagad/SSLCommerz or bank transfer, keep the transaction reference for your records.',
  });

  await upsertSetting('connect', {
    titleEn: 'Get Involved',
    titleBn: 'নিয়ে যুক্ত হন',
    subtitleEn:
      'Every bit of support — time, money or skill — keeps the Ummah moving with the Sunnah.',
    subtitleBn:
      'আপনার সাহায্য — সময়, অর্থ কিংবা দক্ষতা — উম্মাহকে সুন্নাহর সাথে রাখে।',
    items: [
      {
        icon: 'heart-handshake',
        titleEn: 'Monthly Donor',
        titleBn: 'নিয়মিত দাতা',
        link: '/donate',
        buttonEn: 'Join',
        buttonBn: 'যোগ দিন',
      },
      {
        icon: 'users',
        titleEn: 'Volunteer',
        titleBn: 'স্বেচ্ছাসেবক',
        link: '/get-involved?active=volunteer',
        buttonEn: 'Apply',
        buttonBn: 'আবেদন',
      },
      {
        icon: 'briefcase',
        titleEn: 'Career',
        titleBn: 'চাকরি',
        link: '/get-involved?active=career',
        buttonEn: 'Apply',
        buttonBn: 'আবেদন',
      },
      {
        icon: 'graduation',
        titleEn: 'Courses',
        titleBn: 'কোর্সসমূহ',
        link: '/activities',
        buttonEn: 'Explore',
        buttonBn: 'ঘুরে দেখুন',
      },
    ],
  });

  await upsertSetting('newsletter', {
    titleEn: 'Stay in the loop with our latest updates',
    titleBn: 'সাম্প্রতিক আপডেট পেতে আমাদের সাথে থাকুন',
    placeholderEn: 'Enter your email address',
    placeholderBn: 'আপনার ইমেইল লিখুন',
    buttonEn: 'Subscribe',
    buttonBn: 'সাবস্ক্রাইব',
  });

  await upsertSetting('memberCategories', [
    {
      key: 'general',
      labelEn: 'General Member',
      labelBn: 'সাধারণ সদস্য',
      fee: 1000,
      descEn: 'Annual membership',
      descBn: 'বাৎসরিক সদস্যপদ',
    },
    {
      key: 'donor',
      labelEn: 'Donor Member',
      labelBn: 'দাতা সদস্য',
      fee: 500000,
      descEn: 'Annual donor membership',
      descBn: 'বাৎসরিক দাতা সদস্যপদ',
    },
    {
      key: 'lifetime',
      labelEn: 'Lifetime Member',
      labelBn: 'আজীবন সদস্য',
      fee: 100000,
      descEn: 'One-time lifetime membership',
      descBn: 'এককালীন আজীবন সদস্যপদ',
    },
    {
      key: 'volunteer',
      labelEn: 'Volunteer',
      labelBn: 'স্বেচ্ছাসেবক',
      fee: 300,
      descEn: 'Annual volunteer form',
      descBn: 'বাৎসরিক স্বেচ্ছাসেবক ফরম',
    },
  ]);

  // Demo portal user (used for sign-in testing; member photo uploads / password
  // reset rely on SMTP, so a reset token is returned in dev when unconfigured).
  await prisma.user.upsert({
    where: { email: 'demo@vbt.world' },
    update: {},
    create: {
      email: 'demo@vbt.world',
      name: 'Demo Volunteer',
      phone: '+880 1700-000000',
      role: 'USER',
      passwordHash: await bcrypt.hash('demo1234', 10),
    },
  });

  const saintMartinSections: Prisma.InputJsonValue = [
    {
      type: 'text',
      headingEn: 'Details',
      headingBn: 'বিস্তারিত',
      bodyEn:
        'Dates: 9, 10 & 11 October 2026.\nDays: Friday, Saturday & Sunday.\nPlaces: Saint Martin | Teknaf | Cox’s Bazar.',
      bodyBn:
        'তারিখ: ০৯, ১০ ও ১১ অক্টোবর ২০২৬\nরোজ: শুক্রবার, শনিবার ও রবিবার\nস্থান: সেন্টমার্টিন | টেকনাফ | কক্সবাজার',
    },
    {
      type: 'text',
      headingEn: 'What this 3-day trip includes',
      headingBn: 'এই ৩ দিনের ট্রিপে থাকছে',
      bodyEn:
        'Social work, cleanliness activities, environmental awareness, free medical service, free blood grouping, island sightseeing, getting to know new people, food cooked by our own cook, and free time to explore on your own.',
      bodyBn:
        '• সামাজিক কাজ\n• পরিচ্ছন্নতা কার্যক্রম\n• পরিবেশ সচেতনতা\n• বিনামূল্যে মেডিকেল সেবা\n• ফ্রি ব্লাড গ্রুপিং\n• দ্বীপ ভ্রমণ\n• নতুন মানুষের সঙ্গে পরিচিত হওয়া\n• নিজস্ব বাবুর্চির রান্না\n• অবসর সময়ে নিজের মতো করে ঘোরাফেরা',
    },
    {
      type: 'text',
      headingEn: 'Our programmes',
      headingBn: 'আমাদের কার্যক্রম',
      bodyEn:
        'Cleanliness, free blood grouping & medical camp campaign at Saint Martin Island: 9 October, 7:00 PM.\nOpen meeting on cleanliness at Saint Martin Island: 9 October, 10:00 PM.\nCleanliness drive at Saint Martin Island: 10 & 11 October, 5:00–8:00 AM.\nFree blood grouping & medical camp at Saint Martin Island: 10 October, 11:00 AM & 5:00 PM.\nFree blood grouping & medical camp at Shahpari Island: 11 October, 11:00 AM–2:00 PM.\nEnvironmental awareness rally at Cox’s Bazar: 11 October, 7:00 PM.',
      bodyBn:
        '• সেন্টমার্টিন দ্বীপে পরিচ্ছন্নতা, ফ্রি ব্লাড গ্রুপ ও মেডিকেল ক্যাম্প প্রচারণা: ০৯ অক্টোবর, সন্ধ্যা ৭ টায়।\n• সেন্টমার্টিন দ্বীপে পরিচ্ছন্নতা বিষয়ক খোলা বৈঠক: ০৯ অক্টোবর, রাত ১০ টায়।\n• সেন্টমার্টিন দ্বীপে পরিচ্ছন্নতা কার্যক্রম: ১০ ও ১১ অক্টোবর, ভোর ৫টা–সকাল ৮টা।\n• সেন্টমার্টিন দ্বীপে ফ্রি ব্লাড গ্রুপ ও মেডিকেল ক্যাম্প: ১০ অক্টোবর, সকাল ১১টা ও বিকেল ৫টা।\n• শাহপরীর দ্বীপে ফ্রি ব্লাড গ্রুপ ও মেডিকেল ক্যাম্প: ১১ অক্টোবর, সকাল ১১টা–দুপুর ২টা।\n• কক্সবাজারে পরিবেশ সচেতনতা শোভাযাত্রা: ১১ অক্টোবর, সন্ধ্যা ৭টা।',
    },
    {
      type: 'text',
      headingEn: 'Travel itinerary',
      headingBn: 'ভ্রমণ সময়সূচি',
      bodyEn:
        'Departure Dhaka → Teknaf: 8 October, Thursday | 8:00 PM, Fakirapool (AC bus).\nTeknaf → Saint Martin: 9 October, Friday | 3:00 PM (trawler after lunch).\nArrive Saint Martin & campaign: 9 October, Friday | rest after dinner.\nSaint Martin → Shahpari Island: 11 October, Sunday | 10:00 AM.\nShahpari Island → Cox’s Bazar: 11 October, Sunday | 3:00 PM (after lunch).\nCox’s Bazar → Dhaka: 11 October, Sunday | 9:00 PM.',
      bodyBn:
        '• ঢাকা থেকে টেকনাফ যাত্রা: ০৮ অক্টোবর, বৃহস্পতিবার | রাত ৮টা, ফকিরাপুল (এসি বাস)\n• টেকনাফ থেকে সেন্টমার্টিন যাত্রা: ০৯ অক্টোবর, শুক্রবার | বিকাল ৩টা (দুপুরের খাবার শেষে ট্রলার)\n• সেন্টমার্টিন পৌঁছানো ও প্রচারণা: ০৯ অক্টোবর, শুক্রবার | রাতের খাবার শেষে বিশ্রাম\n• সেন্টমার্টিন থেকে শাহপরীর দ্বীপ যাত্রা: ১১ অক্টোবর, রবিবার | সকাল ১০টা\n• শাহপরীর দ্বীপ থেকে কক্সবাজার যাত্রা: ১১ অক্টোবর, রবিবার | দুপুর ৩টা (লাঞ্চ শেষে)\n• কক্সবাজার থেকে ঢাকা যাত্রা: ১১ অক্টোবর, রবিবার | রাত ৯টা',
    },
    {
      type: 'text',
      headingEn: 'Important note',
      headingBn: 'বিশেষ দ্রষ্টব্য',
      bodyEn:
        'Those who wish to stay in Cox’s Bazar on the way back may do so at their own responsibility and cost. However, bus tickets will not be refunded.',
      bodyBn:
        'ফিরে আসার সময় যারা কক্সবাজারে থাকতে চান, তারা নিজ দায়িত্বে ও নিজ খরচে থাকতে পারবেন। তবে বাসের টিকিট রিফান্ড হবে না।',
    },
    {
      type: 'text',
      headingEn: 'Why go with us?',
      headingBn: 'কেন আমাদের সঙ্গে যাবেন?',
      bodyEn:
        'This time there is comparatively less tourist pressure in Saint Martin, so:\n• Social and cleanliness work becomes easier.\n• Island sightseeing becomes more enjoyable.\n• With less crowd, the cost is comparatively lower.\n• Free time to roam around on your own.\n• A safe and comfortable environment.\n• The chance to combine travel and multiple social works.\nMany who have travelled with us before have said — “This was one of the best trips of our lives.”\nUsually around 50% of our team are new and 50% are returning members, with a balanced participation of men and women.\nApart from work time, there will be free time to roam the island on your own.',
      bodyBn:
        'এই সময়ে সেন্টমার্টিনে পর্যটকের চাপ তুলনামূলক কম থাকায়—\n• সামাজিক কাজ ও পরিচ্ছন্নতা কার্যক্রম সহজে করা যায়।\n• দ্বীপে ঘোরাফেরা আরও আনন্দদায়ক হয়।\n• ভিড় কম থাকায় খরচ তুলনামূলক কম।\n• অবসর সময়ে নিজের মতো করে ঘোরার সুযোগ।\n• নিরাপদ ও স্বাচ্ছন্দ্যময় পরিবেশ।\n• ভ্রমণ ও একাধিক সামাজিক কাজ একসঙ্গে করার সুযোগ।\nইতিপূর্বে যারা আমাদের সঙ্গে গিয়েছেন, তাদের অনেকেই বলেছেন— “এটি ছিল আমাদের জীবনের সেরা ট্রিপগুলোর একটি”।\nআমাদের টিমে সাধারণত প্রায় ৫০% নতুন এবং ৫০% পুরোনো সদস্য থাকেন। পাশাপাশি দলে নারী-পুরুষের অংশগ্রহণ থাকে একটি ভারসাম্যপূর্ণ পরিবেশে।\nকাজের সময় বাদে বাকি সময়ে নিজের মতো করে দ্বীপ ঘুরে দেখার সুযোগ থাকবে।',
    },
    {
      type: 'text',
      headingEn: 'Special instructions',
      headingBn: 'বিশেষ নির্দেশনা',
      bodyEn:
        '• Due to weather or adverse conditions the schedule may change.\n• The main purpose of the trip is participating in social work, so every participant must especially take part in the cleanliness drive.\n• Those who cannot take part due to dust allergy or any other reason will be charged an extra ৳500.\n• You must contribute to collecting at least 2 sacks of waste over the two days.\n• Special gifts await those with the greatest contribution to the cleanliness campaign.',
      bodyBn:
        '• কোনো কারণে আবহাওয়ার পরিবর্তন বা প্রতিকূল পরিস্থিতি সৃষ্টি হলে ভ্রমণের সময়সূচি পরিবর্তন হতে পারে।\n• সফরের অন্যতম প্রধান উদ্দেশ্য হলো সামাজিক কাজে অংশগ্রহণ করা। তাই প্রত্যেক অংশগ্রহণকারীর জন্য বিশেষ করে পরিচ্ছন্নতা অভিযানে অংশগ্রহণ করা আবশ্যক।\n• যারা ময়লার অ্যালার্জি বা অন্য কোনো কারণে পরিচ্ছন্নতা কার্যক্রমে অংশগ্রহণ করতে পারবেন না, তাদের জন্য অতিরিক্ত ৫০০ টাকা প্রযোজ্য হবে।\n• দুই দিনে কমপক্ষে ২ বস্তা বর্জ্য সংগ্রহে অবদান রাখার লক্ষ্য নিয়ে পরিচ্ছন্নতা কার্যক্রমে অংশগ্রহণ করতে হবে।\n• পরিচ্ছন্নতা অভিযানে যারা সর্বাধিক ও উল্লেখযোগ্য অবদান রাখবেন, তাদের জন্য থাকবে বিশেষ উপহার।',
    },
    {
      type: 'text',
      headingEn: 'Important rules',
      headingBn: 'গুরুত্বপূর্ণ নিয়মাবলী',
      bodyEn:
        '• Participants must have the mindset to take part in social and specially cleanliness work.\n• People associated with social organisations will be given priority.\n• Last date to confirm a seat: 24 September 2026 (limited seats).\n• 50% advance of the total cost must be paid by 24 September; the rest is due at the start of the trip.\n• You must be ready for trawler travel.\n• Respectful and sympathetic behaviour between men and women is mandatory.\n• Not suitable for children (below 5), the elderly, the sick or pregnant women.\n• Bring a cap, gamcha, light clothes, sunglasses and sunscreen for the heat.\n• The trip may be cancelled or changed if the weather turns bad.\n• Social bodies may bring their own banners and festoons, but designs must be approved first.',
      bodyBn:
        '• অংশগ্রহণকারীদের সামাজিক কাজ বিশেষ করে পরিচ্ছন্নতা কাজে অংশগ্রহণের মানসিকতা থাকতে হবে।\n• সামাজিক সংগঠনের সঙ্গে যুক্ত ব্যক্তিদের অগ্রাধিকার দেওয়া হবে।\n• আসন নিশ্চিত করার শেষ তারিখ: ২৪ সেপ্টেম্বর ২০২৬। (সীমিত আসন)\n• ২৪ সেপ্টেম্বরের মধ্যে মোট খরচের ৫০% অগ্রিম প্রদান করতে হবে। বাকি টাকা ভ্রমণ শুরুর সময় প্রদান করতে হবে।\n• ট্রলারে ভ্রমণের মানসিকতা থাকতে হবে।\n• নারী ও পুরুষদের মধ্যে সম্মানসূচক ও সহানুভূতিশীল আচরণ আবশ্যক।\n• শিশু (৫ বছরের নিচে), বৃদ্ধ, অসুস্থ বা গর্ভবতী নারীদের জন্য সফর উপযোগী নয়।\n• গরমের জন্য ক্যাপ, গামছা, হালকা কাপড়, সানগ্লাস ও সানস্ক্রিন সাথে নিতে হবে।\n• আবহাওয়া খারাপ হলে যাত্রা বাতিল বা পরিবর্তন করা হতে পারে। এ বিষয়ে পরবর্তী সময়ে সিদ্ধান্ত জানানো হবে।\n• সামাজিক প্রতিষ্ঠান ও সংগঠনগুলো নিজস্ব ব্যানার ও ফেস্টুন বহন করতে পারবে। তবে ডিজাইন আগে অনুমোদন করাতে হবে।',
    },
    {
      type: 'text',
      headingEn: 'Registration',
      headingBn: 'রেজিস্ট্রেশন',
      bodyEn:
        'Limited seats — so contact us quickly to confirm your seat.\nFor any need:\n• Shahadat – 01681635657\n• Sipon – 01745320041\n• Sohel – 01681845999',
      bodyBn:
        'সীমিত আসন। তাই আসন নিশ্চিত করতে দ্রুত যোগাযোগ করুন।\nযে কোনো প্রয়োজনে যোগাযোগ:\n• শাহাদাৎ – ০১৬৮১৬৩৫৬৫৭\n• সিপন – ০১৭৪৫৩২০০৪১\n• সোহেল – ০১৬৮১৮৪৫৯৯৯',
    },
    {
      type: 'form',
      headingEn: 'Register for the trip',
      headingBn: 'ভ্রমণের জন্য নিবন্ধন করুন',
      bodyEn:
        'Fill in the form below. Limited seats — confirm your seat by 24 September 2026 with 50% advance payment.',
      bodyBn:
        'নিচের ফরমটি পূরণ করুন। সীমিত আসন — ২৪ সেপ্টেম্বর ২০২৬-এর মধ্যে মোট খরচের ৫০% অগ্রিম প্রদান সাপেক্ষে আসন নিশ্চিত হবে।',
      googleFormUrl:
        'https://docs.google.com/forms/d/e/1FAIpQLScYa6hk-0SXZxmnxTREHGl8N8t7g5U_uNsh9kBanzB_djGL4Q/viewform',
      googleFormResponseUrl:
        'https://docs.google.com/forms/d/e/1FAIpQLScYa6hk-0SXZxmnxTREHGl8N8t7g5U_uNsh9kBanzB_djGL4Q/formResponse',
      fbzx: '-4848356108472141880',
    },
    {
      type: 'text',
      headingEn: 'Trip cost',
      headingBn: 'ভ্রমণ খরচ',
      bodyEn:
        'Regular: BDT 6,250/person (AC Bus, Trawler & 4-person room)\nCouple Room: BDT 7,250/person (AC Bus, Trawler & 2-person room)\nChildren: Bus seat & meals charged separately.',
      bodyBn:
        '• রেগুলার: ৬,২৫০ টাকা/জন (এসি বাস, ট্রলার ও ৪ জনের রুম)\n• কাপল রুম: ৭,২৫০ টাকা/জন (এসি বাস, ট্রলার ও ২ জনের রুম)\n• শিশু: বাসের সিট ও খাবার আলাদাভাবে চার্জ করা হবে।',
    },
    {
      type: 'text',
      headingEn: 'Volunteer Bangladesh Trust',
      headingBn: 'ভলান্টিয়ার বাংলাদেশ ট্রাস্ট',
      bodyEn:
        'May the trip be joyful, and the work for humanity.\n\nVolunteer Bangladesh Trust — for Humanity.',
      bodyBn: 'ভ্রমণ হোক আনন্দের, কাজ হোক মানবতার।\n\nভলান্টিয়ার বাংলাদেশ ট্রাস্ট\nমানবতার জন্য',
    },
  ];

  await prisma.landingPage.upsert({
    where: { slug: 'saint-martin-trip-2026' },
    update: {
      published: true,
      titleEn: 'Saint Martin Cleanliness Drive & Free Medical Camp 2026',
      titleBn: 'সেন্টমার্টিন পরিচ্ছন্নতা অভিযান ও ফ্রি মেডিকেল ক্যাম্প-২০২৬',
      subtitleEn:
        'Volunteer Bangladesh Trust presents Saint Martin Cleanliness Drive & Free Medical Camp 2026 — a 3-day trip (9, 10 & 11 October 2026) combining social service, environmental awareness, free blood grouping, free medical camp and island sightseeing at Saint Martin, Teknaf & Cox’s Bazar.',
      subtitleBn:
        'ভলান্টিয়ার বাংলাদেশ ট্রাস্টের আয়োজনে সেন্টমার্টিন পরিচ্ছন্নতা অভিযান ও ফ্রি মেডিকেল ক্যাম্প-২০২৬ — সেন্টমার্টিন, টেকনাফ ও কক্সবাজারে সামাজিক কাজ, পরিবেশ সচেতনতা, ফ্রি ব্লাড গ্রুপিং, ফ্রি মেডিকেল ক্যাম্প ও দ্বীপ ভ্রমণসহ ৩ দিনের (০৯, ১০ ও ১১ অক্টোবর ২০২৬) আনন্দময় সফর।',
      sections: saintMartinSections,
    },
    create: {
      slug: 'saint-martin-trip-2026',
      titleEn: 'Saint Martin Cleanliness Drive & Free Medical Camp 2026',
      titleBn: 'সেন্টমার্টিন পরিচ্ছন্নতা অভিযান ও ফ্রি মেডিকেল ক্যাম্প-২০২৬',
      subtitleEn:
        'Volunteer Bangladesh Trust presents Saint Martin Cleanliness Drive & Free Medical Camp 2026 — a 3-day trip (9, 10 & 11 October 2026) combining social service, environmental awareness, free blood grouping, free medical camp and island sightseeing at Saint Martin, Teknaf & Cox’s Bazar.',
      subtitleBn:
        'ভলান্টিয়ার বাংলাদেশ ট্রাস্টের আয়োজনে সেন্টমার্টিন পরিচ্ছন্নতা অভিযান ও ফ্রি মেডিকেল ক্যাম্প-২০২৬ — সেন্টমার্টিন, টেকনাফ ও কক্সবাজারে সামাজিক কাজ, পরিবেশ সচেতনতা, ফ্রি ব্লাড গ্রুপিং, ফ্রি মেডিকেল ক্যাম্প ও দ্বীপ ভ্রমণসহ ৩ দিনের (০৯, ১০ ও ১১ অক্টোবর ২০২৬) আনন্দময় সফর।',
      published: true,
      order: 0,
      sections: saintMartinSections,
    },
  });

  // ---------------------------------------------------------------------------
  // Hero
  // ---------------------------------------------------------------------------
  await prisma.hero.upsert({
    where: { id: 'hero-default' },
    update: {},
    create: {
      id: 'hero-default',
      titleEn: 'Quran, Sunnah & Building the Ummah',
      titleBn: 'কুরআন-সুন্নাহ ও উম্মাহ গঠন',
      descriptionEn:
        'A registered Bangladeshi charity serving the Ummah through authentic Islamic knowledge, education and humanitarian relief.',
      descriptionBn:
        'প্রামাণিক ইসলামী জ্ঞান, শিক্ষা ও মানবসেবার মাধ্যমে উম্মাহর সেবায় নিবেদিত একটি নিবন্ধিত বাংলাদেশি সেবা সংস্থা।',
      taglineEn: 'For the',
      taglineBn: 'উম্মাহর',
      highlightEn: 'Ummah, with the Sunnah',
      highlightBn: 'স্বার্থে সুন্নাহর সাথে',
      ctaPrimaryText: 'Know More',
      ctaPrimaryLink: '/about',
      ctaSecondaryText: 'All Projects',
      ctaSecondaryLink: '/activities',
      backgroundImage: '/images/home/hero-bg.svg',
    },
  });

  // About section
  const aboutSectionId = 'about-default';
  const aboutItems: Prisma.InputJsonValue = [
    {
      icon: 'book-open',
      titleEn: 'Knowledge',
      titleBn: 'শিক্ষা',
      descEn:
        'Spreading authentic Quran & Sunnah education through institutes, courses and publications.',
      descBn:
        'প্রতিষ্ঠান, কোর্স ও প্রকাশনার মাধ্যমে প্রামাণিক কুরআন-সুন্নাহ শিক্ষা ছড়িয়ে দেওয়া।',
    },
    {
      icon: 'hand-heart',
      titleEn: 'Service',
      titleBn: 'সেবা',
      descEn:
        'Qurbani for all, iftar, winter relief, safe water and emergency disaster response nationwide.',
      descBn:
        'সবার জন্য কুরবানী, ইফতার, শীতবস্ত্র, বিশুদ্ধ পানি ও দেশব্যাপী জরুরি দুর্যোগ সেবা।',
    },
    {
      icon: 'mosque',
      titleEn: 'Dawah',
      titleBn: 'দাওয়াহ',
      descEn:
        'Inviting people to the middle path of the Quran and Sunnah with wisdom and good counsel.',
      descBn:
        'প্রজ্ঞা ও উত্তম উপদেশের মাধ্যমে কুরআন-সুন্নাহর মধ্যম পথে মানুষকে আহ্বান।',
    },
  ];
  await prisma.aboutSection.upsert({
    where: { id: aboutSectionId },
    update: { items: aboutItems },
    create: {
      id: aboutSectionId,
      taglineEn: 'Cleanliness is half of faith — for Humanity',
      taglineBn: 'পরিচ্ছন্নতা ঈমানের অর্ধেক — মানবতার জন্য',
      titleEn: 'Who we are',
      titleBn: 'আমরা কারা',
      contentEn:
        'Founded in 2017 and registered under the Trust Act, Volunteer Bangladesh Trust is a non-political, non-profit service organisation led by Shaykh Ahmadullah. Our three pillars are education, service and Dawah — always walking the moderate path of the Salaf.',
      contentBn:
        '২০১৭ সালে প্রতিষ্ঠিত, আইন অনুযায়ী নিবন্ধিত ভলান্টিয়ার বাংলাদেশ ট্রাস্ট শাইখ আহমাদুল্লাহর নেতৃত্বে পরিচালিত একটি অরাজনৈতিক, অলাভজনক সেবা সংস্থা। আমাদের তিনটি স্তম্ভ — শিক্ষা, সেবা ও দাওয়াহ; সর্বদা সালাফের মধ্যম পথে।',
      image: '/images/home/about-team.svg',
      items: aboutItems,
    },
  });

  // ---------------------------------------------------------------------------
  // Institutions
  // ---------------------------------------------------------------------------
  const institutions = [
    {
      name: 'Volunteer Bangladesh Trust Skill Development Institute',
      website: 'https://skill.volunteerbdtrust.org',
      description:
        'National Skill Development Authority registered institute (STP-DHA-00877) training and placing youth in IT & technical trades.',
      logo: '/images/institutions/skill.svg',
    },
    {
      name: 'Madrasatus-Sunnah',
      website: 'https://madrasatussunnah.org',
      description:
        'A unique madrasah shaping the next generation with authentic Islamic knowledge and modern education side by side.',
      logo: '/images/institutions/madrasah.svg',
    },
    {
      name: 'IQA — Institute of Quranic Affairs',
      website: 'https://iqa.info',
      description:
        'A dedicated institute for researching, translating and spreading the meanings of the Quran.',
      logo: '/images/institutions/iqa.svg',
    },
  ];
  for (let i = 0; i < institutions.length; i++) {
    const inst = institutions[i];
    await prisma.institution.upsert({
      where: { name: inst.name },
      update: { ...inst, order: i },
      create: { ...inst, order: i },
    });
  }

  // ---------------------------------------------------------------------------
  // Activities
  // ---------------------------------------------------------------------------
  const activities = [
    {
      slug: 'skill-development-institute',
      titleEn: 'Volunteer Bangladesh Trust Skill Development Institute',
      titleBn: 'ভলান্টিয়ার বাংলাদেশ ট্রাস্ট স্কিল ডেভেলপমেন্ট ইনস্টিটিউট',
      tagEn: 'Regular program',
      tagBn: 'নিয়মিত কার্যক্রম',
      excerptEn:
        'IT, driving, chef, videography, English and technical courses that turn unemployed youth into skilled workers.',
      excerptBn:
        'আইটি, ড্রাইভিং, শেফ, ভিডিওগ্রাফি, ইংরেজি ও কারিগরি কোর্সের মাধ্যমে কর্মহীন যুবকদের দক্ষ জনশক্তিতে রূপান্তর।',
      image: '/images/activities/skill.svg',
      featured: true,
    },
    {
      slug: 'qurbani-for-all',
      titleEn: 'Qurbani for All',
      titleBn: 'সবার জন্য কুরবানী',
      tagEn: 'Annual program',
      tagBn: 'বার্ষিক কার্যক্রম',
      excerptEn:
        'Every year thousands of underprivileged families receive a share of Qurbani meat in the days of Eid.',
      excerptBn:
        'প্রতি বছর ঈদের দিনগুলোতে হাজারো অসহায় পরিবারের কাছে পৌঁছে দেওয়া হয় কুরবানীর গোশত।',
      image: '/images/activities/qurbani.svg',
      featured: true,
    },
    {
      slug: 'iftar-distribution',
      titleEn: 'Iftar Distribution',
      titleBn: 'ইফতার বিতরণ',
      tagEn: 'Annual program',
      tagBn: 'বার্ষিক কার্যক্রম',
      excerptEn:
        'Hot iftar served to fasting people on streets, in mosques and in poor neighbourhoods every Ramadan.',
      excerptBn:
        'প্রতি রমজানে পথে, মসজিদে ও অসচ্ছল এলাকায় রোজাদারদের জন্য গরম ইফতারের আয়োজন।',
      image: '/images/activities/iftar.svg',
      featured: true,
    },
    {
      slug: 'winter-clothes-distribution',
      titleEn: 'Winter Clothes Distribution',
      titleBn: 'শীতবস্ত্র বিতরণ',
      tagEn: 'Seasonal program',
      tagBn: 'মৌসুমি কার্যক্রম',
      excerptEn:
        'Blankets and warm clothes reach the cold-stricken poor across the northern districts every winter.',
      excerptBn:
        'প্রতি শীতে উত্তরাঞ্চলের দুঃস্থ মানুষের কাছে পৌঁছে দেওয়া হয় কম্বল ও শীতবস্ত্র।',
      image: '/images/activities/winter.svg',
      featured: false,
    },
    {
      slug: 'tree-plantation',
      titleEn: 'Tree Plantation',
      titleBn: 'বৃক্ষরোপণ',
      tagEn: 'Environment program',
      tagBn: 'পরিবেশ কার্যক্রম',
      excerptEn:
        'Hundreds of thousands of fruit and timber saplings planted nationwide to heal the environment.',
      excerptBn:
        'পরিবেশ রক্ষায় সারা দেশে লক্ষ লক্ষ ফল ও কাঠ-গাছের চারা রোপণ।',
      image: '/images/activities/tree.svg',
      featured: false,
    },
    {
      slug: 'flood-relief',
      titleEn: 'Emergency Flood Relief',
      titleBn: 'জরুরি বন্যা ত্রাণ',
      tagEn: 'Emergency response',
      tagBn: 'জরুরি সেবা',
      excerptEn:
        'Reaching flood-hit families with food, pure water, medicine and shelter during national emergencies.',
      excerptBn:
        'দুর্যোগে পানি-বন্দি মানুষের কাছে খাদ্য, বিশুদ্ধ পানি, ওষুধ ও আশ্রয় পৌঁছে দেওয়া।',
      image: '/images/activities/relief.svg',
      featured: true,
    },
    {
      slug: 'tubewell-and-water',
      titleEn: 'Tubewell & Water Purifier Installation',
      titleBn: 'নলকূপ ও পানি শোধনাগার স্থাপন',
      tagEn: 'Safe water program',
      tagBn: 'সুপেয় পানি কার্যক্রম',
      excerptEn:
        'Arsenic-free safe drinking water for villages through tubewells and water purifiers.',
      excerptBn:
        'নলকূপ ও পানি শোধনাগারের মাধ্যমে গ্রামাঞ্চলে আর্সেনিকমুক্ত নিরাপদ পানি।',
      image: '/images/activities/water.svg',
      featured: false,
    },
    {
      slug: 'self-reliance',
      titleEn: 'Self-reliance & Entrepreneurship',
      titleBn: 'আত্মকর্মসংস্থান ও উদ্যোক্তা',
      tagEn: 'Livelihood program',
      tagBn: 'জীবিকা কার্যক্রম',
      excerptEn:
        'Rickshaw vans, sewing machines, shop tools and micro-grants that make people breadwinners again.',
      excerptBn:
        'রিকশা-ভ্যান, সেলাই মেশিন, দোকান সরঞ্জাম ও ক্ষুদ্র অনুদান দিয়ে মানুষের আবারও রোজগার সচল।',
      image: '/images/activities/self-reliance.svg',
      featured: false,
    },
    {
      slug: 'scholarships',
      titleEn: 'Scholarships for Outstanding Students',
      titleBn: 'মেধাবী শিক্ষার্থীদের জন্য বৃত্তি',
      tagEn: 'Education program',
      tagBn: 'শিক্ষা কার্যক্রম',
      excerptEn:
        'Merit-based and need-based scholarships keep talented students of hifz, madrasah and academia learning.',
      excerptBn:
        'মেধা ও প্রয়োজনের ভিত্তিতে বৃত্তি পেয়ে হিফজ, মাদরাসা ও সাধারণ শিক্ষার মেধাবী শিক্ষার্থীরা শেখা চালিয়ে যায়।',
      image: '/images/activities/scholarship.svg',
      featured: false,
    },
  ];
  for (let i = 0; i < activities.length; i++) {
    const a = activities[i];
    const contentEn = `${a.excerptEn}\n\nBismillah, this activity is run by the volunteers and donors of Volunteer Bangladesh Trust. Funds are spent transparently and every programme is audited. Join us — your support makes it happen.`;
    const contentBn = `${a.excerptBn}\n\nভলান্টিয়ার বাংলাদেশ ট্রাস্টের স্বেচ্ছাসেবক ও দাতাদের মাধ্যমে এই কার্যক্রম পরিচালিত হয়। প্রতিটি কার্যক্রমের অর্থ স্বচ্ছভাবে ব্যয় হয় এবং নিরীক্ষা করা হয়। আপনার সাহায্যই একে সম্ভব করে।`;
    await prisma.activity.upsert({
      where: { slug: a.slug },
      update: { ...a, contentEn, contentBn },
      create: { ...a, order: i, contentEn, contentBn },
    });
  }

  // ---------------------------------------------------------------------------
  // Funds
  // ---------------------------------------------------------------------------
  const funds = [
    {
      titleEn: 'Flood Relief Fund 2024',
      titleBn: 'বন্যা ত্রাণ তহবিল ২০২৪',
      descriptionEn:
        'All-out relief for flood-affected families — food, water, medicine and shelter.',
      descriptionBn:
        'বন্যা কবলিত পরিবারের জন্য সর্বাত্মক ত্রাণ — খাদ্য, পানি, ওষুধ ও আশ্রয়।',
      target: new Prisma.Decimal('1000000000'),
      raised: new Prisma.Decimal('612500000'),
      order: 0,
      countdownEnabled: true,
    },
    {
      titleEn: 'Zakat Fund',
      titleBn: 'যাকাত তহবিল',
      descriptionEn:
        'Your Zakat reaches widows, orphans and the poor through verified channels.',
      descriptionBn:
        'আপনার যাকাত বিধবা, এতিম ও অসহায় মানুষের কাছে পৌঁছায় নির্ভরযোগ্য মাধ্যমে।',
      target: new Prisma.Decimal('500000000'),
      raised: new Prisma.Decimal('238000000'),
      order: 1,
      countdownEnabled: false,
    },
    {
      titleEn: 'Qurbani Fund',
      titleBn: 'কুরবানী তহবিল',
      descriptionEn: 'Give a share of Qurbani to families who never taste meat on Eid.',
      descriptionBn: 'ঈদে যারা কুরবানীর গোশত পায় না, তাদের কাছে একটি অংশ পৌঁছে দিন।',
      target: new Prisma.Decimal('60000000'),
      raised: new Prisma.Decimal('41100000'),
      order: 2,
      countdownEnabled: false,
    },
  ];
  for (let i = 0; i < funds.length; i++) {
    const f = funds[i];
    await prisma.fund.upsert({
      where: { id: `fund-${f.order}` },
      update: f,
      create: { id: `fund-${f.order}`, ...f },
    });
  }

  // ---------------------------------------------------------------------------
  // Home video
  // ---------------------------------------------------------------------------
  await prisma.homeVideo.upsert({
    where: { id: 'video-1' },
    update: {},
    create: {
      id: 'video-1',
      badgeEn: 'Watch',
      badgeBn: 'দেখুন',
      titleEn: 'Volunteer Bangladesh Trust in 3 minutes',
      titleBn: 'ভলান্টিয়ার বাংলাদেশ ট্রাস্ট ৩ মিনিটে',
      youtubeUrl: 'https://www.youtube.com/embed/DhLf6_ZA4PU',
    },
  });

  // ---------------------------------------------------------------------------
  // Gallery
  // ---------------------------------------------------------------------------
  const gallery = [
    { titleEn: 'Qurbani distribution', titleBn: 'কুরবানী বিতরণ', category: 'Qurbani', image: '/images/gallery/g1.svg' },
    { titleEn: 'Iftar in the streets', titleBn: 'পথে ইফতার', category: 'Ramadan', image: '/images/gallery/g2.svg' },
    { titleEn: 'Winter clothes', titleBn: 'শীতবস্ত্র', category: 'Winter', image: '/images/gallery/g3.svg' },
    { titleEn: 'Tree plantation', titleBn: 'বৃক্ষরোপণ', category: 'Environment', image: '/images/gallery/g4.svg' },
    { titleEn: 'Skill training class', titleBn: 'স্কিল প্রশিক্ষণ', category: 'Institute', image: '/images/gallery/g5.svg' },
    { titleEn: 'Flood relief convoy', titleBn: 'বন্যা ত্রাণ', category: 'Relief', image: '/images/gallery/g6.svg' },
    { titleEn: 'Community iftar', titleBn: 'সামষ্টিক ইফতার', category: 'Ramadan', image: '/images/gallery/g7.svg' },
    { titleEn: 'Safe water handover', titleBn: 'সুপেয় পানি', category: 'Water', image: '/images/gallery/g8.svg' },
  ];
  for (let i = 0; i < gallery.length; i++) {
    const g = gallery[i];
    await prisma.galleryImage.upsert({
      where: { id: `gallery-${i + 1}` },
      update: g,
      create: { id: `gallery-${i + 1}`, ...g },
    });
  }

  // ---------------------------------------------------------------------------
  // Blog posts
  // ---------------------------------------------------------------------------
  const posts = [
    {
      slug: 'ramadan-iftar-2026',
      titleEn: '10,000 iftar served every day of Ramadan',
      titleBn: 'রমজানে প্রতিদিন ১০ হাজার ইফতার',
      excerptEn:
        'With your donations, our volunteers served hot iftar to thousands of fasting people across Dhaka.',
      excerptBn:
        'আপনার দানের মাধ্যমে আমাদের স্বেচ্ছাসেবকরা ঢাকার হাজারো রোজাদারের হাতে গরম ইফতার পৌঁছে দিয়েছেন।',
      image: '/images/blog/iftar.svg',
      author: 'VBT Editorial',
    },
    {
      slug: 'flood-relief-update',
      titleEn: 'Flood relief reaches 40,000 families',
      titleBn: 'বন্যা ত্রাণ পৌঁছেছে ৪০ হাজার পরিবারে',
      excerptEn:
        'An update on the emergency flood response — where every taka went and what comes next.',
      excerptBn:
        'জরুরি বন্যা সাড়া কার্যক্রমের সর্বশেষ তথ্য — কোথায় ব্যয় হয়েছে প্রতিটি টাকা এবং সামনে কী।',
      image: '/images/blog/relief.svg',
      author: 'VBT Editorial',
    },
    {
      slug: 'skill-institute-2500-graduates',
      titleEn: '2,500+ skilled graduates placed in jobs',
      titleBn: '২৫০০+ দক্ষ গ্র্যাজুয়েট পেলেন কর্মসংস্থান',
      excerptEn:
        'The Skill Development Institute celebrates another batch entering the workforce and the economy.',
      excerptBn:
        'স্কিল ডেভেলপমেন্ট ইনস্টিটিউটের আরেকটি ব্যাচ কাজের জগতে পা রাখছে।',
      image: '/images/blog/skill.svg',
      author: 'VBT Editorial',
    },
  ];
  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
    const contentEn = `${p.excerptEn}\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Every donation to this cause is used transparently and reported publicly.\n\nAliqua id fugiat nostrud irure ex duis ea quis id quis ad et. Sunt qui esse pariatur duis deserunt mollit dolore cillum minim tempor enim.`;
    const contentBn = `${p.excerptBn}\n\nভলান্টিয়ার বাংলাদেশ ট্রাস্ট প্রতিটি দানের টাকা স্বচ্ছভাবে ব্যয় করে এবং প্রকাশ্যে হিসাব প্রকাশ করে।\n\nআপনার সহযোগিতায় এই সেবা অব্যাহত থাকুক।`;
    await prisma.blogPost.upsert({
      where: { slug: p.slug },
      update: { ...p, contentEn, contentBn },
      create: { ...p, contentEn, contentBn },
    });
  }

  // ---------------------------------------------------------------------------
  // Notices
  // ---------------------------------------------------------------------------
  const notices = [
    {
      titleEn: 'Qurbani registration now open',
      titleBn: 'কুরবানী রেজিস্ট্রেশন শুরু হয়েছে',
      contentEn:
        'Register your Qurbani share before Eid. The last date of registration is two days before Eid-ul-Adha.',
      contentBn: 'ঈদুল আজহার দুই দিন আগে পর্যন্ত কুরবানীর অংশ রেজিস্ট্রেশন করা যাবে।',
    },
    {
      titleEn: 'Annual report 2025 published',
      titleBn: 'বাৎসরিক প্রতিবেদন ২০২৫ প্রকাশিত',
      contentEn:
        'Read the audited annual report with the full income and expenditure statement of last year.',
      contentBn: 'গত বছরের নিরীক্ষিত আয়-ব্যয়সহ বাৎসরিক প্রতিবেদন পাঠ করুন।',
    },
    {
      titleEn: 'Volunteer drive for Ramadan',
      titleBn: 'রমজানে স্বেচ্ছাসেবক আহ্বান',
      contentEn: 'We are looking for volunteers for iftar distribution in 20 zones of Dhaka city.',
      contentBn: 'ঢাকার ২০টি জোনে ইফতার বিতরণে আমরা স্বেচ্ছাসেবক খুঁজছি।',
    },
  ];
  for (let i = 0; i < notices.length; i++) {
    const n = notices[i];
    await prisma.notice.upsert({
      where: { id: `notice-${i + 1}` },
      update: n,
      create: { id: `notice-${i + 1}`, ...n },
    });
  }

  // ---------------------------------------------------------------------------
  // FAQs
  // ---------------------------------------------------------------------------
  const faqs = [
    {
      questionEn: 'Is Volunteer Bangladesh Trust a registered organization?',
      questionBn: 'ভলান্টিয়ার বাংলাদেশ ট্রাস্ট কি নিবন্ধিত প্রতিষ্ঠান?',
      answerEn:
        'Yes. It is registered under the Trust Act as a non-profit organisation (registration no. S-13111/2019) and files audited reports regularly.',
      answerBn:
        'জি। এটি অলাভজনক, নিবন্ধিত প্রতিষ্ঠান (নিবন্ধন নম্বর S-13111/2019) এবং নিয়মিত নিরীক্ষিত প্রতিবেদন দাখিল করে।',
    },
    {
      questionEn: 'Where does my donation go?',
      questionBn: 'আমার দান কোথায় ব্যবহার হয়?',
      answerEn:
        'Donations are ring-fenced by fund — Zakat, Qurbani, relief and general. Each fund has fixed audited channels and public reporting.',
      answerBn:
        'দান নির্দিষ্ট তহবিলে — যাকাত, কুরবানী, ত্রাণ ও সাধারণ — ভাগ হয়। প্রতিটি তহবিলে নির্ধারিত নিরীক্ষিত চ্যানেল ও প্রকাশ্য হিসাব রয়েছে।',
    },
    {
      questionEn: 'Can volunteers join from outside Dhaka?',
      questionBn: 'ঢাকার বাইরের স্বেচ্ছাসেবকরা যোগ দিতে পারেন?',
      answerEn:
        'Yes. Our volunteer chapters operate in many districts. Send the volunteer form and our team will contact you.',
      answerBn:
        'হ্যাঁ। অনেক জেলায় আমাদের স্বেচ্ছাসেবক শাখা সক্রিয়। স্বেচ্ছাসেবক ফরম পাঠান, আমাদের টিম যোগাযোগ করবে।',
    },
    {
      questionEn: 'Is there a Qurbani share price?',
      questionBn: 'কুরবানীর শেয়ারের মূল্য কত?',
      answerEn:
        'Share prices are reviewed each year and published on the website before Eid-ul-Adha. See the Qurbani fund for the current price.',
      answerBn:
        'প্রতি বছর ঈদুল আজহার আগে শেয়ারের মূল্য হালনাগাদ করে ওয়েবসাইটে প্রকাশ করা হয়।',
    },
    {
      questionEn: 'How do I get an acknowledgement receipt?',
      questionBn: 'কিভাবে স্বীকৃতিপত্র পাব?',
      answerEn:
        'After your donation is confirmed you will receive a digital acknowledgement with the reference on your phone/email.',
      answerBn:
        'দান নিশ্চিত হলে আপনার ফোন/ইমেইলে রেফারেন্সসহ ডিজিটাল স্বীকৃতিপত্র পৌঁছে যাবে।',
    },
  ];
  for (let i = 0; i < faqs.length; i++) {
    const f = faqs[i];
    await prisma.faq.upsert({
      where: { id: `faq-${i + 1}` },
      update: f,
      create: { id: `faq-${i + 1}`, ...f },
    });
  }

  // ---------------------------------------------------------------------------
  // Products
  // ---------------------------------------------------------------------------
  const products = [
    { type: ProductType.REGULAR, titleEn: 'General Donation', titleBn: 'সাধারণ দান', price: new Prisma.Decimal('1000') },
    { type: ProductType.ZAKAT, titleEn: 'Zakat Share', titleBn: 'যাকাত শেয়ার', price: new Prisma.Decimal('1500') },
    { type: ProductType.QURBANI, titleEn: 'Qurbani Share', titleBn: 'কুরবানী শেয়ার', price: new Prisma.Decimal('9500') },
    { type: ProductType.MEMBERSHIP, titleEn: 'Monthly Donor', titleBn: 'নিয়মিত দাতা', price: new Prisma.Decimal('500') },
  ];
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    await prisma.product.upsert({
      where: { id: `product-${i + 1}` },
      update: { ...p, order: i },
      create: { ...p, id: `product-${i + 1}`, order: i },
    });
  }

  console.log('==> VBT seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });