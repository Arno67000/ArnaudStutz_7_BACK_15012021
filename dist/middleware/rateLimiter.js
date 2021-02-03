"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginLimiter = void 0;
const rateLimit = require("express-rate-limit");
exports.loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: "Too many connections from this IP, please try again after 15 minutes",
    skipSuccessfulRequests: true
});
//# sourceMappingURL=rateLimiter.js.map