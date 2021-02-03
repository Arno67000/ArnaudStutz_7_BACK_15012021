"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tweetRouter = void 0;
const express = require("express");
const auth_1 = require("../middleware/auth");
const tweet_1 = require("../controllers/tweet");
const inputValidator_1 = require("../middleware/inputValidator");
exports.tweetRouter = express.Router();
exports.tweetRouter.get('/', auth_1.auth, tweet_1.getAllTweets);
exports.tweetRouter.post('/', inputValidator_1.inputValidationRules(), inputValidator_1.validate, auth_1.auth, tweet_1.postTweet);
exports.tweetRouter.delete('/:tweetId', auth_1.auth, tweet_1.deleteTweet);
exports.tweetRouter.put('/:tweetId', inputValidator_1.inputValidationRules(), inputValidator_1.validate, auth_1.auth, tweet_1.modifyTweet);
//# sourceMappingURL=tweet.js.map