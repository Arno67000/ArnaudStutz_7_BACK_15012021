import * as express from "express";
import { authenticate } from "../middleware/auth";
import { deleteTweet, getAllTweets, modifyTweet, postTweet } from "../controllers/tweetController";
import { inputValidationRules, validate, tweetParamsValidationChain } from "../middleware/inputValidator";

export const tweetRouter = express.Router();

tweetRouter.get("/", authenticate, getAllTweets);
tweetRouter.post("/", inputValidationRules(), validate, authenticate, postTweet);
tweetRouter.delete("/:tweetId", tweetParamsValidationChain(), validate, authenticate, deleteTweet);
tweetRouter.put("/:tweetId", tweetParamsValidationChain(), inputValidationRules(), validate, authenticate, modifyTweet);
