import * as express from 'express';
import { auth } from '../middleware/auth';
import { deleteTweet, getAllTweets, modifyTweet, postTweet } from '../controllers/tweet';

export const tweetRouter = express.Router();

tweetRouter.get('/', auth, getAllTweets);
tweetRouter.post('/', auth, postTweet);
tweetRouter.delete('/:tweetId', auth, deleteTweet);
tweetRouter.put('/:tweetId', auth, modifyTweet);