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
var jwt_1 = require("@nestjs/jwt");
var bcryptjs = require("bcryptjs");
var auth_service_1 = require("./auth.service");
var prisma_service_1 = require("../../database/prisma.service");
var config_service_1 = require("../../config/config.service");
var common_1 = require("@nestjs/common");
describe('AuthService', function () {
    var service;
    var prisma;
    var jwtService;
    var mockPrisma = {
        user: {
            findFirst: jest.fn(),
            create: jest.fn(),
        },
        role: {
            findFirst: jest.fn(),
        },
    };
    var mockJwtService = {
        signAsync: jest.fn().mockResolvedValue('mock-token'),
    };
    var mockConfig = {
        get: jest.fn(function (key) {
            var map = {
                JWT_ACCESS_SECRET: 'test-access-secret',
                JWT_REFRESH_SECRET: 'test-refresh-secret',
                JWT_ACCESS_EXPIRY: '15m',
                JWT_REFRESH_EXPIRY: '7d',
            };
            return map[key] || '';
        }),
        getOrNull: jest.fn(),
        isDevelopment: true,
        isProduction: false,
        isMultiTenant: false,
    };
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        var module;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testing_1.Test.createTestingModule({
                        providers: [
                            auth_service_1.AuthService,
                            { provide: prisma_service_1.PrismaService, useValue: mockPrisma },
                            { provide: jwt_1.JwtService, useValue: mockJwtService },
                            { provide: config_service_1.ConfigService, useValue: mockConfig },
                        ],
                    }).compile()];
                case 1:
                    module = _a.sent();
                    service = module.get(auth_service_1.AuthService);
                    prisma = module.get(prisma_service_1.PrismaService);
                    jwtService = module.get(jwt_1.JwtService);
                    return [2 /*return*/];
            }
        });
    }); });
    afterEach(function () {
        jest.clearAllMocks();
    });
    describe('login', function () {
        it('should return tokens for valid credentials', function () { return __awaiter(void 0, void 0, void 0, function () {
            var passwordHash, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, bcryptjs.hash('Password123!', 12)];
                    case 1:
                        passwordHash = _a.sent();
                        mockPrisma.user.findFirst.mockResolvedValue({
                            id: 'user-1',
                            email: 'test@example.com',
                            passwordHash: passwordHash,
                            deletedAt: null,
                        });
                        return [4 /*yield*/, service.login({ email: 'test@example.com', password: 'Password123!' }, 'tenant-1')];
                    case 2:
                        result = _a.sent();
                        expect(result).toHaveProperty('accessToken');
                        expect(result).toHaveProperty('refreshToken');
                        expect(result).toHaveProperty('expiresIn');
                        expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw UnauthorizedException for invalid email', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockPrisma.user.findFirst.mockResolvedValue(null);
                        return [4 /*yield*/, expect(service.login({ email: 'wrong@example.com', password: 'Password123!' }, 'tenant-1')).rejects.toThrow(common_1.UnauthorizedException)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw UnauthorizedException for wrong password', function () { return __awaiter(void 0, void 0, void 0, function () {
            var passwordHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, bcryptjs.hash('CorrectPass1', 12)];
                    case 1:
                        passwordHash = _a.sent();
                        mockPrisma.user.findFirst.mockResolvedValue({
                            id: 'user-1',
                            email: 'test@example.com',
                            passwordHash: passwordHash,
                            deletedAt: null,
                        });
                        return [4 /*yield*/, expect(service.login({ email: 'test@example.com', password: 'WrongPass1' }, 'tenant-1')).rejects.toThrow(common_1.UnauthorizedException)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('register', function () {
        it('should create user and return tokens', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockPrisma.user.findFirst.mockResolvedValue(null);
                        mockPrisma.role.findFirst.mockResolvedValue({ id: 'role-customer' });
                        mockPrisma.user.create.mockResolvedValue({
                            id: 'new-user-1',
                            email: 'new@example.com',
                            fullName: 'New User',
                            tenantId: 'tenant-1',
                            roleId: 'role-customer',
                        });
                        return [4 /*yield*/, service.register({ email: 'new@example.com', password: 'Password123!', fullName: 'New User' }, 'tenant-1')];
                    case 1:
                        result = _a.sent();
                        expect(result).toHaveProperty('accessToken');
                        expect(result).toHaveProperty('refreshToken');
                        expect(mockPrisma.user.create).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw ConflictException for duplicate email', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing-user' });
                        return [4 /*yield*/, expect(service.register({ email: 'existing@example.com', password: 'Password123!', fullName: 'Existing' }, 'tenant-1')).rejects.toThrow(common_1.ConflictException)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('refreshToken', function () {
        it('should return new tokens for valid refresh token', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({
                            sub: 'user-1',
                            tenantId: 'tenant-1',
                        });
                        mockPrisma.user.findFirst.mockResolvedValue({
                            id: 'user-1',
                            email: 'test@example.com',
                            deletedAt: null,
                        });
                        return [4 /*yield*/, service.refreshToken('valid-refresh-token', 'tenant-1')];
                    case 1:
                        result = _a.sent();
                        expect(result).toHaveProperty('accessToken');
                        expect(result).toHaveProperty('refreshToken');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw UnauthorizedException for invalid token', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jwtService.verifyAsync.mockRejectedValue(new Error('Invalid'));
                        return [4 /*yield*/, expect(service.refreshToken('invalid-token', 'tenant-1')).rejects.toThrow(common_1.UnauthorizedException)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
