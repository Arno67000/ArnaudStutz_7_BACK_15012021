import { getRepository } from "typeorm";
import { Request, Response, NextFunction } from "express";
import { Tweet } from '../entity/Tweet';
import { User } from "../entity/User";

export function getAllTweets(req: Request, res: Response, next: NextFunction) {
    if (req.body.allowedUser) {
        const repo = getRepository(Tweet);
        repo.find({
            relations: ["user"],
            order:{date: "DESC"}
        })
            .then((tweets: Tweet[]) => res.status(200).json( tweets ))
            .catch(error => res.status(400).json({ error }));
    } else {
        return res.status(403).json({ message: 'La requête nécessite une authentification'});
    }    
};

export async function postTweet(req: Request, res: Response, next: NextFunction) {
    if(req.body.user.id === req.body.allowedUser.id) {
        const repo = getRepository(Tweet);
        let tweet = new Tweet();
        tweet = { 
            ...req.body,
            content: req.body.content.replace(/[\$\=\*]*/gm,'')
         };
        console.log(tweet);
        await repo.save(tweet)
            .then(() => console.log('tweet saved !'))
            .catch(error => {
                console.log(error);
                res.status(500).json({ error });
            });
        repo.findOne({
            relations: ["user"],
            where: {content: tweet.content}
        })
            .then((newTweet) => res.status(201).json(newTweet))
            .catch(err => res.status(500).json({ err }));
    } else {
        return res.status(403).json({ message: 'La requête nécessite une authentification'});
    };   
};

export async function deleteTweet(req: Request, res: Response, next: NextFunction) {
    if (req.body.allowedUser) {
        const repo = getRepository(Tweet);
        const userRepo = getRepository(User);
        const user: User = await userRepo.findOne({
            relations: ["tweets"],
            where: {id: req.body.allowedUser.id}
        })
        if (user) {
            let validTweet = user.tweets.find(tweet=>  tweet.id === req.params.tweetId);
            if (validTweet) {
                const tweet = await repo.findOne({id: req.params.tweetId});
                repo.remove(tweet)
                    .then(() => res.status(200).json({message: 'Tweet supprimé!!'}))
                    .catch(err => res.status(500).json({ error: err}));
            } else {
                res.status(404).json({ message : "Le tweet est introuvable chez l'utilisateur !!"});
            }
        } else {
            return res.status(404).json({ message: 'Aucun utilisateur trouvé avec cet identifiant !!'});
        };
    } else {
        return res.status(403).json({ message: 'La requête nécessite une authentification'});
    };
};

export async function modifyTweet(req: Request, res: Response, next: NextFunction) {
    const repo = getRepository(Tweet);
    if (req.body.allowedUser.role === 'Moderateur' && req.body.allowedUser.id !== req.body.user.id) {
        console.log('MODERATION !!');
        repo.findOne({
            relations:["user"],
            where: {id: req.params.tweetId}
        })
            .then(tweet => {
                tweet.content = req.body.content.replace(/[\$\=\*]*/gm,'');
                repo.save(tweet).then(() => res.status(200).json(tweet)).catch(err => res.status(500).json({ error: err}));
            })
            .catch(err => res.status(404).json({ message: 'Aucun tweet trouvé avec cet identifiant : ', err}));

    } else if (req.body.allowedUser.id === req.body.user.id) {
        console.log('MODIFICATION !!');
        const userRepo = getRepository(User);
        const user: User = await userRepo.findOne({
            relations: ["tweets"],
            where: {id: req.body.allowedUser.id}
        });
        if(user) {
            let validTweet = user.tweets.find(tweet=>  tweet.id === req.params.tweetId); 
            if(validTweet) {
                const tweet = await repo.findOne({
                    relations: ["user"],
                    where: {id: req.params.tweetId}
                });
                tweet.content =  req.body.content.replace(/[\$\=\*]*/gm,'');
                await repo.save(tweet)
                    .then(() => res.status(200).json(tweet))
                    .catch(error => {
                        console.log(error);
                        return res.status(500).json({ error });
                    });

            } else {
                res.status(404).json({ message : "Le tweet est introuvable chez l'utilisateur !!"});
            };
        } else {
            return res.status(404).json({ message: 'Aucun utilisateur trouvé avec cet identifiant !!' });
        };

    } else {
        return res.status(403).json({ message: 'La requête nécessite une authentification'});
    };
};