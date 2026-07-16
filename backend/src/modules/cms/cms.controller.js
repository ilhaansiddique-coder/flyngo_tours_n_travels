"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CmsController = void 0;
var common_1 = require("@nestjs/common");
var swagger_1 = require("@nestjs/swagger");
var public_decorator_1 = require("../../common/decorators/public.decorator");
var CmsController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('CMS'), (0, common_1.Controller)('cms')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _getPage_decorators;
    var _getBlogs_decorators;
    var _getBlogBySlug_decorators;
    var _getTestimonials_decorators;
    var _getFaqs_decorators;
    var CmsController = _classThis = /** @class */ (function () {
        function CmsController_1(cmsService) {
            this.cmsService = (__runInitializers(this, _instanceExtraInitializers), cmsService);
        }
        CmsController_1.prototype.getPage = function (slug, tenantId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.cmsService.getPageBySlug(slug, tenantId)];
                });
            });
        };
        CmsController_1.prototype.getBlogs = function (tenantId, pagination) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.cmsService.getBlogPosts(tenantId, pagination.page, pagination.limit)];
                });
            });
        };
        CmsController_1.prototype.getBlogBySlug = function (slug, tenantId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.cmsService.getBlogPostBySlug(slug, tenantId)];
                });
            });
        };
        CmsController_1.prototype.getTestimonials = function (tenantId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.cmsService.getTestimonials(tenantId)];
                });
            });
        };
        CmsController_1.prototype.getFaqs = function (tenantId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.cmsService.getFaqs(tenantId)];
                });
            });
        };
        return CmsController_1;
    }());
    __setFunctionName(_classThis, "CmsController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getPage_decorators = [(0, common_1.Get)('pages/:slug'), (0, public_decorator_1.Public)(), (0, swagger_1.ApiOperation)({ summary: 'Get CMS page by slug' })];
        _getBlogs_decorators = [(0, common_1.Get)('blogs'), (0, public_decorator_1.Public)(), (0, swagger_1.ApiOperation)({ summary: 'Get published blog posts' })];
        _getBlogBySlug_decorators = [(0, common_1.Get)('blogs/:slug'), (0, public_decorator_1.Public)(), (0, swagger_1.ApiOperation)({ summary: 'Get blog post by slug' })];
        _getTestimonials_decorators = [(0, common_1.Get)('testimonials'), (0, public_decorator_1.Public)(), (0, swagger_1.ApiOperation)({ summary: 'Get approved testimonials' })];
        _getFaqs_decorators = [(0, common_1.Get)('faqs'), (0, public_decorator_1.Public)(), (0, swagger_1.ApiOperation)({ summary: 'Get published FAQs' })];
        __esDecorate(_classThis, null, _getPage_decorators, { kind: "method", name: "getPage", static: false, private: false, access: { has: function (obj) { return "getPage" in obj; }, get: function (obj) { return obj.getPage; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getBlogs_decorators, { kind: "method", name: "getBlogs", static: false, private: false, access: { has: function (obj) { return "getBlogs" in obj; }, get: function (obj) { return obj.getBlogs; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getBlogBySlug_decorators, { kind: "method", name: "getBlogBySlug", static: false, private: false, access: { has: function (obj) { return "getBlogBySlug" in obj; }, get: function (obj) { return obj.getBlogBySlug; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getTestimonials_decorators, { kind: "method", name: "getTestimonials", static: false, private: false, access: { has: function (obj) { return "getTestimonials" in obj; }, get: function (obj) { return obj.getTestimonials; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getFaqs_decorators, { kind: "method", name: "getFaqs", static: false, private: false, access: { has: function (obj) { return "getFaqs" in obj; }, get: function (obj) { return obj.getFaqs; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CmsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CmsController = _classThis;
}();
exports.CmsController = CmsController;
