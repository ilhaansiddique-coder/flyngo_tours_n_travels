"use strict";
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
var testing_1 = require("@nestjs/testing");
var booking_service_1 = require("./booking.service");
var prisma_service_1 = require("../../database/prisma.service");
var common_1 = require("@nestjs/common");
describe('BookingService', function () {
    var service;
    var prisma;
    var mockPrisma = {
        booking: {
            create: jest.fn(),
            findMany: jest.fn(),
            findFirst: jest.fn(),
            count: jest.fn(),
            update: jest.fn(),
        },
    };
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        var module;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testing_1.Test.createTestingModule({
                        providers: [
                            booking_service_1.BookingService,
                            { provide: prisma_service_1.PrismaService, useValue: mockPrisma },
                        ],
                    }).compile()];
                case 1:
                    module = _a.sent();
                    service = module.get(booking_service_1.BookingService);
                    prisma = module.get(prisma_service_1.PrismaService);
                    return [2 /*return*/];
            }
        });
    }); });
    afterEach(function () {
        jest.clearAllMocks();
    });
    describe('createBooking', function () {
        it('should create a booking with a generated code', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockPrisma.booking.create.mockResolvedValue({
                            id: 'booking-1',
                            bookingCode: 'FLY-ABC123',
                            tenantId: 'tenant-1',
                            userId: 'user-1',
                            bookingType: 'tour',
                            status: 'pending',
                        });
                        return [4 /*yield*/, service.createBooking('tenant-1', 'user-1', {
                                type: 'tour',
                                itemId: 'tour-1',
                                startDate: new Date('2026-08-01'),
                                guests: 2,
                            })];
                    case 1:
                        result = _a.sent();
                        expect(result.status).toBe('pending');
                        expect(result.bookingCode).toContain('FLY-');
                        expect(mockPrisma.booking.create).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getUserBookings', function () {
        it('should return paginated user bookings', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockPrisma.booking.findMany.mockResolvedValue([{ id: 'booking-1' }]);
                        mockPrisma.booking.count.mockResolvedValue(1);
                        return [4 /*yield*/, service.getUserBookings('tenant-1', 'user-1')];
                    case 1:
                        result = _a.sent();
                        expect(result.items).toHaveLength(1);
                        expect(result.meta.total).toBe(1);
                        expect(result.meta.totalPages).toBe(1);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getBookingById', function () {
        it('should return booking when found', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockPrisma.booking.findFirst.mockResolvedValue({
                            id: 'booking-1',
                            tenantId: 'tenant-1',
                            userId: 'user-1',
                            payments: [],
                        });
                        return [4 /*yield*/, service.getBookingById('booking-1', 'tenant-1', 'user-1')];
                    case 1:
                        result = _a.sent();
                        expect(result.id).toBe('booking-1');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw NotFoundException when booking not found', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockPrisma.booking.findFirst.mockResolvedValue(null);
                        return [4 /*yield*/, expect(service.getBookingById('fake-id', 'tenant-1', 'user-1')).rejects.toThrow(common_1.NotFoundException)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('cancelBooking', function () {
        it('should cancel a pending booking', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockPrisma.booking.findFirst.mockResolvedValue({
                            id: 'booking-1',
                            status: 'pending',
                        });
                        mockPrisma.booking.update.mockResolvedValue({
                            id: 'booking-1',
                            status: 'cancelled',
                            cancelledAt: new Date(),
                        });
                        return [4 /*yield*/, service.cancelBooking('booking-1', 'tenant-1', 'user-1')];
                    case 1:
                        result = _a.sent();
                        expect(result.status).toBe('cancelled');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw when cancelling completed booking', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockPrisma.booking.findFirst.mockResolvedValue({
                            id: 'booking-1',
                            status: 'completed',
                        });
                        return [4 /*yield*/, expect(service.cancelBooking('booking-1', 'tenant-1', 'user-1')).rejects.toThrow(common_1.BadRequestException)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
