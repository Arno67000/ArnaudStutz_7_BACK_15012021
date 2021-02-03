"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.modifyTweet = exports.deleteTweet = exports.postTweet = exports.getAllTweets = void 0;
const typeorm_1 = require("typeorm");
const Tweet_1 = require("../entity/Tweet");
const User_1 = require("../entity/User");
function getAllTweets(req, res, next) {
    //Vérification token
    if (req.body.allowedUser) {
        const repo = typeorm_1.getRepository(Tweet_1.Tweet);
        repo.find({
            relations: ["user"],
            order: { date: "DESC" }
        })
            .then((tweets) => {
            let allTweets = tweets;
            allTweets.forEach(tweet => {
                tweet.content = decodeURI(tweet.content);
                tweet.user.pseudo = decodeURI(tweet.user.pseudo); //Décode le contenu du tweet
            });
            return res.status(200).json(allTweets);
        })
            .catch(error => res.status(400).json({ error }));
    }
    else {
        return res.status(403).json({ message: 'La requête nécessite une authentification' });
    }
}
exports.getAllTweets = getAllTweets;
;
function postTweet(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //Vérification de la correspondance de l'id du token avec l'id de l'auteur du tweet
        if (req.body.user.id === req.body.allowedUser.id) {
            const repo = typeorm_1.getRepository(Tweet_1.Tweet);
            let tweet = new Tweet_1.Tweet();
            tweet = Object.assign(Object.assign({}, req.body), { content: encodeURI(req.body.content) //encodage du contenu
             });
            console.log(tweet);
            yield repo.save(tweet)
                .then(() => console.log('tweet saved !'))
                .catch(error => {
                console.log(error);
                return res.status(500).json({ error });
            });
            //Récupération du tweet avec son Id (créée par typeOrm) et son contenu décodé
            repo.findOne({
                relations: ["user"],
                where: { content: tweet.content }
            })
                .then((newTweet) => {
                const tweet = Object.assign(Object.assign({}, newTweet), { content: decodeURI(newTweet.content), user: Object.assign(Object.assign({}, newTweet.user), { pseudo: decodeURI(newTweet.user.pseudo) }) });
                return res.status(201).json(tweet);
            })
                .catch(err => res.status(500).json({ err }));
        }
        else {
            return res.status(403).json({ message: 'La requête nécessite une authentification' });
        }
        ;
    });
}
exports.postTweet = postTweet;
;
function deleteTweet(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const repo = typeorm_1.getRepository(Tweet_1.Tweet);
        if (req.body.allowedUser && req.body.allowedUser.role === "Moderateur") {
            //Si token modérateur, suppression du tweet
            yield repo.findOne({ id: req.params.tweetId })
                .then((tweet) => {
                repo.remove(tweet).then(() => res.status(200).json({ message: 'Tweet supprimé!!' })).catch(err => res.status(500).json({ error: err }));
            })
                .catch(error => res.status(404).json({ message: 'Aucun tweet trouvé avec cet ID : ' + error }));
        }
        else if (req.body.allowedUser && req.body.allowedUser.role === "User") {
            //Si token utilisateur, recherche de l'utilisateur par l'Id du token.
            const userRepo = typeorm_1.getRepository(User_1.User);
            const user = yield userRepo.findOne({
                relations: ["tweets"],
                where: { id: req.body.allowedUser.id }
            })
                .catch(error => res.status(500).json({ message: error }));
            if (user instanceof User_1.User) {
                let validTweet = user.tweets.find(tweet => tweet.id === req.params.tweetId); //Vérification de l'appartenance du tweet à l'utilisateur
                if (validTweet) {
                    //Suppression du tweet
                    repo.findOne({ id: req.params.tweetId })
                        .then((tweet) => {
                        repo.remove(tweet)
                            .then(() => res.status(200).json({ message: 'Tweet supprimé!!' }))
                            .catch(err => res.status(500).json({ error: err }));
                    })
                        .catch(err => res.status(500).json({ error: err }));
                }
                else {
                    res.status(404).json({ message: "Le tweet est introuvable chez l'utilisateur !!" });
                }
                ;
            }
            else {
                return res.status(404).json({ message: 'Aucun utilisateur trouvé avec cet identifiant !!' });
            }
            ;
        }
        else {
            return res.status(403).json({ message: 'La requête nécessite une authentification' });
        }
        ;
    });
}
exports.deleteTweet = deleteTweet;
;
function modifyTweet(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const repo = typeorm_1.getRepository(Tweet_1.Tweet);
        if (req.body.allowedUser.role === 'Moderateur' && req.body.allowedUser.id !== req.body.user.id) {
            //Si Token modérateur => Modération du tweet : changement du 'content' par un message préparé
            console.log('MODERATION !!');
            repo.findOne({
                relations: ["user"],
                where: { id: req.params.tweetId }
            })
                .then(tweet => {
                tweet.content = encodeURI(req.body.content);
                repo.save(tweet)
                    .then(() => {
                    let modifiedTweet = Object.assign(Object.assign({}, tweet), { content: decodeURI(tweet.content), user: Object.assign(Object.assign({}, tweet.user), { pseudo: decodeURI(tweet.user.pseudo) }) });
                    return res.status(200).json(modifiedTweet);
                })
                    .catch(err => res.status(500).json({ error: err }));
            })
                .catch(err => res.status(404).json({ message: 'Aucun tweet trouvé avec cet identifiant : ', err }));
        }
        else if (req.body.allowedUser.id === req.body.user.id) {
            //Si token utilisateur, recherche de l'utilisateur par l'id du token.
            console.log('MODIFICATION !!');
            const userRepo = typeorm_1.getRepository(User_1.User);
            const user = yield userRepo.findOne({
                relations: ["tweets"],
                where: { id: req.body.allowedUser.id }
            })
                .catch(error => res.status(500).json({ message: error }));
            if (user instanceof User_1.User) {
                let validTweet = user.tweets.find(tweet => tweet.id === req.params.tweetId); //Vérification de l'appartenance du tweet à l'utilisateur
                if (validTweet) {
                    //Modification du tweet
                    const tweet = yield repo.findOne({
                        relations: ["user"],
                        where: { id: req.params.tweetId }
                    });
                    tweet.content = encodeURI(req.body.content);
                    yield repo.save(tweet)
                        .then(() => res.status(200).json(Object.assign(Object.assign({}, tweet), { content: decodeURI(tweet.content), user: Object.assign(Object.assign({}, tweet.user), { pseudo: decodeURI(tweet.user.pseudo) }) })))
                        .catch(error => {
                        console.log(error);
                        return res.status(500).json({ error });
                    });
                }
                else {
                    res.status(404).json({ message: "Le tweet est introuvable chez l'utilisateur !!" });
                }
                ;
            }
            else {
                return res.status(404).json({ message: 'Aucun utilisateur trouvé avec cet identifiant !!' });
            }
            ;
        }
        else {
            return res.status(403).json({ message: 'La requête nécessite une authentification' });
        }
        ;
    });
}
exports.modifyTweet = modifyTweet;
;
//# sourceMappingURL=tweet.js.map