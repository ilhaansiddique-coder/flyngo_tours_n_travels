"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentTenantId = void 0;
var common_1 = require("@nestjs/common");
exports.CurrentTenantId = (0, common_1.createParamDecorator)(function (_data, ctx) {
    var _a;
    var request = ctx.switchToHttp().getRequest();
    return request.tenantId || ((_a = request.user) === null || _a === void 0 ? void 0 : _a.tenantId) || null;
});
