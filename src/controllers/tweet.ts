import { getRepository } from "typeorm";
import { Request, Response } from "express";
import { Tweet } from "../entity/Tweet";
import { User } from "../entity/User";

export function getAllTweets(req: Request, res: Response) {
    //Vérification token
    if (req.body.allowedUser) {
        const repo = getRepository(Tweet);
        repo.find({
            relations: ["user"],
            order: { date: "DESC" },
        })
            .then((tweets: Tweet[]) => {
                const allTweets = tweets;
                allTweets.forEach((tweet) => {
                    tweet.content = decodeURI(tweet.content);
                    tweet.user.pseudo = decodeURI(tweet.user.pseudo); //Décode le contenu du tweet
                });
                return res.status(200).json(allTweets);
            })
            .catch((error) => res.status(400).json({ error }));
    } else {
        return res.status(403).json({ message: "La requête nécessite une authentification" });
    }
}

export async function postTweet(req: Request, res: Response) {
    //Vérification de la correspondance de l'id du token avec l'id de l'auteur du tweet
    if (req.body.user.id === req.body.allowedUser.id) {
        const repo = getRepository(Tweet);
        let tweet = new Tweet();
        tweet = {
            ...req.body,
            content: encodeURI(req.body.content), //encodage du contenu
        };
        await repo.save(tweet);
        //Récupération du tweet avec son Id (créée par typeOrm) et son contenu décodé
        const updatedTweet = await repo.findOne({
            relations: ["user"],
            where: { content: tweet.content },
        });
        if (updatedTweet instanceof Tweet) {
            // tweet = {
            //     ...updatedTweet,
            //     content: decodeURI(updatedTweet.content),
            //     user: {
            //         ...updatedTweet.user,
            //         pseudo: decodeURI(updatedTweet.user.pseudo),
            //     }
            // };

            res.status(201).json(updatedTweet);
        }
    } else {
        return res.status(403).json({ message: "La requête nécessite une authentification" });
    }
}

export async function deleteTweet(req: Request, res: Response) {
    const repo = getRepository(Tweet);

    if (req.body.allowedUser && req.body.allowedUser.role === "Moderateur") {
        //Si token modérateur, suppression du tweet
        const tweet = await repo.findOne({ id: req.params.tweetId });
        if (tweet instanceof Tweet) {
            await repo.remove(tweet);
            res.status(200).json({ message: "Tweet supprimé!!" });
        }
    } else if (req.body.allowedUser && req.body.allowedUser.role === "User") {
        //Si token utilisateur, recherche de l'utilisateur par l'Id du token.
        const userRepo = getRepository(User);
        const user = await userRepo.findOne({
            relations: ["tweets"],
            where: { id: req.body.allowedUser.id },
        });
        if (user instanceof User) {
            const validTweet = user.tweets.find((tweet) => tweet.id === req.params.tweetId); //Vérification de l'appartenance du tweet à l'utilisateur
            if (validTweet) {
                //Suppression du tweet
                const tweet = await repo.findOne({ id: req.params.tweetId });
                if (tweet instanceof Tweet) {
                    await repo.remove(tweet);
                    res.status(200).json({ message: "Tweet supprimé!!" });
                }
            } else {
                res.status(404).json({ message: "Le tweet est introuvable chez l'utilisateur !!" });
            }
        } else {
            return res.status(404).json({ message: "Aucun utilisateur trouvé avec cet identifiant !!" });
        }
    } else {
        return res.status(403).json({ message: "La requête nécessite une authentification" });
    }
}

export async function modifyTweet(req: Request, res: Response) {
    const repo = getRepository(Tweet);
    if (req.body.allowedUser.role === "Moderateur" && req.body.allowedUser.id !== req.body.user.id) {
        //Si Token modérateur => Modération du tweet : changement du 'content' par un message préparé
        console.log("MODERATION !!");
        const tweet = await repo.findOne({
            relations: ["user"],
            where: { id: req.params.tweetId },
        });
        if (tweet instanceof Tweet) {
            tweet.content = encodeURI(req.body.content);
            await repo.save(tweet);
            const modifiedTweet = {
                ...tweet,
                content: decodeURI(tweet.content),
                user: {
                    ...tweet.user,
                    pseudo: decodeURI(tweet.user.pseudo),
                },
            };
            return res.status(200).json(modifiedTweet);
        }
    } else if (req.body.allowedUser.id === req.body.user.id) {
        //Si token utilisateur, recherche de l'utilisateur par l'id du token.
        console.log("MODIFICATION !!");
        const userRepo = getRepository(User);
        const user = await userRepo.findOne({
            relations: ["tweets"],
            where: { id: req.body.allowedUser.id },
        });
        if (user instanceof User) {
            const validTweet = user.tweets.find((tweet) => tweet.id === req.params.tweetId); //Vérification de l'appartenance du tweet à l'utilisateur
            if (validTweet) {
                //Modification du tweet
                const tweet = await repo.findOne({
                    relations: ["user"],
                    where: { id: req.params.tweetId },
                });
                if (tweet instanceof Tweet) {
                    tweet.content = encodeURI(req.body.content);
                    await repo.save(tweet);
                    res.status(200).json({
                        ...tweet,
                        content: decodeURI(tweet.content),
                        user: {
                            ...tweet.user,
                            pseudo: decodeURI(tweet.user.pseudo),
                        },
                    });
                }
            } else {
                res.status(404).json({ message: "Le tweet est introuvable chez l'utilisateur !!" });
            }
        } else {
            return res.status(404).json({ message: "Aucun utilisateur trouvé avec cet identifiant !!" });
        }
    } else {
        return res.status(403).json({ message: "La requête nécessite une authentification" });
    }
}
