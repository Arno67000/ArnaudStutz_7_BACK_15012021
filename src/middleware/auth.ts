import { NextFunction, Request, Response } from 'express';
import * as jwebtkn from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import { User } from '../entity/User';

export function auth(req: Request, res:Response, next: NextFunction) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const checkedToken: any = jwebtkn.verify(token, 'CRYPTAGEDUTOKEN2226080389');
        const userId = checkedToken.id? checkedToken.id : '';
        if ((req.body.id || req.params.id) && (req.body.id || req.params.id) !== userId) {
            return res.status(401).json({ message: 'Id utilisateur non valide.'})
        } else {
            next()
        };
    }
    catch {
        return res.status(403).json({ message: 'La requête nécessite authentification.'})
    };
};

export async function tweetAuth(req: Request, res:Response, next: NextFunction) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const checkedToken: any = jwebtkn.verify(token, 'CRYPTAGEDUTOKEN2226080389');
        const userId = checkedToken.id? checkedToken.id : '';
        const repo = getRepository(User);
        let user: User = await repo.findOne(
            {id:userId},
            {relations: ["tweets"]})
        if(user) {
            let tweet: boolean = false;
            user.tweets.forEach(element => {
                if (req.params.id === element.id) {
                    console.log(element);
                    tweet = true;
                }
            });   
            if (!tweet) {
                return res.status(401).json({ message: 'Id tweet non valide.'})
            } else {
                next()
            };
        } else {
            return res.status(401).json({ message: 'Id utilisateur non valide.'})
        };
    }
    catch {
        return res.status(403).json({ message: 'La requête nécessite authentification.'})
    };
};