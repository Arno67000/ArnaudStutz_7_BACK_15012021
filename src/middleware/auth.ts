import { NextFunction, Request, Response } from "express";
import * as jwebtkn from "jsonwebtoken";
import { jwtSecret } from "../server";

export function auth(req: Request, res: Response, next: NextFunction): void {
    try {
        const token = req.headers.authorization ? req.headers.authorization.split(" ")[1] : undefined;
        const checkedToken = token ? jwebtkn.verify(token, jwtSecret) : token;
        if (checkedToken && typeof checkedToken !== "string" && checkedToken.id && checkedToken.role) {
            const userId = checkedToken.id;
            const userRole = checkedToken.role;
            req.body.allowedUser = { id: userId, role: userRole };
            next();
        } else {
            res.status(403).json({ error: "Authentication required" });
        }
    } catch (err) {
        res.status(500).json({ err });
    }
}
