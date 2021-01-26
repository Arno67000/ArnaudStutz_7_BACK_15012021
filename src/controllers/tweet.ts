import { getRepository } from "typeorm";
import { Request, Response, NextFunction } from "express";
import { Tweet } from '../entity/Tweet';

export function getAllTweets(req: Request, res: Response, next: NextFunction) {
    const repo = getRepository(Tweet);
    repo.find({
        relations: ["user"],
        order:{date: "DESC"}
    })
        .then((tweets: Tweet[]) => res.status(200).json( tweets ))
        .catch(error => res.status(400).json({ error }));
};

export function postTweet(req: Request, res: Response, next: NextFunction) {
    const repo = getRepository(Tweet);
    const tweet = new Tweet();
    tweet.content = req.body.content;
    tweet.user = req.body.user;
    console.log(tweet);
    repo.save(tweet)
        .then(() => res.status(201).json({message:"Tweet créé !"}))
        .catch(error => {
            console.log(error);
            res.status(500).json({ error });
        });
};

export async function deleteTweet(req: Request, res: Response, next: NextFunction) {
    const repo = getRepository(Tweet);
    const tweet = await repo.findOne({id:req.params.id}).catch(error => console.log('pas de tweet trouvé avec cet id : ',error)); 
    if (tweet) {
        repo.remove(tweet)
            .then(() => res.status(200).json({message: 'Tweet supprimé!!'}))
            .catch(err => res.status(500).json({message: err}));
    }
}