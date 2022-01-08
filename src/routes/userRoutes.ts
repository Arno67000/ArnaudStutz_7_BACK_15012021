import * as express from "express";
import { login, signup, deleteUser, getCurrentUser, modifyUsersPass } from "../controllers/userController";
import { authenticate } from "../middleware/auth";
import { userValidationRules, validate, userParamsValidationChain } from "../middleware/inputValidator";
import { loginLimiter } from "../middleware/rateLimiter";

export const userRouter = express.Router();

userRouter.post("/login", userValidationRules(), validate, loginLimiter, login);
userRouter.post("/signup", userValidationRules(), validate, signup);
userRouter.delete("/:userId", userParamsValidationChain(), validate, authenticate, deleteUser);
userRouter.get("/", authenticate, getCurrentUser);
userRouter.put("/:userId", userParamsValidationChain(), userValidationRules(), validate, authenticate, modifyUsersPass);
