import { NextFunction, Request, Response } from 'express';
import * as jwebtkn from 'jsonwebtoken';

export function auth(req: Request, res:Response, next: NextFunction) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const checkedToken: any = jwebtkn.verify(token, 'CRYPTAGEDUTOKEN2226080389');
        const userId = checkedToken.id;
        const userRole = checkedToken.role
        req.body.allowedUser = {id: userId, role: userRole};
        console.log(req.body)
        if(userId && userRole) {
            next();
        } else {
            return res.status(403).json({ message: 'La requête nécessite authentification.'});  
        };    
    }
    catch(err) {
        return res.status(500).json({ err });
    };
};
