import { NextFunction, Request, Response } from "express";
import * as jwebtkn from "jsonwebtoken";

export function auth(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.headers.authorization ? req.headers.authorization.split(" ")[1] : undefined;
        const checkedToken = token ? jwebtkn.verify(token, "CRYPTAGEDUTOKEN2226080389") : token;
        if (checkedToken && typeof checkedToken !== "string") {
            const userId = checkedToken.id;
            const userRole = checkedToken.role;
            req.body.allowedUser = { id: userId, role: userRole };
            console.log(req.body);
            if (userId && userRole) {
                next();
            } else {
                res.status(403).json({ message: "La requête nécessite authentification." });
            }
        } else {
            res.status(403).json({ message: "La requête nécessite authentification." });
        }
    } catch (err) {
        return res.status(500).json({ err });
    }
}
