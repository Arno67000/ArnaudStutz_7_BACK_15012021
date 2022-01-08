import { Request, Response } from "express";
import { Tweet } from "../entity/Tweet";
import {
    getAll,
    saveTweet,
    encodeTweetContent,
    decodeTweet,
    getOne,
    removeTweet,
    checkUserTweet,
} from "../managers/tweetManager";
import { ApiError } from "../tools/customError";

export async function getAllTweets(req: Request, res: Response): Promise<Response> {
    try {
        //Token verification
        if (!req.body.allowedUser) {
            return res.status(403).json({ error: "Authentication required" });
        }
        const allTweets = await getAll();
        return res.status(200).json(allTweets);
    } catch (error) {
        return res.status(500).json({ Error: error });
    }
}

export async function postTweet(req: Request, res: Response): Promise<Response> {
    try {
        //Token verification
        if (req.body.user.id !== req.body.allowedUser.id) {
            return res.status(403).json({ error: "Authentication required" });
        }
        let tweet = new Tweet();
        tweet = encodeTweetContent(req.body);
        const createdTweet = await saveTweet(tweet);
        return res.status(201).json(decodeTweet(createdTweet));
    } catch (error) {
        return res.status(500).json({ Error: error });
    }
}

export async function deleteTweet(req: Request, res: Response): Promise<Response> {
    try {
        if (!req.body.user.id === req.body.allowedUser.id) {
            return res.status(403).json({ error: "Authentication required" });
        }
        const tweet = await getOne(req.params.tweetId);
        if (req.body.allowedUser.role === "User") {
            await checkUserTweet(req.body.user.id, req.params.tweetId);
        }
        await removeTweet(tweet);
        return res.status(200).json({ message: "Tweet successfully deleted" });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.code).json({ Error: error.message });
        }
        return res.status(500).json({ Error: error });
    }
}

export async function modifyTweet(req: Request, res: Response): Promise<Response> {
    try {
        if (!req.body.allowedUser) {
            return res.status(403).json({ error: "Authentication required" });
        }
        const tweet = await getOne(req.params.tweetId);
        if (req.body.allowedUser.id === req.body.user.id) {
            await checkUserTweet(req.body.user.id, req.params.tweetId);
        }
        tweet.content = encodeURI(req.body.content);
        const updatedTweet = await saveTweet(tweet);
        return res.status(200).json(decodeTweet(updatedTweet));
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.code).json({ Error: error.message });
        }
        return res.status(500).json({ Error: error });
    }
}
