import * as express from "express";
import { login, signup, deleteUser, getCurrentUser, modifyUsersPass } from "../controllers/userController";
import { auth } from "../middleware/auth";
import { userValidationRules, validate, userParamsValidationChain } from "../middleware/inputValidator";
import { loginLimiter } from "../middleware/rateLimiter";

export const userRouter = express.Router();

userRouter.post("/login", userValidationRules(), validate, loginLimiter, login);
userRouter.post("/signup", userValidationRules(), validate, signup);
userRouter.delete("/:userId", userParamsValidationChain(), validate, auth, deleteUser);
userRouter.get("/", auth, getCurrentUser);
userRouter.put("/:userId", userParamsValidationChain(), userValidationRules(), validate, auth, modifyUsersPass);
