"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcryptjs = require("bcryptjs");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var tenant, TENANT_ID, permissionGroups, permissionRecords, _i, _a, _b, group, perms, _c, perms_1, code, name_1, perm, roles, roleRecords, _d, roles_1, role, created, adminPassword, adminUser, destinations, createdDestinations, _e, destinations_1, dest, created, tours, _f, tours_1, tour, hotels, _g, hotels_1, hotel, faqs, _h, faqs_1, faq, testimonials, _j, testimonials_1, t;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    console.log('🌱 Starting seed...');
                    return [4 /*yield*/, prisma.tenant.upsert({
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
                        })];
                case 1:
                    tenant = _k.sent();
                    TENANT_ID = tenant.id;
                    console.log("\u2705 Tenant: ".concat(tenant.name, " (").concat(TENANT_ID, ")"));
                    permissionGroups = {
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
                    permissionRecords = {};
                    _i = 0, _a = Object.entries(permissionGroups);
                    _k.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 7];
                    _b = _a[_i], group = _b[0], perms = _b[1];
                    _c = 0, perms_1 = perms;
                    _k.label = 3;
                case 3:
                    if (!(_c < perms_1.length)) return [3 /*break*/, 6];
                    code = perms_1[_c];
                    name_1 = code
                        .split('.')
                        .map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); })
                        .join(' ');
                    return [4 /*yield*/, prisma.permission.upsert({
                            where: { code: code },
                            update: {},
                            create: { name: name_1, code: code, group: group },
                        })];
                case 4:
                    perm = _k.sent();
                    permissionRecords[code] = perm.id;
                    _k.label = 5;
                case 5:
                    _c++;
                    return [3 /*break*/, 3];
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7:
                    console.log("\u2705 Permissions: ".concat(Object.keys(permissionRecords).length, " created"));
                    roles = [
                        {
                            code: 'super_admin',
                            name: 'Super Admin',
                            permissions: Object.values(permissionRecords),
                        },
                        {
                            code: 'admin',
                            name: 'Admin',
                            permissions: Object.values(permissionRecords).filter(function (_, i) {
                                return !Object.keys(permissionRecords)[i].startsWith('settings.');
                            }),
                        },
                        {
                            code: 'manager',
                            name: 'Manager',
                            permissions: Object.entries(permissionRecords)
                                .filter(function (_a) {
                                var code = _a[0];
                                return ['tours.', 'hotels.', 'flights.', 'visa.', 'bookings.', 'cms.', 'marketing.'].some(function (p) {
                                    return code.startsWith(p);
                                });
                            })
                                .map(function (_a) {
                                var id = _a[1];
                                return id;
                            }),
                        },
                        {
                            code: 'agent',
                            name: 'Travel Agent',
                            permissions: Object.entries(permissionRecords)
                                .filter(function (_a) {
                                var code = _a[0];
                                return code.endsWith('.read') || code.endsWith('.create');
                            })
                                .map(function (_a) {
                                var id = _a[1];
                                return id;
                            }),
                        },
                        {
                            code: 'customer',
                            name: 'Customer',
                            permissions: [],
                        },
                    ];
                    roleRecords = {};
                    _d = 0, roles_1 = roles;
                    _k.label = 8;
                case 8:
                    if (!(_d < roles_1.length)) return [3 /*break*/, 11];
                    role = roles_1[_d];
                    return [4 /*yield*/, prisma.role.upsert({
                            where: { tenantId_code: { tenantId: TENANT_ID, code: role.code } },
                            update: {},
                            create: {
                                name: role.name,
                                code: role.code,
                                tenantId: TENANT_ID,
                                isSystem: true,
                                permissions: {
                                    create: role.permissions.map(function (permId) { return ({
                                        permissionId: permId,
                                    }); }),
                                },
                            },
                        })];
                case 9:
                    created = _k.sent();
                    roleRecords[role.code] = created.id;
                    _k.label = 10;
                case 10:
                    _d++;
                    return [3 /*break*/, 8];
                case 11:
                    console.log("\u2705 Roles: ".concat(Object.keys(roleRecords).length, " created"));
                    return [4 /*yield*/, bcryptjs.hash('Admin123!', 12)];
                case 12:
                    adminPassword = _k.sent();
                    return [4 /*yield*/, prisma.user.upsert({
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
                        })];
                case 13:
                    adminUser = _k.sent();
                    console.log("\u2705 Admin user: ".concat(adminUser.email, " (password: Admin123!)"));
                    destinations = [
                        { name: 'Bali', slug: 'bali', country: 'Indonesia', continent: 'Asia', isFeatured: true, description: 'Paradise island with stunning beaches, temples, and vibrant culture.' },
                        { name: 'Dubai', slug: 'dubai', country: 'UAE', continent: 'Asia', isFeatured: true, description: 'Ultra-modern city with luxury shopping, ultramodern architecture, and vibrant nightlife.' },
                        { name: 'Paris', slug: 'paris', country: 'France', continent: 'Europe', isFeatured: true, description: 'City of Love, known for the Eiffel Tower, Louvre Museum, and exquisite cuisine.' },
                        { name: 'Bangkok', slug: 'bangkok', country: 'Thailand', continent: 'Asia', isFeatured: true, description: 'Vibrant street life, ornate shrines, and delicious street food.' },
                        { name: 'Singapore', slug: 'singapore', country: 'Singapore', continent: 'Asia', isFeatured: true, description: 'Garden city blending modernity with nature and multicultural cuisine.' },
                        { name: 'Maldives', slug: 'maldives', country: 'Maldives', continent: 'Asia', isFeatured: true, description: 'Tropical paradise with overwater bungalows and crystal-clear waters.' },
                        { name: 'Istanbul', slug: 'istanbul', country: 'Turkey', continent: 'Europe/Asia', isFeatured: true, description: 'Historic city straddling two continents with rich culture and architecture.' },
                        { name: 'Tokyo', slug: 'tokyo', country: 'Japan', continent: 'Asia', isFeatured: true, description: 'Futuristic city blending ancient traditions with cutting-edge technology.' },
                    ];
                    createdDestinations = {};
                    _e = 0, destinations_1 = destinations;
                    _k.label = 14;
                case 14:
                    if (!(_e < destinations_1.length)) return [3 /*break*/, 17];
                    dest = destinations_1[_e];
                    return [4 /*yield*/, prisma.destination.upsert({
                            where: { tenantId_slug: { tenantId: TENANT_ID, slug: dest.slug } },
                            update: {},
                            create: __assign(__assign({}, dest), { tenantId: TENANT_ID }),
                        })];
                case 15:
                    created = _k.sent();
                    createdDestinations[dest.slug] = created.id;
                    _k.label = 16;
                case 16:
                    _e++;
                    return [3 /*break*/, 14];
                case 17:
                    console.log("\u2705 Destinations: ".concat(Object.keys(createdDestinations).length, " created"));
                    tours = [
                        { title: 'Bali Paradise Explorer', slug: 'bali-paradise-explorer', destinationId: createdDestinations['bali'], price: 1299, duration: 7, difficulty: 'easy', tourType: 'group' },
                        { title: 'Dubai Luxury Experience', slug: 'dubai-luxury-experience', destinationId: createdDestinations['dubai'], price: 2499, duration: 5, difficulty: 'easy', tourType: 'luxury' },
                        { title: 'Paris Romantic Getaway', slug: 'paris-romantic-getaway', destinationId: createdDestinations['paris'], price: 1899, duration: 5, difficulty: 'easy', tourType: 'private' },
                        { title: 'Bangkok Street Food & Culture', slug: 'bangkok-street-food-culture', destinationId: createdDestinations['bangkok'], price: 899, duration: 5, difficulty: 'easy', tourType: 'group' },
                        { title: 'Maldives Honeymoon Special', slug: 'maldives-honeymoon-special', destinationId: createdDestinations['maldives'], price: 3499, duration: 5, difficulty: 'easy', tourType: 'luxury' },
                        { title: 'Tokyo Tech & Tradition', slug: 'tokyo-tech-tradition', destinationId: createdDestinations['tokyo'], price: 2199, duration: 8, difficulty: 'easy', tourType: 'group' },
                    ];
                    _f = 0, tours_1 = tours;
                    _k.label = 18;
                case 18:
                    if (!(_f < tours_1.length)) return [3 /*break*/, 21];
                    tour = tours_1[_f];
                    return [4 /*yield*/, prisma.tour.upsert({
                            where: { tenantId_slug: { tenantId: TENANT_ID, slug: tour.slug } },
                            update: {},
                            create: {
                                tenantId: TENANT_ID,
                                destinationId: tour.destinationId,
                                title: tour.title,
                                slug: tour.slug,
                                description: "Discover the wonders of ".concat(tour.title.split(' ').slice(0, 2).join(' '), " with this carefully curated tour package."),
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
                        })];
                case 19:
                    _k.sent();
                    _k.label = 20;
                case 20:
                    _f++;
                    return [3 /*break*/, 18];
                case 21:
                    console.log("\u2705 Tours: ".concat(tours.length, " created"));
                    hotels = [
                        { name: 'Bali Beach Resort & Spa', slug: 'bali-beach-resort', destinationId: createdDestinations['bali'], starRating: 5, pricePerNight: 299 },
                        { name: 'Dubai Marina Luxury Hotel', slug: 'dubai-marina-luxury', destinationId: createdDestinations['dubai'], starRating: 5, pricePerNight: 499 },
                        { name: 'Paris Boutique Hotel Le Marais', slug: 'paris-boutique-marais', destinationId: createdDestinations['paris'], starRating: 4, pricePerNight: 249 },
                        { name: 'Maldives Overwater Villa Resort', slug: 'maldives-overwater-villa', destinationId: createdDestinations['maldives'], starRating: 5, pricePerNight: 899 },
                        { name: 'Tokyo Shinjuku Business Hotel', slug: 'tokyo-shinjuku-hotel', destinationId: createdDestinations['tokyo'], starRating: 3, pricePerNight: 149 },
                    ];
                    _g = 0, hotels_1 = hotels;
                    _k.label = 22;
                case 22:
                    if (!(_g < hotels_1.length)) return [3 /*break*/, 25];
                    hotel = hotels_1[_g];
                    return [4 /*yield*/, prisma.hotel.upsert({
                            where: { tenantId_slug: { tenantId: TENANT_ID, slug: hotel.slug } },
                            update: {},
                            create: {
                                tenantId: TENANT_ID,
                                destinationId: hotel.destinationId,
                                name: hotel.name,
                                slug: hotel.slug,
                                description: "Experience world-class hospitality at ".concat(hotel.name, "."),
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
                        })];
                case 23:
                    _k.sent();
                    _k.label = 24;
                case 24:
                    _g++;
                    return [3 /*break*/, 22];
                case 25:
                    console.log("\u2705 Hotels: ".concat(hotels.length, " created"));
                    // ===========================================================================
                    // 8. SAMPLE CMS CONTENT
                    // ===========================================================================
                    return [4 /*yield*/, prisma.cmsPage.upsert({
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
                        })];
                case 26:
                    // ===========================================================================
                    // 8. SAMPLE CMS CONTENT
                    // ===========================================================================
                    _k.sent();
                    return [4 /*yield*/, prisma.cmsPage.upsert({
                            where: { tenantId_slug: { tenantId: TENANT_ID, slug: 'privacy-policy' } },
                            update: {},
                            create: {
                                tenantId: TENANT_ID,
                                title: 'Privacy Policy',
                                slug: 'privacy-policy',
                                status: 'published',
                                publishedAt: new Date(),
                            },
                        })];
                case 27:
                    _k.sent();
                    return [4 /*yield*/, prisma.cmsPage.upsert({
                            where: { tenantId_slug: { tenantId: TENANT_ID, slug: 'terms-and-conditions' } },
                            update: {},
                            create: {
                                tenantId: TENANT_ID,
                                title: 'Terms & Conditions',
                                slug: 'terms-and-conditions',
                                status: 'published',
                                publishedAt: new Date(),
                            },
                        })];
                case 28:
                    _k.sent();
                    faqs = [
                        { question: 'How do I book a tour?', answer: 'Browse our tours, select your preferred package, and complete the booking form. Our team will confirm within 24 hours.', order: 1 },
                        { question: 'What payment methods do you accept?', answer: 'We accept Visa, MasterCard, bKash, Nagad, and SSLCommerz for local payments.', order: 2 },
                        { question: 'Can I cancel my booking?', answer: 'Yes, cancellation policies vary by package. Please check the specific terms or contact our support team.', order: 3 },
                        { question: 'Do you provide visa assistance?', answer: 'Yes, we offer comprehensive visa processing services for multiple destinations.', order: 4 },
                        { question: 'Is travel insurance included?', answer: 'Travel insurance is not included by default but can be added during booking.', order: 5 },
                    ];
                    _h = 0, faqs_1 = faqs;
                    _k.label = 29;
                case 29:
                    if (!(_h < faqs_1.length)) return [3 /*break*/, 32];
                    faq = faqs_1[_h];
                    return [4 /*yield*/, prisma.faq.create({
                            data: __assign(__assign({}, faq), { tenantId: TENANT_ID, isPublished: true }),
                        })];
                case 30:
                    _k.sent();
                    _k.label = 31;
                case 31:
                    _h++;
                    return [3 /*break*/, 29];
                case 32:
                    console.log("\u2705 FAQs: ".concat(faqs.length, " created"));
                    testimonials = [
                        { customerName: 'Sarah Johnson', customerTitle: 'Solo Traveler', content: 'Amazing experience booking with Flyngo. The Bali tour was perfectly organized.', rating: 5 },
                        { customerName: 'Ahmed Khan', customerTitle: 'Family Traveler', content: 'Booked a family trip to Dubai. Everything was seamless from start to finish.', rating: 5 },
                        { customerName: 'Emily Chen', customerTitle: 'Adventure Enthusiast', content: 'The Tokyo Tech & Tradition tour exceeded all my expectations. Highly recommended!', rating: 5 },
                    ];
                    _j = 0, testimonials_1 = testimonials;
                    _k.label = 33;
                case 33:
                    if (!(_j < testimonials_1.length)) return [3 /*break*/, 36];
                    t = testimonials_1[_j];
                    return [4 /*yield*/, prisma.testimonial.create({
                            data: __assign(__assign({}, t), { tenantId: TENANT_ID, isApproved: true }),
                        })];
                case 34:
                    _k.sent();
                    _k.label = 35;
                case 35:
                    _j++;
                    return [3 /*break*/, 33];
                case 36:
                    console.log("\u2705 Testimonials: ".concat(testimonials.length, " created"));
                    console.log('\n🎉 Seed complete!');
                    console.log("   Tenant: ".concat(tenant.name));
                    console.log("   Admin: admin@flyngo.com / Admin123!");
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error('Seed failed:', e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
