import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Fabricated marketing content — sample tours/hotels/flights/transport with
 * invented prices, and stock 5-star testimonials from people who do not exist.
 *
 * The seed runs on every container boot (see docker-entrypoint.sh), which is
 * fine on a throwaway dev database and harmful on a client's live site. The
 * testimonial and FAQ blocks use `create` against models with no unique
 * constraint, so the try/catch labelled "already present" never fires and each
 * redeploy appended another copy of the same invented review.
 *
 * Structural data (tenant, permissions, roles, admin user, hajj/umrah packages,
 * visa countries, destinations) still seeds unconditionally — a fresh deploy
 * must come up usable, and visa countries have no admin UI yet.
 */
const SEED_DEMO_CONTENT = process.env.SEED_DEMO_CONTENT === 'true';

async function main() {
  console.log('🌱 Starting seed...');
  console.log(
    `   demo content: ${SEED_DEMO_CONTENT ? 'ENABLED' : 'disabled (set SEED_DEMO_CONTENT=true to enable)'}`,
  );

  // ===========================================================================
  // 1. DEFAULT TENANT
  // ===========================================================================
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'flyngo' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Flyngo',
      slug: 'flyngo',
      domain: 'flyngo.com',
      isActive: true,
      settings: {
        create: {
          companyName: 'Flyngo Tours & Travels',
          companyEmail: 'contact@flyngo.com',
          companyPhone: '+1-800-FLYNGO',
          companyAddress: '123 Travel Street, New York, NY 10001',
          defaultCurrency: 'USD',
          defaultLanguage: 'en',
          timezone: 'America/New_York',
          primaryColor: '#2563eb',
          secondaryColor: '#1e40af',
          facebookUrl: 'https://facebook.com/flyngo',
          instagramUrl: 'https://instagram.com/flyngo',
          twitterUrl: 'https://twitter.com/flyngo',
        },
      },
    },
  });

  const TENANT_ID = tenant.id;
  console.log(`✅ Tenant: ${tenant.name} (${TENANT_ID})`);

  // ===========================================================================
  // 1b. TRACKING SETTINGS (WhatsApp, trust badges, etc.)
  // ===========================================================================
  const trackingSettings = await prisma.trackingSettings.upsert({
    where: { tenantId: TENANT_ID },
    update: {
      whatsappNumber: '+8801322913530',
      whatsappGreeting: 'Hi! I am interested in your Hajj/Umrah/travel packages. Could you share more details?',
    },
    create: {
      tenantId: TENANT_ID,
      whatsappNumber: '+8801322913530',
      whatsappGreeting: 'Hi! I am interested in your Hajj/Umrah/travel packages. Could you share more details?',
    },
  });
  console.log(`✅ Tracking settings: WhatsApp ${trackingSettings.whatsappNumber}`);

  // ===========================================================================
  // 2. PERMISSIONS
  // ===========================================================================
  const permissionGroups = {
    users: ['users.read', 'users.create', 'users.update', 'users.delete'],
    roles: ['roles.read', 'roles.create', 'roles.update', 'roles.delete'],
    tours: ['tours.read', 'tours.create', 'tours.update', 'tours.delete'],
    hotels: ['hotels.read', 'hotels.create', 'hotels.update', 'hotels.delete'],
    flights: ['flights.read', 'flights.create', 'flights.update', 'flights.delete'],
    visa: ['visa.read', 'visa.create', 'visa.update', 'visa.delete'],
    bookings: ['bookings.read', 'bookings.create', 'bookings.update', 'bookings.delete'],
    payments: ['payments.read', 'payments.create', 'payments.update', 'payments.delete'],
    cms: ['cms.read', 'cms.create', 'cms.update', 'cms.delete'],
    marketing: ['marketing.read', 'marketing.create', 'marketing.update', 'marketing.delete'],
    analytics: ['analytics.read'],
    settings: ['settings.read', 'settings.update'],
    admin: ['admin.access'],
  };

  const permissionRecords: Record<string, string> = {};

  for (const [group, perms] of Object.entries(permissionGroups)) {
    for (const code of perms) {
      const name = code
        .split('.')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      const perm = await prisma.permission.upsert({
        where: { code },
        update: {},
        create: { name, code, group },
      });
      permissionRecords[code] = perm.id;
    }
  }
  console.log(`✅ Permissions: ${Object.keys(permissionRecords).length} created`);

  // ===========================================================================
  // 3. ROLES
  // ===========================================================================
  const roles = [
    {
      code: 'super_admin',
      name: 'Super Admin',
      permissions: Object.values(permissionRecords),
    },
    {
      code: 'admin',
      name: 'Admin',
      permissions: Object.values(permissionRecords).filter(
        (_, i) =>
          !Object.keys(permissionRecords)[i].startsWith('settings.'),
      ),
    },
    {
      code: 'manager',
      name: 'Manager',
      permissions: Object.entries(permissionRecords)
        .filter(([code]) =>
          ['tours.', 'hotels.', 'flights.', 'visa.', 'bookings.', 'cms.', 'marketing.'].some((p) =>
            code.startsWith(p),
          ),
        )
        .map(([, id]) => id),
    },
    {
      code: 'agent',
      name: 'Travel Agent',
      permissions: Object.entries(permissionRecords)
        .filter(([code]) => code.endsWith('.read') || code.endsWith('.create'))
        .map(([, id]) => id),
    },
    {
      code: 'customer',
      name: 'Customer',
      permissions: [],
    },
  ];

  const roleRecords: Record<string, string> = {};

  for (const role of roles) {
    const created = await prisma.role.upsert({
      where: { tenantId_code: { tenantId: TENANT_ID, code: role.code } },
      update: {},
      create: {
        name: role.name,
        code: role.code,
        tenantId: TENANT_ID,
        isSystem: true,
        permissions: {
          create: role.permissions.map((permId) => ({
            permissionId: permId,
          })),
        },
      },
    });
    roleRecords[role.code] = created.id;
  }
  console.log(`✅ Roles: ${Object.keys(roleRecords).length} created`);

  // ===========================================================================
  // 4. DEFAULT ADMIN USER
  // ===========================================================================
  // Super-admin password. On a production host SUPER_ADMIN_PASSWORD is
  // mandatory: the old fallback shipped a known password for a known email
  // (admin@flyngo.com), which is a public login for anyone who reads this repo.
  // Refusing to boot is the right failure mode — a silent weak default is not.
  const isProductionSeed = process.env.NODE_ENV === 'production';
  const adminPlainPassword = process.env.SUPER_ADMIN_PASSWORD || (isProductionSeed ? '' : 'Admin!');
  if (!adminPlainPassword) {
    throw new Error(
      'SUPER_ADMIN_PASSWORD must be set when seeding with NODE_ENV=production. ' +
        'Set it in the Coolify environment and redeploy.',
    );
  }
  const adminPassword = await bcryptjs.hash(adminPlainPassword, 12);

  const adminUser = await prisma.user.upsert({
    where: { id: '00000000-0000-0000-0000-00000000admin' },
    // The old `update: {}` meant an already-seeded admin could never be rotated
    // from the outside: a weak password baked in at first deploy stayed forever.
    // Setting SUPER_ADMIN_PASSWORD and redeploying now rotates it, which is the
    // only rotation path available on a host with no shell access.
    update: process.env.SUPER_ADMIN_PASSWORD ? { passwordHash: adminPassword } : {},
    create: {
      id: '00000000-0000-0000-0000-00000000admin',
      email: 'admin@flyngo.com',
      fullName: 'Super Admin',
      passwordHash: adminPassword,
      tenantId: TENANT_ID,
      roleId: roleRecords['super_admin'],
      emailVerifiedAt: new Date(),
    },
  });
  // Never print the password — container logs are retained and widely readable.
  console.log(`✅ Admin user: ${adminUser.email}`);

  // ===========================================================================
  // 5. SAMPLE DESTINATIONS
  // ===========================================================================
  const destinations = [
    { name: 'Bali', slug: 'bali', country: 'Indonesia', continent: 'Asia', isFeatured: true, description: 'Paradise island with stunning beaches, temples, and vibrant culture.' },
    { name: 'Dubai', slug: 'dubai', country: 'UAE', continent: 'Asia', isFeatured: true, description: 'Ultra-modern city with luxury shopping, ultramodern architecture, and vibrant nightlife.' },
    { name: 'Paris', slug: 'paris', country: 'France', continent: 'Europe', isFeatured: true, description: 'City of Love, known for the Eiffel Tower, Louvre Museum, and exquisite cuisine.' },
    { name: 'Bangkok', slug: 'bangkok', country: 'Thailand', continent: 'Asia', isFeatured: true, description: 'Vibrant street life, ornate shrines, and delicious street food.' },
    { name: 'Singapore', slug: 'singapore', country: 'Singapore', continent: 'Asia', isFeatured: true, description: 'Garden city blending modernity with nature and multicultural cuisine.' },
    { name: 'Maldives', slug: 'maldives', country: 'Maldives', continent: 'Asia', isFeatured: true, description: 'Tropical paradise with overwater bungalows and crystal-clear waters.' },
    { name: 'Istanbul', slug: 'istanbul', country: 'Turkey', continent: 'Europe/Asia', isFeatured: true, description: 'Historic city straddling two continents with rich culture and architecture.' },
    { name: 'Tokyo', slug: 'tokyo', country: 'Japan', continent: 'Asia', isFeatured: true, description: 'Futuristic city blending ancient traditions with cutting-edge technology.' },
  ];

  const createdDestinations: Record<string, string> = {};
  for (const dest of destinations) {
    const created = await prisma.destination.upsert({
      where: { tenantId_slug: { tenantId: TENANT_ID, slug: dest.slug } },
      update: {},
      create: { ...dest, tenantId: TENANT_ID },
    });
    createdDestinations[dest.slug] = created.id;
  }
  console.log(`✅ Destinations: ${Object.keys(createdDestinations).length} created`);

  // ===========================================================================
  // 5b. WORLD COUNTRIES (global country autocomplete data)
  // ---------------------------------------------------------------------------
  // Seeds every recognised country (name + continent + flag SVG from the
  // open flag-icons repo on GitHub) as a Destination so the admin country
  // autocomplete is pre-populated. Fetched at seed time; if the network is
  // unavailable the step is skipped rather than failing the whole seed.
  // ===========================================================================
  try {
    console.log('🌍 Fetching world countries for the country autocomplete…');
    const res = await fetch(
      'https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all/all.json',
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const countries: any[] = await res.json();

    let added = 0;
    for (const c of countries) {
      const name = (c.name || '').trim();
      const iso2 = (c['alpha-2'] || '').trim().toLowerCase();
      if (!name || !iso2) continue;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const flagUrl = `https://raw.githubusercontent.com/lipis/flag-icons/main/flags/4x3/${iso2}.svg`;
      await prisma.destination.upsert({
        where: { tenantId_slug: { tenantId: TENANT_ID, slug } },
        update: { flagUrl, continent: c.region || undefined },
        create: {
          tenantId: TENANT_ID,
          name,
          slug,
          country: name,
          continent: c.region || undefined,
          flagUrl,
          isFeatured: false,
        },
      });
      added++;
    }
    console.log(`✅ World countries: ${added} upserted into destinations`);
  } catch (err: any) {
    console.warn(`⚠️  World country seed skipped: ${err.message}`);
  }

  // ===========================================================================
  // 6. SAMPLE TOURS
  // ===========================================================================
  const tours = !SEED_DEMO_CONTENT ? [] : [
    { title: 'Bali Paradise Explorer', slug: 'bali-paradise-explorer', destinationId: createdDestinations['bali'], price: 1299, duration: 7, difficulty: 'easy', tourType: 'group' },
    { title: 'Dubai Luxury Experience', slug: 'dubai-luxury-experience', destinationId: createdDestinations['dubai'], price: 2499, duration: 5, difficulty: 'easy', tourType: 'luxury' },
    { title: 'Paris Romantic Getaway', slug: 'paris-romantic-getaway', destinationId: createdDestinations['paris'], price: 1899, duration: 5, difficulty: 'easy', tourType: 'private' },
    { title: 'Bangkok Street Food & Culture', slug: 'bangkok-street-food-culture', destinationId: createdDestinations['bangkok'], price: 899, duration: 5, difficulty: 'easy', tourType: 'group' },
    { title: 'Maldives Honeymoon Special', slug: 'maldives-honeymoon-special', destinationId: createdDestinations['maldives'], price: 3499, duration: 5, difficulty: 'easy', tourType: 'luxury' },
    { title: 'Tokyo Tech & Tradition', slug: 'tokyo-tech-tradition', destinationId: createdDestinations['tokyo'], price: 2199, duration: 8, difficulty: 'easy', tourType: 'group' },
  ];

  for (const tour of tours) {
    await prisma.tour.upsert({
      where: { tenantId_slug: { tenantId: TENANT_ID, slug: tour.slug } },
      update: { pointsAwarded: 1000 },
      create: {
        tenantId: TENANT_ID,
        destinationId: tour.destinationId,
        title: tour.title,
        slug: tour.slug,
        description: `Discover the wonders of ${tour.title.split(' ').slice(0, 2).join(' ')} with this carefully curated tour package.`,
        highlights: ['Expert guide', 'Luxury accommodation', 'Airport transfers', 'Daily breakfast'],
        inclusions: ['Accommodation', 'Breakfast', 'Airport transfers', 'Guide'],
        exclusions: ['Flights', 'Visa fees', 'Personal expenses', 'Travel insurance'],
        price: tour.price,
        currency: 'USD',
        duration: tour.duration,
        difficulty: tour.difficulty,
        tourType: tour.tourType,
        maxGuests: 15,
        pointsAwarded: 1000,
        isActive: true,
        isFeatured: true,
      },
    });
  }
  console.log(`✅ Tours: ${tours.length} created`);

  // ===========================================================================
  // 7. SAMPLE HOTELS
  // ===========================================================================
  const hotels = !SEED_DEMO_CONTENT ? [] : [
    { name: 'Bali Beach Resort & Spa', slug: 'bali-beach-resort', destinationId: createdDestinations['bali'], starRating: 5, pricePerNight: 299 },
    { name: 'Dubai Marina Luxury Hotel', slug: 'dubai-marina-luxury', destinationId: createdDestinations['dubai'], starRating: 5, pricePerNight: 499 },
    { name: 'Paris Boutique Hotel Le Marais', slug: 'paris-boutique-marais', destinationId: createdDestinations['paris'], starRating: 4, pricePerNight: 249 },
    { name: 'Maldives Overwater Villa Resort', slug: 'maldives-overwater-villa', destinationId: createdDestinations['maldives'], starRating: 5, pricePerNight: 899 },
    { name: 'Tokyo Shinjuku Business Hotel', slug: 'tokyo-shinjuku-hotel', destinationId: createdDestinations['tokyo'], starRating: 3, pricePerNight: 149 },
  ];

  for (const hotel of hotels) {
    await prisma.hotel.upsert({
      where: { tenantId_slug: { tenantId: TENANT_ID, slug: hotel.slug } },
      update: { pointsAwarded: 500 },
      create: {
        tenantId: TENANT_ID,
        destinationId: hotel.destinationId,
        name: hotel.name,
        slug: hotel.slug,
        description: `Experience world-class hospitality at ${hotel.name}.`,
        starRating: hotel.starRating,
        pricePerNight: hotel.pricePerNight,
        currency: 'USD',
        amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant'],
        pointsAwarded: 500,
        isActive: true,
        rooms: {
          create: [
            {
              name: 'Standard Room',
              description: 'Comfortable room with all essential amenities.',
              pricePerNight: hotel.pricePerNight * 0.7,
              currency: 'USD',
              capacity: 2,
              amenities: ['WiFi', 'TV', 'Air Conditioning'],
            },
            {
              name: 'Deluxe Room',
              description: 'Spacious room with premium amenities and city view.',
              pricePerNight: hotel.pricePerNight,
              currency: 'USD',
              capacity: 2,
              amenities: ['WiFi', 'TV', 'Mini Bar', 'Bathtub'],
            },
            {
              name: 'Suite',
              description: 'Luxury suite with separate living area and panoramic views.',
              pricePerNight: hotel.pricePerNight * 1.8,
              currency: 'USD',
              capacity: 4,
              amenities: ['WiFi', 'TV', 'Mini Bar', 'Jacuzzi', 'Butler Service'],
            },
          ],
        },
      },
    });
  }
  console.log(`✅ Hotels: ${hotels.length} created`);

  // ===========================================================================
  // 8. SAMPLE CMS CONTENT
  // ===========================================================================
  await prisma.cmsPage.upsert({
    where: { tenantId_slug: { tenantId: TENANT_ID, slug: 'about-us' } },
    update: {},
    create: {
      tenantId: TENANT_ID,
      title: 'About Us',
      slug: 'about-us',
      status: 'published',
      publishedAt: new Date(),
      metaTitle: 'About Flyngo — Your Trusted Travel Partner',
      metaDescription: 'Learn about Flyngo Tours & Travels, Your Trusted Travel Partner for worldwide travel experiences.',
    },
  });

  await prisma.cmsPage.upsert({
    where: { tenantId_slug: { tenantId: TENANT_ID, slug: 'privacy-policy' } },
    update: {},
    create: {
      tenantId: TENANT_ID,
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      status: 'published',
      publishedAt: new Date(),
    },
  });

  await prisma.cmsPage.upsert({
    where: { tenantId_slug: { tenantId: TENANT_ID, slug: 'terms-and-conditions' } },
    update: {},
    create: {
      tenantId: TENANT_ID,
      title: 'Terms & Conditions',
      slug: 'terms-and-conditions',
      status: 'published',
      publishedAt: new Date(),
    },
  });

  // FAQs
  const faqs = !SEED_DEMO_CONTENT ? [] : [
    { question: 'How do I book a tour?', answer: 'Browse our tours, select your preferred package, and complete the booking form. Our team will confirm within 24 hours.', order: 1 },
    { question: 'What payment methods do you accept?', answer: 'We accept Visa, MasterCard, bKash, Nagad, and SSLCommerz for local payments.', order: 2 },
    { question: 'Can I cancel my booking?', answer: 'Yes, cancellation policies vary by package. Please check the specific terms or contact our support team.', order: 3 },
    { question: 'Do you provide visa assistance?', answer: 'Yes, we offer comprehensive visa processing services for multiple destinations.', order: 4 },
    { question: 'Is travel insurance included?', answer: 'Travel insurance is not included by default but can be added during booking.', order: 5 },
  ];

  for (const faq of faqs) {
    try {
      await prisma.faq.create({
        data: {
          ...faq,
          tenantId: TENANT_ID,
          isPublished: true,
        },
      });
    } catch {
      // already present — skip on re-seed
    }
  }
  console.log(`✅ FAQs: ${faqs.length} created`);

  // Testimonials
  const testimonials = !SEED_DEMO_CONTENT ? [] : [
    { customerName: 'Sarah Johnson', customerTitle: 'Solo Traveler', content: 'Amazing experience booking with Flyngo. The Bali tour was perfectly organized.', rating: 5 },
    { customerName: 'Ahmed Khan', customerTitle: 'Family Traveler', content: 'Booked a family trip to Dubai. Everything was seamless from start to finish.', rating: 5 },
    { customerName: 'Emily Chen', customerTitle: 'Adventure Enthusiast', content: 'The Tokyo Tech & Tradition tour exceeded all my expectations. Highly recommended!', rating: 5 },
  ];

  for (const t of testimonials) {
    try {
      await prisma.testimonial.create({
        data: { ...t, tenantId: TENANT_ID, isApproved: true },
      });
    } catch {
      // already present — skip on re-seed
    }
  }
  console.log(`✅ Testimonials: ${testimonials.length} created`);

  // ===========================================================================
  // 11. HAJJ PACKAGES (BD market — 7 tiers)
  // ===========================================================================
  const hajjPackages = [
    {
      title: 'Hajj Pre-Registration 2027-2028',
      tier: 'pre_registration',
      durationDays: 0,
      price: 30000,
      makkahNights: 0,
      madinahNights: 0,
      highlights: ['Reserve your slot', 'Pay nominal booking fee', 'Locked-in 2027 / 2028 prices'],
      inclusions: ['Pre-registration fee', 'Priority allocation', 'Document checklist'],
      order: 1,
    },
    {
      title: '40 Days Non-Shifting Hajj Package',
      tier: 'non_shifting',
      durationDays: 40,
      price: 750000,
      makkahNights: 25,
      madinahNights: 7,
      highlights: ['Stay in the same hotel in Makkah for the entire stay', 'Walking-distance to Haram', 'Private air-conditioned transport'],
      inclusions: ['Return air ticket', 'Visa processing', 'Full board meals', 'Ziyarat in Makkah & Madinah', 'Experienced guide'],
      order: 2,
    },
    {
      title: '40 Days Shifting Hajj Package',
      tier: 'shifting',
      durationDays: 40,
      price: 600000,
      makkahNights: 20,
      madinahNights: 7,
      highlights: ['Arafat-Muzdalifah-Mina shifts handled for you', 'Affordable premium Hajj', '4/5 star hotels'],
      inclusions: ['Return air ticket', 'Visa', 'Half board meals', 'Tent in Mina', 'Ground transport'],
      order: 3,
    },
    {
      title: '40 Days Cheapest Hajj Package',
      tier: 'cheap',
      durationDays: 40,
      price: 600000,
      makkahNights: 18,
      madinahNights: 6,
      highlights: ['Most affordable full Hajj package', 'No hidden charges', 'Budget-friendly 3/4 star hotels'],
      inclusions: ['Air ticket', 'Visa', 'Meals', 'Transport', 'Guide'],
      order: 4,
    },
    {
      title: '20 Days 5-Star Hajj Package',
      tier: 'five_star',
      durationDays: 20,
      price: 870000,
      makkahNights: 12,
      madinahNights: 5,
      highlights: ['5-star hotels steps from the Haram', 'VIP tent in Mina', 'Private transfers'],
      inclusions: ['Business-class upgrade available', 'Visa', 'All meals', 'Premium transport'],
      order: 5,
    },
    {
      title: '14 Days VIP Hajj Package',
      tier: 'vip',
      durationDays: 14,
      price: 1600000,
      makkahNights: 8,
      madinahNights: 4,
      highlights: ['VIP suite in Makkah', 'Private scholar-led group', 'Royal transport'],
      inclusions: ['Premium air ticket', 'Visa', 'All meals', '24/7 concierge'],
      order: 6,
    },
    {
      title: '14 Days A-Grade Hajj Package',
      tier: 'a_grade',
      durationDays: 14,
      price: 1120000,
      makkahNights: 8,
      madinahNights: 4,
      highlights: ['A-grade 4/5-star hotels', 'Efficient itinerary', 'Balanced comfort and value'],
      inclusions: ['Air ticket', 'Visa', 'Meals', 'Transport', 'Guide'],
      order: 7,
    },
  ];

  for (const p of hajjPackages) {
    const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    try {
      await prisma.hajjPackage.upsert({
        where: { tenantId_slug: { tenantId: TENANT_ID, slug } },
        update: { pointsAwarded: 8000 },
        create: { ...p, slug, tenantId: TENANT_ID, currency: 'BDT', pointsAwarded: 8000, isActive: true, isFeatured: p.tier === 'non_shifting' || p.tier === 'vip' },
      });
    } catch {
      // already present — skip on re-seed
    }
  }
  console.log(`✅ Hajj packages: ${hajjPackages.length} created`);

  // ===========================================================================
  // 12. UMRAH PACKAGES (6 BD-market options)
  // ===========================================================================
  const umrahPackages = [
    {
      title: 'Umrah & Jordan Package - 14 Days',
      durationDays: 14,
      price: 245000,
      makkahNights: 7,
      madinahNights: 4,
      addOnCity: 'Amman',
      highlights: ['Visit Petra in Jordan', '5-star hotels near Haram', 'Guided ziyarat'],
      inclusions: ['Air ticket', 'Visa', 'Meals', 'Transport', 'Guide'],
      order: 1,
    },
    {
      title: 'Qatar & Umrah Package - 14 Days',
      durationDays: 14,
      price: 180000,
      makkahNights: 7,
      madinahNights: 4,
      addOnCity: 'Doha',
      highlights: ['Stopover in Doha', '4-star hotels', 'Visa assistance'],
      inclusions: ['Air ticket', 'Visa', 'Meals', 'Transport', 'Guide'],
      order: 2,
    },
    {
      title: 'Umrah & Turkey Package - 14 Days',
      durationDays: 14,
      price: 235000,
      makkahNights: 7,
      madinahNights: 4,
      addOnCity: 'Istanbul',
      highlights: ['Istanbul tour included', '4/5-star hotels', 'Bosphorus cruise'],
      inclusions: ['Air ticket', 'Visa', 'Meals', 'Transport', 'Guide'],
      order: 3,
    },
    {
      title: 'December Umrah Package - 10 Days',
      durationDays: 10,
      price: 150000,
      makkahNights: 5,
      madinahNights: 3,
      addOnCity: null,
      highlights: ['Winter break timing', 'Walking-distance hotels', 'Best value'],
      inclusions: ['Air ticket', 'Visa', 'Meals', 'Transport', 'Guide'],
      order: 4,
    },
    {
      title: 'Last Ramadan Umrah Package - 17 Days',
      durationDays: 17,
      price: 225000,
      makkahNights: 12,
      madinahNights: 4,
      addOnCity: null,
      highlights: ['12 nights in Makkah, 4 in Madinah', 'Ramadan spiritual peak', 'Iftar arrangements'],
      inclusions: ['Air ticket', 'Visa', 'Iftar & Suhoor', 'Transport', 'Guide'],
      order: 5,
    },
    {
      title: 'First Ramadan Umrah Package - 14 Days',
      durationDays: 14,
      price: 170000,
      makkahNights: 8,
      madinahNights: 4,
      addOnCity: null,
      highlights: ['First 10 days of Ramadan', 'Blessed timing', 'Comfortable hotels'],
      inclusions: ['Air ticket', 'Visa', 'Iftar & Suhoor', 'Transport', 'Guide'],
      order: 6,
    },
  ];

  for (const p of umrahPackages) {
    const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    try {
      await prisma.umrahPackage.upsert({
        where: { tenantId_slug: { tenantId: TENANT_ID, slug } },
        update: { pointsAwarded: 5000 },
        create: { ...p, slug, tenantId: TENANT_ID, currency: 'BDT', pointsAwarded: 5000, isActive: true, isFeatured: p.order === 1 || p.order === 5 },
      });
    } catch {
      // already present — skip on re-seed
    }
  }
  console.log(`✅ Umrah packages: ${umrahPackages.length} created`);

  // ===========================================================================
  // 13. VISA COUNTRIES (BD-market staples, easy to extend)
  // ---------------------------------------------------------------------------
  // Each country carries an optional `content` JSON block that drives the rich,
  // fully-dynamic country detail page (pricing tiers, process, terms, facts,
  // FAQ, key destinations). Nothing on that page is hard-coded.
  // ===========================================================================
  const visaCountries = [
    {
      name: 'United Arab Emirates (Dubai)',
      flagUrl: 'https://flagcdn.com/w320/ae.png',
      imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80',
      coverImageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80',
      region: 'middle_east',
      visaTypes: ['tourist', 'transit', 'residence'],
      processingTime: '3-15 working days',
      fee: 17500,
      description: 'Dubai visa from Bangladesh — tourist, transit and residence visas processed by our certified team with transparent pricing and insurance included.',
      isFeatured: true,
      isActive: true,
      order: 1,
      content: {
        intro:
          'Dubai has become one of the most popular destinations for Bangladeshi travellers, whether for tourism, transit or long-term residence. This comprehensive guide covers all the visa options, requirements, fees and processing times so you can apply with confidence.',
        pricingTiers: [
          {
            id: 'tourist-30',
            title: 'Dubai Tourist Visa 30 days',
            subtitle: 'Ideal for short-term visits, shopping and sightseeing.',
            stay: '30 days',
            entry: 'Single Entry',
            validity: '60 days',
            male: 17500,
            female: 17500,
            child: 6500,
            processingTime: '3-7 working days',
            documents: [
              'Scan of bio page of current passport (min 6 months validity) + all old passports + visa pages',
              'Scan of minimum 3 country visa stickers (excluding SAARC countries and e-visas)',
              'One recent colour passport-size photo (white background, ears visible, no cap/sunglasses)',
              'One visiting card',
            ],
            notes: [
              'Fee includes service charge + insurance.',
              'Official passport holders must apply at the UAE Embassy-Dhaka with a valid Government Order (GO).',
            ],
          },
          {
            id: 'tourist-60',
            title: 'Dubai Tourist Visa 60 days',
            subtitle: 'Extra time to explore, visit family or handle business.',
            stay: '60 days',
            entry: 'Single Entry',
            validity: '60 days',
            male: 24500,
            female: 24500,
            child: 8500,
            processingTime: '3-7 working days',
            documents: [
              'Scan of bio page of current passport (min 6 months validity) + all old passports + visa pages',
              'Scan of minimum 3 country visa stickers (excluding SAARC countries and e-visas)',
              'One recent colour passport-size photo (white background, ears visible, no cap/sunglasses)',
              'One visiting card',
            ],
            notes: ['Fee includes service charge + insurance.'],
          },
          {
            id: 'tourist-60-mult',
            title: 'Dubai Tourist Visa 60 days (Multiple Entry)',
            subtitle: 'Multiple entries within the validity period.',
            stay: '60 days',
            entry: 'Multiple Entry',
            validity: '60 days',
            flatFee: 38000,
            processingTime: '3-7 working days',
            documents: [
              'Scan of bio page of current passport (min 6 months validity) + all old passports + visa pages',
              'Scan of minimum 3 country visa stickers',
              'One recent colour passport-size photo',
              'One visiting card',
            ],
            notes: ['Single flat fee applies to male, female and children under 12.'],
          },
          {
            id: 'tourist-5yr',
            title: 'Dubai Tourist Visa — 5 Years Multiple Entry',
            subtitle: 'For frequent travellers; each stay up to 30 days.',
            stay: '90 days per year (30 days per visit)',
            entry: 'Multiple Entry',
            validity: '5 years',
            flatFee: 145000,
            processingTime: '10-15 working days',
            documents: [
              'Clear scan of all passport pages',
              '2 copies of passport-size photos (white background)',
              'Visiting card',
              'Bank statement for last 6 months with balance of USD 4,000 (or equivalent)',
              'Months-coverage travel insurance copy (provided by us)',
              'Full mailing address',
            ],
            notes: [
              'Includes security deposit. AED 3,025 (approx. BDT 90,750) is refunded by Dubai Immigration after visa expiry within 05-07 working days.',
              'Full advance payment required. If rejected, BDT 15,000 is deducted by Dubai Immigration; remainder refunded within 05-07 working days.',
              'Overstay fine: Tk. 80,000.',
            ],
          },
          {
            id: 'resident',
            title: 'Dubai Resident Visa',
            subtitle: 'Sponsorship by a Dubai employer or UAE-resident family member.',
            stay: '3 years',
            entry: 'Residence',
            validity: '3 years',
            flatFee: 230000,
            processingTime: '8-10 working days',
            documents: [
              'Scan of bio page of current passport (min 6 months validity) + all old passports',
              'Two recent colour passport-size photos (white background, ears visible)',
            ],
            notes: [
              'Fee includes service charge.',
              'File processing starts from Dubai; you must travel on a tourist visa first and stay 08-10 working days at your own expense.',
            ],
          },
          {
            id: 'transit',
            title: 'Dubai Transit Visa',
            subtitle: 'Valid for 96 hours for layover travellers.',
            stay: '96 hours',
            entry: 'Transit',
            validity: '96 hours',
            flatFee: 8000,
            processingTime: '5-7 working days',
            documents: [
              'Scan of bio page of current passport + all old passports (min 6 months validity)',
              'Scan of visa pages',
              'Scan of third country valid visa',
              'Confirmed air tickets of Emirates Airlines',
              'Two recent colour passport-size photos',
              'Two visiting cards',
              'Forwarding letter on company pad',
            ],
            notes: [
              'Fee includes service charge.',
              'Individual applicants under 40 not allowed unless applying with family or holding a valid/used 1st-world country visa.',
            ],
          },
        ],
        processSteps: [
          'Submit your details and we email a full document checklist.',
          'Share scanned documents — we review and advise on any gaps.',
          'We prepare and submit your application to the embassy / immigration.',
          'Receive your visa and any required passport delivery.',
        ],
        terms: [
          'We provide consultancy services only — no guarantee for visa approval.',
          'File processing starts only after receiving all necessary documents.',
          'Processing time, requirements and fees are subject to change by the Embassy without prior notice.',
          'The Embassy reserves the right to ask for additional documents.',
          'All Bangla documents must be translated into English and attested.',
          'Emergency modification fee: Tk. 4,000 (tourists).',
          'Emergency visa cancellation fee: Tk. 4,000 (tourists).',
          'We are not responsible for any overstay penalties (overstay fine: Tk. 80,000).',
        ],
        facts: [
          { label: 'Continent', value: 'Asia' },
          { label: 'Capital', value: 'Abu Dhabi' },
          { label: 'Official Language', value: 'Arabic' },
          { label: 'Currency', value: 'UAE Dirham (AED)' },
          { label: 'Local Time', value: 'GMT +4' },
          { label: 'Exchange Rate', value: '21.9708 BDT per AED' },
          { label: 'Dialing Code', value: '+971' },
          { label: 'Weekend Days', value: 'Friday' },
          { label: 'Population', value: '5.9 million' },
          { label: 'Area', value: '83,600 km²' },
          { label: 'Climate', value: 'Tropical desert; summers ~41°C, winters ~23°C' },
          { label: 'Key Destinations', value: 'Burj Khalifa, Sheikh Zayed Mosque, Palm Jumeirah, Dubai Creek, The Desert, Souks' },
        ],
        faq: [
          { question: 'How many countries should I visit before applying?', answer: 'There is no restriction, but visiting 2-3 countries beforehand is recommended.' },
          { question: 'How much balance should I have in my bank account?', answer: 'For tourist visas a bank statement and bank solvency are not required (except for the 5-year visa, which needs a USD 4,000 balance).' },
          { question: 'My education qualification is low, can I apply?', answer: 'There is no education requirement for tourist visas. Anyone may apply.' },
          { question: 'My visa was recently refused. When can I reapply?', answer: 'There is no restriction or time limit on reapplying, though waiting a short period is recommended.' },
          { question: 'Can you arrange an invitation? Would it help?', answer: 'An invitation is not needed for a Dubai tourist visa.' },
          { question: 'Do you provide any guarantee for visa approval?', answer: 'No. Approval depends on the applicant profile. We prepare files professionally.' },
          { question: 'Are embassy fees or service charges refundable?', answer: 'No. Both the embassy fee and service charge are non-refundable.' },
          { question: 'How long does Dubai visa processing take?', answer: 'Tourist visas take 3-7 working days, the 5-year visa 10-15 days, resident visas 8-10 days, and transit visas 5-7 working days.' },
        ],
        keyDestinations: [
          'Burj Khalifa',
          'Sheikh Zayed Grand Mosque',
          'Palm Jumeirah',
          'Dubai Creek',
          'The Desert',
          'Souks',
          'Jumeirah Beach',
          'The Dubai Mall',
        ],
      },
    },
    {
      name: 'Malaysia',
      flagUrl: 'https://flagcdn.com/w320/my.png',
      region: 'asia',
      visaTypes: ['tourist', 'business'],
      processingTime: '5-7 working days',
      fee: 4500,
      requirements: ['Valid passport (min 6 months validity)', '2 copies of passport-size photo', 'Bank statement (last 6 months)', 'Confirmed return ticket', 'Hotel booking or invitation letter'],
      description: 'Malaysia e-Visa and eNTRI processing for Bangladeshi citizens. Fast turnaround, transparent pricing.',
      isFeatured: true,
      order: 2,
      content: {
        intro:
          'Malaysia is a favourite of Bangladeshi travellers for its affordability, culture and food. We process e-Visa and eNTRI applications quickly and transparently.',
        pricingTiers: [
          {
            id: 'tourist-ev',
            title: 'Malaysia Tourist e-Visa',
            stay: '30 days',
            entry: 'Single Entry',
            validity: '3 months',
            flatFee: 4500,
            processingTime: '5-7 working days',
            documents: [
              'Valid passport (min 6 months validity)',
              '2 copies of passport-size photo',
              'Bank statement (last 6 months)',
              'Confirmed return ticket',
              'Hotel booking or invitation letter',
            ],
          },
        ],
        faq: [
          { question: 'Is Malaysia visa-on-arrival available for Bangladeshis?', answer: 'Conditions apply. Contact us to confirm your eligibility.' },
        ],
      },
    },
    {
      name: 'Thailand',
      flagUrl: 'https://flagcdn.com/w320/th.png',
      region: 'asia',
      visaTypes: ['tourist'],
      processingTime: '5-7 working days',
      fee: 4000,
      requirements: ['Valid passport', 'Photos', 'Bank statement', 'Return ticket', 'Hotel booking'],
      description: 'Thailand tourist visa processing. Visa-on-arrival assistance also available.',
      isFeatured: true,
      order: 3,
      content: {
        intro:
          'From Bangkok to Phuket, Thailand is a top destination for Bangladeshi travellers. We handle tourist visa processing and visa-on-arrival assistance.',
        pricingTiers: [
          {
            id: 'tourist',
            title: 'Thailand Tourist Visa',
            stay: '60 days',
            entry: 'Single Entry',
            validity: '3 months',
            flatFee: 4000,
            processingTime: '5-7 working days',
            documents: [
              'Valid passport',
              'Photos',
              'Bank statement',
              'Return ticket',
              'Hotel booking',
            ],
          },
        ],
        faq: [
          { question: 'Can Bangladeshis get visa on arrival in Thailand?', answer: 'Visa-on-arrival is available under conditions; we can prepare the documents in advance.' },
        ],
      },
    },
    {
      name: 'Australia',
      flagUrl: 'https://flagcdn.com/w320/au.png',
      region: 'oceania',
      visaTypes: ['tourist', 'business', 'student'],
      processingTime: '15-25 working days',
      fee: 18500,
      requirements: ['Valid passport', 'Photos', 'Bank statement', 'Employment letter', 'Travel itinerary', 'Cover letter'],
      description: 'Australia visitor visa (subclass 600) processing. Document review and interview prep included.',
      isFeatured: true,
      order: 4,
      content: {
        intro:
          'Applying for an Australian visa is a detailed process. We help Bangladeshi applicants prepare strong, complete applications for the Visitor visa (subclass 600).',
        pricingTiers: [
          {
            id: 'visitor-600',
            title: 'Australia Visitor Visa (subclass 600)',
            stay: 'Up to 12 months',
            entry: 'Single / Multiple Entry',
            validity: '12 months',
            flatFee: 18500,
            processingTime: '15-25 working days',
            documents: [
              'Valid passport',
              'Photos',
              'Bank statement',
              'Employment letter',
              'Travel itinerary',
              'Cover letter',
            ],
            notes: ['Service charge is additional to the government visa fee.'],
          },
        ],
        faq: [
          { question: 'Do I need an interview for an Australian visa?', answer: 'Usually biometrics are required; we help you schedule and prepare.' },
        ],
      },
    },
    {
      name: 'United Kingdom (UK)',
      flagUrl: 'https://flagcdn.com/w320/gb.png',
      region: 'europe',
      visaTypes: ['tourist', 'business', 'student', 'work'],
      processingTime: '15-30 working days',
      fee: 22000,
      requirements: ['Valid passport', 'Photos', 'Bank statement (6 months)', 'Employment / leave letter', 'Accommodation proof', 'Travel history', 'Cover letter'],
      description: 'UK Standard Visitor Visa processing. Document review, appointment scheduling, and submission support.',
      isFeatured: true,
      order: 5,
      content: {
        intro:
          'The UK Standard Visitor Visa is popular with Bangladeshi travellers. We review documents, book appointments and support your submission.',
        pricingTiers: [
          {
            id: 'visitor-standard',
            title: 'UK Standard Visitor Visa',
            stay: 'Up to 6 months',
            entry: 'Single / Multiple Entry',
            validity: '6 months',
            flatFee: 22000,
            processingTime: '15-30 working days',
            documents: [
              'Valid passport',
              'Photos',
              'Bank statement (6 months)',
              'Employment / leave letter',
              'Accommodation proof',
              'Travel history',
              'Cover letter',
            ],
            notes: ['Service charge is additional to the UK government visa fee.'],
          },
        ],
        faq: [
          { question: 'Do UK visa fees vary with processing time?', answer: 'Priority and super-priority services cost more; we can advise the fastest option.' },
        ],
      },
    },
  ];

  for (const c of visaCountries) {
    const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await prisma.visaCountry.upsert({
      where: { tenantId_slug: { tenantId: TENANT_ID, slug } },
      update: { content: c.content ?? undefined },
      create: { ...c, slug, tenantId: TENANT_ID, currency: 'BDT', isActive: true },
    });
  }
  console.log(`✅ Visa countries: ${visaCountries.length} created/updated`);

  // ===========================================================================
  // 14. SAMPLE FLIGHTS
  // ===========================================================================
  const now = new Date();
  const inDays = (d: number, h = 8) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, h, 0, 0);
  const flights = !SEED_DEMO_CONTENT ? [] : [
    { airline: 'Biman Bangladesh Airlines', flightNumber: 'BG-084', originCode: 'DAC', originCity: 'Dhaka', destinationCode: 'DXB', destinationCity: 'Dubai', dep: inDays(14, 3), arr: inDays(14, 9), duration: 360, price: 62000, cabinClass: 'economy', seats: 42 },
    { airline: 'US-Bangla Airlines', flightNumber: 'BS-321', originCode: 'DAC', originCity: 'Dhaka', destinationCode: 'CCU', destinationCity: 'Kolkata', dep: inDays(10, 10), arr: inDays(10, 11), duration: 65, price: 9500, cabinClass: 'economy', seats: 18 },
    { airline: 'Qatar Airways', flightNumber: 'QR-641', originCode: 'DAC', originCity: 'Dhaka', destinationCode: 'DOH', destinationCity: 'Doha', dep: inDays(21, 2), arr: inDays(21, 6), duration: 330, price: 74000, cabinClass: 'business', seats: 8 },
    { airline: 'Emirates', flightNumber: 'EK-585', originCode: 'DAC', originCity: 'Dhaka', destinationCode: 'LHR', destinationCity: 'London', dep: inDays(30, 4), arr: inDays(30, 16), duration: 720, price: 118000, cabinClass: 'economy', seats: 26 },
    { airline: 'Singapore Airlines', flightNumber: 'SQ-447', originCode: 'DAC', originCity: 'Dhaka', destinationCode: 'SIN', destinationCity: 'Singapore', dep: inDays(18, 23), arr: inDays(19, 6), duration: 300, price: 68000, cabinClass: 'economy', seats: 34 },
  ];
  let flightsCreated = 0;
  for (const f of flights) {
    const existing = await prisma.flight.findFirst({ where: { tenantId: TENANT_ID, flightNumber: f.flightNumber, deletedAt: null } });
    const data = {
      tenantId: TENANT_ID, airline: f.airline, flightNumber: f.flightNumber,
      originCode: f.originCode, originCity: f.originCity, destinationCode: f.destinationCode, destinationCity: f.destinationCity,
      departureTime: f.dep, arrivalTime: f.arr, duration: f.duration, price: f.price, currency: 'BDT',
      availableSeats: f.seats, cabinClass: f.cabinClass, pointsAwarded: 800, isActive: true,
    };
    if (existing) await prisma.flight.update({ where: { id: existing.id }, data: { pointsAwarded: 800 } });
    else { await prisma.flight.create({ data }); flightsCreated++; }
  }
  console.log(`✅ Flights: ${flightsCreated} created (${flights.length} total)`);

  // ===========================================================================
  // 15. SAMPLE TRANSPORT
  // ===========================================================================
  const transports = !SEED_DEMO_CONTENT ? [] : [
    { vehicleType: 'car', title: 'Dhaka Airport → City (Private Sedan)', operatorName: 'FlynGo Transfers', originCity: 'Dhaka Airport (DAC)', destinationCity: 'Dhaka City', price: 1800, seats: 4, amenities: ['AC', 'Meet & greet', 'Bottled water'] },
    { vehicleType: 'microbus', title: "Dhaka → Cox's Bazar (AC Microbus)", operatorName: 'FlynGo Transfers', originCity: 'Dhaka', destinationCity: "Cox's Bazar", price: 15000, seats: 11, amenities: ['AC', 'Reclining seats', 'Rest stops'] },
    { vehicleType: 'bus', title: 'Dhaka → Sylhet (Luxury Coach)', operatorName: 'Green Line', originCity: 'Dhaka', destinationCity: 'Sylhet', price: 1200, seats: 36, amenities: ['AC', 'WiFi', 'Snacks'] },
    { vehicleType: 'suv', title: 'Sylhet Airport → Resort (4x4 SUV)', operatorName: 'FlynGo Transfers', originCity: 'Sylhet Airport (ZYL)', destinationCity: 'Sreemangal Resorts', price: 4500, seats: 5, amenities: ['AC', 'Luggage assistance'] },
    { vehicleType: 'ferry', title: "Cox's Bazar → Saint Martin (Speed Ferry)", operatorName: 'Karnaphuli Express', originCity: "Cox's Bazar", destinationCity: 'Saint Martin', price: 2500, seats: 120, amenities: ['Reserved seat', 'Life jacket', 'Sun deck'] },
  ];
  let transportsCreated = 0;
  for (const tr of transports) {
    const existing = await prisma.transport.findFirst({ where: { tenantId: TENANT_ID, title: tr.title, deletedAt: null } });
    const data = {
      tenantId: TENANT_ID, vehicleType: tr.vehicleType, operatorName: tr.operatorName, title: tr.title,
      originCity: tr.originCity, destinationCity: tr.destinationCity, price: tr.price, currency: 'BDT',
      totalSeats: tr.seats, availableSeats: tr.seats, amenities: tr.amenities, pointsAwarded: 300, isActive: true,
    };
    if (existing) await prisma.transport.update({ where: { id: existing.id }, data: { pointsAwarded: 300 } });
    else { await prisma.transport.create({ data }); transportsCreated++; }
  }
  console.log(`✅ Transport: ${transportsCreated} created (${transports.length} total)`);

  console.log('\n🎉 Seed complete!');
  console.log(`   Tenant: ${tenant.name}`);
  console.log(`   Admin: admin@flyngo.com / ${adminPlainPassword}`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
