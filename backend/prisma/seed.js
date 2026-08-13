"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function () { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function (o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function (o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
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
    const permissionRecords = {};
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
            permissions: Object.values(permissionRecords).filter((_, i) => !Object.keys(permissionRecords)[i].startsWith('settings.')),
        },
        {
            code: 'manager',
            name: 'Manager',
            permissions: Object.entries(permissionRecords)
                .filter(([code]) => ['tours.', 'hotels.', 'flights.', 'visa.', 'bookings.', 'cms.', 'marketing.'].some((p) => code.startsWith(p)))
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
    const roleRecords = {};
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
        where: { id: '00000000-0000-0000-0000-00000000admin' },
        update: {},
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
    const createdDestinations = {};
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
        await prisma.hajjPackage.create({
            data: { ...p, slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), tenantId: TENANT_ID, currency: 'BDT', isActive: true, isFeatured: p.tier === 'non_shifting' || p.tier === 'vip' },
        });
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
        await prisma.umrahPackage.create({
            data: { ...p, slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), tenantId: TENANT_ID, currency: 'BDT', isActive: true, isFeatured: p.order === 1 || p.order === 5 },
        });
    }
    console.log(`✅ Umrah packages: ${umrahPackages.length} created`);
    // ===========================================================================
    // 13. VISA COUNTRIES (4 BD-market staples, easy to extend)
    // ===========================================================================
    const visaCountries = [
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
            order: 1,
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
            order: 2,
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
            order: 3,
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
            order: 4,
        },
    ];
    for (const c of visaCountries) {
        await prisma.visaCountry.create({
            data: { ...c, slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), tenantId: TENANT_ID, currency: 'BDT', isActive: true },
        });
    }
    console.log(`✅ Visa countries: ${visaCountries.length} created`);
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
