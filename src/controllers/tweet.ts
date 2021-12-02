import { getRepository } from "typeorm";
import { Request, Response } from "express";
import { Tweet } from "../entity/Tweet";
import { User } from "../entity/User";

export async function getAllTweets(req: Request, res: Response): Promise<Response> {
    try {
        //Token verification
        if (!req.body.allowedUser) {
            return res.status(403).json({ error: "Authentication required" });
        }
        const repo = getRepository(Tweet);
        const allTweets = await repo.find({
            relations: ["user"],
            order: { date: "DESC" },
        });
        allTweets.forEach((tweet) => {
            tweet.content = decodeURI(tweet.content);
            tweet.user.pseudo = decodeURI(tweet.user.pseudo);
        });
        return res.status(200).json(allTweets);
    } catch (error) {
        return res.status(500).json({ Error: error });
    }
}

export async function postTweet(req: Request, res: Response): Promise<Response> {
    try {
        //Token verification
        if (!req.body.user.id === req.body.allowedUser.id) {
            return res.status(403).json({ error: "Authentication required" });
        }
        const repo = getRepository(Tweet);
        let tweet = new Tweet();
        tweet = {
            ...req.body,
            content: encodeURI(req.body.content),
        };
        await repo.save(tweet);
        const updatedTweet = (await repo.findOne({
            relations: ["user"],
            where: { content: tweet.content },
        })) as Tweet;
        return res.status(201).json({
            ...updatedTweet,
            content: decodeURI(updatedTweet.content),
            user: {
                ...updatedTweet.user,
                pseudo: decodeURI(updatedTweet.user.pseudo),
            },
        });
    } catch (error) {
        return res.status(500).json({ Error: error });
    }
}

export async function deleteTweet(req: Request, res: Response): Promise<Response> {
    try {
        const repo = getRepository(Tweet);
        if (!req.body.user.id === req.body.allowedUser.id) {
            return res.status(403).json({ error: "Authentication required" });
        }
        if (req.body.allowedUser.role === "Moderateur") {
            const tweet = await repo.findOne({ id: req.params.tweetId });
            if (!tweet) {
                return res.status(404).json({ message: "Tweet not found" });
            }
            await repo.remove(tweet);
        }
        if (req.body.allowedUser.role === "User") {
            const userRepo = getRepository(User);
            const user = await userRepo.findOne({
                relations: ["tweets"],
                where: { id: req.body.allowedUser.id },
            });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            const validTweet = user.tweets.find((tweet) => tweet.id === req.params.tweetId);
            if (!validTweet) {
                return res.status(404).json({ message: "Tweet not found" });
            }
            const tweet = (await repo.findOne({ id: req.params.tweetId })) as Tweet;
            await repo.remove(tweet);
        }
        return res.status(200).json({ message: "Tweet successfully deleted" });
    } catch (error) {
        return res.status(500).json({ Error: error });
    }
}

export async function modifyTweet(req: Request, res: Response): Promise<Response> {
    try {
        const repo = getRepository(Tweet);
        if (!req.body.allowedUser) {
            return res.status(403).json({ error: "Authentication required" });
        }
        const userRepo = getRepository(User);
        const user = await userRepo.findOne({
            relations: ["tweets"],
            where: { id: req.body.allowedUser.id },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const validTweet = user.tweets.find((tweet) => tweet.id === req.params.tweetId);
        if (!validTweet && req.body.allowedUser.id === req.body.user.id) {
            return res.status(404).json({ message: "Tweet not found" });
        }
        const tweet = await repo.findOne({
            relations: ["user"],
            where: { id: req.params.tweetId },
        });
        if (!tweet) {
            return res.status(404).json({ message: "Tweet not found" });
        }
        tweet.content = encodeURI(req.body.content);
        await repo.save(tweet);

        return res.status(200).json({
            ...tweet,
            content: decodeURI(tweet.content),
            user: {
                ...tweet.user,
                pseudo: decodeURI(tweet.user.pseudo),
            },
        });
    } catch (error) {
        return res.status(500).json({ Error: error });
    }
}
