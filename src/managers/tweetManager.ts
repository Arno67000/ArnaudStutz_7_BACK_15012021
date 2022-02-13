import { getRepository } from "typeorm";
import { Tweet } from "../entity/Tweet";
import { User } from "../entity/User";
import { findUser } from "./userManager";
import { ApiError } from "../tools/customError";

export async function getAll(): Promise<Tweet[]> {
    const tweetRepo = getRepository(Tweet);
    const allTweets = await tweetRepo.find({
        relations: ["user"],
        order: { date: "DESC" },
    });
    return allTweets.reduce((acc: Tweet[], curr: Tweet) => {
        acc.push(decodeTweet(curr));
        return acc;
    }, []);
}

export async function getOne(id: string): Promise<Tweet> {
    const tweetRepo = getRepository(Tweet);
    const tweet = await tweetRepo.findOne(id);
    if (!tweet) {
        throw new ApiError("Error", "Tweet not found", 404);
    }
    return tweet;
}

export async function saveTweet(tweet: Tweet): Promise<Tweet> {
    const tweetRepo = getRepository(Tweet);
    await tweetRepo.save(tweet);
    return (await tweetRepo.findOne({
        relations: ["user"],
        where: { content: tweet.content },
    })) as Tweet;
}

export async function removeTweet(tweet: Tweet): Promise<void> {
    const tweetRepo = getRepository(Tweet);
    await tweetRepo.remove(tweet);
}

export async function checkUserTweet(tweetId: string, userId: string): Promise<void> {
    const user = await findUser({ key: "id", value: userId, relations: true });
    const valid = user.tweets.find((tweet) => tweet.id === tweetId);
    if (!valid) {
        throw new ApiError("Error", "Forbidden action", 403);
    }
    return;
}

export function encodeTweetContent(tweet: Tweet): Tweet {
    tweet.content = encodeURI(tweet.content);
    return tweet;
}

export function decodeTweet(tweet: Tweet): Tweet {
    tweet.content = decodeURI(tweet.content);
    tweet.user = {
        pseudo: decodeURI(tweet.user.pseudo),
        id: tweet.user.id,
    } as User;
    return tweet;
}
