"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginatedResult = void 0;
var PaginatedResult = /** @class */ (function () {
    function PaginatedResult(items, total, page, limit) {
        this.items = items;
        this.meta = {
            page: page,
            limit: limit,
            total: total,
            totalPages: Math.ceil(total / limit),
        };
    }
    return PaginatedResult;
}());
exports.PaginatedResult = PaginatedResult;
