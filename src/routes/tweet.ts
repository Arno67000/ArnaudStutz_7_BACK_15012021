import * as express from 'express';
import { auth, tweetAuth } from '../middleware/auth';
import { deleteTweet, getAllTweets, postTweet } from '../controllers/tweet';

export const tweetRouter = express.Router();

tweetRouter.get('/', getAllTweets);

tweetRouter.post('/', auth, postTweet);

tweetRouter.delete('/:id', tweetAuth, deleteTweet);