import * as express from "express";
import { login, signup, deleteUser, getCurrentUser, modifyUsersPass } from "../controllers/user";
import { auth } from "../middleware/auth";
import { userValidationRules, validate } from "../middleware/inputValidator";
import { loginLimiter } from "../middleware/rateLimiter";

export const userRouter = express.Router();

userRouter.post("/login", userValidationRules(), validate, loginLimiter, login);
userRouter.post("/signup", userValidationRules(), validate, signup);
userRouter.delete("/:userId", auth, deleteUser);
userRouter.get("/", auth, getCurrentUser);
userRouter.put("/:userId", userValidationRules(), validate, auth, modifyUsersPass);
