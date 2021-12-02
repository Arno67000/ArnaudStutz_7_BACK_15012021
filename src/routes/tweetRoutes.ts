import * as express from "express";
import { auth } from "../middleware/auth";
import { deleteTweet, getAllTweets, modifyTweet, postTweet } from "../controllers/tweetController";
import { inputValidationRules, validate, tweetParamsValidationChain } from "../middleware/inputValidator";

export const tweetRouter = express.Router();

tweetRouter.get("/", auth, getAllTweets);
tweetRouter.post("/", inputValidationRules(), validate, auth, postTweet);
tweetRouter.delete("/:tweetId", tweetParamsValidationChain(), validate, auth, deleteTweet);
tweetRouter.put("/:tweetId", tweetParamsValidationChain(), inputValidationRules(), validate, auth, modifyTweet);
