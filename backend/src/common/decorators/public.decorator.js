"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Public = exports.PUBLIC_KEY = void 0;
var common_1 = require("@nestjs/common");
exports.PUBLIC_KEY = 'isPublic';
var Public = function () { return (0, common_1.SetMetadata)(exports.PUBLIC_KEY, true); };
exports.Public = Public;
