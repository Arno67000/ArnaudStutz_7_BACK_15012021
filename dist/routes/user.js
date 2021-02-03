"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express = require("express");
const user_1 = require("../controllers/user");
const auth_1 = require("../middleware/auth");
const inputValidator_1 = require("../middleware/inputValidator");
const rateLimiter_1 = require("../middleware/rateLimiter");
exports.userRouter = express.Router();
exports.userRouter.post('/login', inputValidator_1.userValidationRules(), inputValidator_1.validate, rateLimiter_1.loginLimiter, user_1.login);
exports.userRouter.post('/signup', inputValidator_1.userValidationRules(), inputValidator_1.validate, user_1.signup);
exports.userRouter.delete('/:userId', auth_1.auth, user_1.deleteUser);
exports.userRouter.get('/', auth_1.auth, user_1.getCurrentUser);
exports.userRouter.put('/:userId', inputValidator_1.userValidationRules(), inputValidator_1.validate, auth_1.auth, user_1.modifyUsersPass);
//# sourceMappingURL=user.js.map