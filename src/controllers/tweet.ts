import { getRepository } from "typeorm";
import { Request, Response, NextFunction } from "express";
import { Tweet } from '../entity/Tweet';
import { User } from "../entity/User";

export function getAllTweets(req: Request, res: Response, next: NextFunction) {
    //Vérification token
    if (req.body.allowedUser) {
        const repo = getRepository(Tweet);
        repo.find({
            relations: ["user"],
            order:{date: "DESC"}
        })
            .then((tweets: Tweet[]) => {   
                let allTweets = tweets;
                allTweets.forEach(tweet => {
                    tweet.content = decodeURI(tweet.content);
                    tweet.user.pseudo = decodeURI(tweet.user.pseudo) //Décode le contenu du tweet
                });
                return res.status(200).json( allTweets );
            })
            .catch(error => res.status(400).json({ error }));
    } else {
        return res.status(403).json({ message: 'La requête nécessite une authentification'});
    }    
};

export async function postTweet(req: Request, res: Response, next: NextFunction) {
    //Vérification de la correspondance de l'id du token avec l'id de l'auteur du tweet
    if(req.body.user.id === req.body.allowedUser.id) {
        const repo = getRepository(Tweet);
        let tweet = new Tweet();
        tweet = {
            ...req.body,
            content: encodeURI(req.body.content)  //encodage du contenu
        };
        console.log(tweet);
        await repo.save(tweet)
            .then(() => console.log('tweet saved !'))
            .catch(error => {
                console.log(error);
                return res.status(500).json({ error });
            });
        //Récupération du tweet avec son Id (créée par typeOrm) et son contenu décodé
        repo.findOne({
            relations: ["user"],
            where: {content: tweet.content}
        })
            .then((newTweet) => {
                const tweet = {
                    ...newTweet,
                    content: decodeURI(newTweet.content),
                    user: {
                        ...newTweet.user,
                        pseudo: decodeURI(newTweet.user.pseudo)
                    }
                };
                return res.status(201).json(tweet);
            })
            .catch(err => res.status(500).json({ err }));
    } else {
        return res.status(403).json({ message: 'La requête nécessite une authentification'});
    };   
};

export async function deleteTweet(req: Request, res: Response, next: NextFunction) {

    const repo = getRepository(Tweet);
    
    if (req.body.allowedUser && req.body.allowedUser.role === "Moderateur") { 

        //Si token modérateur, suppression du tweet
        await repo.findOne({id: req.params.tweetId})
            .then((tweet) => {
                repo.remove(tweet).then(() => res.status(200).json({message: 'Tweet supprimé!!'})).catch(err => res.status(500).json({ error: err}));
            })
            .catch(error => res.status(404).json({message: 'Aucun tweet trouvé avec cet ID : '+error}));

    } else if (req.body.allowedUser && req.body.allowedUser.role === "User") { 
        //Si token utilisateur, recherche de l'utilisateur par l'Id du token.
        const userRepo = getRepository(User);
        const user = await userRepo.findOne({
            relations: ["tweets"],
            where: {id: req.body.allowedUser.id}
        })
        .catch(error => res.status(500).json({ message: error }));

        if (user instanceof User) {
            let validTweet = user.tweets.find(tweet=>  tweet.id === req.params.tweetId); //Vérification de l'appartenance du tweet à l'utilisateur
            if (validTweet) {
                //Suppression du tweet
                repo.findOne({id: req.params.tweetId})
                    .then((tweet) => {
                        repo.remove(tweet)
                            .then(() => res.status(200).json({message: 'Tweet supprimé!!'}))
                            .catch(err => res.status(500).json({ error: err}));
                    })
                    .catch(err => res.status(500).json({ error: err }));
            } else {
                res.status(404).json({ message : "Le tweet est introuvable chez l'utilisateur !!"});
            };
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
        //Si Token modérateur => Modération du tweet : changement du 'content' par un message préparé
        console.log('MODERATION !!');
        repo.findOne({
            relations:["user"],
            where: {id: req.params.tweetId}
        })
            .then(tweet => {
                tweet.content = encodeURI(req.body.content);
                repo.save(tweet)
                    .then(() => {
                        let modifiedTweet = {
                            ...tweet,
                            content: decodeURI(tweet.content),
                            user: {
                                ...tweet.user,
                                pseudo: decodeURI(tweet.user.pseudo)
                            }
                        }
                        return res.status(200).json(modifiedTweet);
                    })
                    .catch(err => res.status(500).json({ error: err}));
            })
            .catch(err => res.status(404).json({ message: 'Aucun tweet trouvé avec cet identifiant : ', err}));

    } else if (req.body.allowedUser.id === req.body.user.id) {
        //Si token utilisateur, recherche de l'utilisateur par l'id du token.
        console.log('MODIFICATION !!');
        const userRepo = getRepository(User);
        const user = await userRepo.findOne({
            relations: ["tweets"],
            where: {id: req.body.allowedUser.id}
        })
        .catch(error => res.status(500).json({ message: error }));
        if(user instanceof User) {
            let validTweet = user.tweets.find(tweet=>  tweet.id === req.params.tweetId); //Vérification de l'appartenance du tweet à l'utilisateur
            if(validTweet) {
                //Modification du tweet
                const tweet = await repo.findOne({
                    relations: ["user"],
                    where: {id: req.params.tweetId}
                });
                tweet.content =  encodeURI(req.body.content);
                await repo.save(tweet)
                    .then(() => res.status(200).json({
                        ...tweet,
                        content: decodeURI(tweet.content),
                        user: {
                            ...tweet.user,
                            pseudo: decodeURI(tweet.user.pseudo)
                        }
                    }))
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