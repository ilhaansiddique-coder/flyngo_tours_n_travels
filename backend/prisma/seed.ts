import { PrismaClient, Prisma } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

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
  const adminPassword = await bcryptjs.hash('Admin123!', 12);

  const adminUser = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: TENANT_ID, email: 'admin@flyngo.com' } },
    update: {},
    create: {
      email: 'admin@flyngo.com',
      fullName: 'Super Admin',
      passwordHash: adminPassword,
      tenantId: TENANT_ID,
      roleId: roleRecords['super_admin'],
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`✅ Admin user: ${adminUser.email} (password: Admin123!)`);

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
  // 6. SAMPLE TOURS
  // ===========================================================================
  const tours = [
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
      update: {},
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
        isActive: true,
        isFeatured: true,
      },
    });
  }
  console.log(`✅ Tours: ${tours.length} created`);

  // ===========================================================================
  // 7. SAMPLE HOTELS
  // ===========================================================================
  const hotels = [
    { name: 'Bali Beach Resort & Spa', slug: 'bali-beach-resort', destinationId: createdDestinations['bali'], starRating: 5, pricePerNight: 299 },
    { name: 'Dubai Marina Luxury Hotel', slug: 'dubai-marina-luxury', destinationId: createdDestinations['dubai'], starRating: 5, pricePerNight: 499 },
    { name: 'Paris Boutique Hotel Le Marais', slug: 'paris-boutique-marais', destinationId: createdDestinations['paris'], starRating: 4, pricePerNight: 249 },
    { name: 'Maldives Overwater Villa Resort', slug: 'maldives-overwater-villa', destinationId: createdDestinations['maldives'], starRating: 5, pricePerNight: 899 },
    { name: 'Tokyo Shinjuku Business Hotel', slug: 'tokyo-shinjuku-hotel', destinationId: createdDestinations['tokyo'], starRating: 3, pricePerNight: 149 },
  ];

  for (const hotel of hotels) {
    await prisma.hotel.upsert({
      where: { tenantId_slug: { tenantId: TENANT_ID, slug: hotel.slug } },
      update: {},
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
      metaDescription: 'Learn about Flyngo Tours & Travels, your trusted partner for worldwide travel experiences.',
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
  const faqs = [
    { question: 'How do I book a tour?', answer: 'Browse our tours, select your preferred package, and complete the booking form. Our team will confirm within 24 hours.', order: 1 },
    { question: 'What payment methods do you accept?', answer: 'We accept Visa, MasterCard, bKash, Nagad, and SSLCommerz for local payments.', order: 2 },
    { question: 'Can I cancel my booking?', answer: 'Yes, cancellation policies vary by package. Please check the specific terms or contact our support team.', order: 3 },
    { question: 'Do you provide visa assistance?', answer: 'Yes, we offer comprehensive visa processing services for multiple destinations.', order: 4 },
    { question: 'Is travel insurance included?', answer: 'Travel insurance is not included by default but can be added during booking.', order: 5 },
  ];

  for (const faq of faqs) {
    await prisma.faq.create({
      data: {
        ...faq,
        tenantId: TENANT_ID,
        isPublished: true,
      },
    });
  }
  console.log(`✅ FAQs: ${faqs.length} created`);

  // Testimonials
  const testimonials = [
    { customerName: 'Sarah Johnson', customerTitle: 'Solo Traveler', content: 'Amazing experience booking with Flyngo. The Bali tour was perfectly organized.', rating: 5 },
    { customerName: 'Ahmed Khan', customerTitle: 'Family Traveler', content: 'Booked a family trip to Dubai. Everything was seamless from start to finish.', rating: 5 },
    { customerName: 'Emily Chen', customerTitle: 'Adventure Enthusiast', content: 'The Tokyo Tech & Tradition tour exceeded all my expectations. Highly recommended!', rating: 5 },
  ];

  for (const t of testimonials) {
    await prisma.testimonial.create({
      data: { ...t, tenantId: TENANT_ID, isApproved: true },
    });
  }
  console.log(`✅ Testimonials: ${testimonials.length} created`);

  console.log('\n🎉 Seed complete!');
  console.log(`   Tenant: ${tenant.name}`);
  console.log(`   Admin: admin@flyngo.com / Admin123!`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
