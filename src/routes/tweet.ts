import * as express from "express";
import { auth } from "../middleware/auth";
import { deleteTweet, getAllTweets, modifyTweet, postTweet } from "../controllers/tweet";
import { inputValidationRules, validate } from "../middleware/inputValidator";

export const tweetRouter = express.Router();

tweetRouter.get("/", auth, getAllTweets);
tweetRouter.post("/", inputValidationRules(), validate, auth, postTweet);
tweetRouter.delete("/:tweetId", auth, deleteTweet);
tweetRouter.put("/:tweetId", inputValidationRules(), validate, auth, modifyTweet);
