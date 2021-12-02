import { NextFunction, Request, Response } from "express";
import * as jwebtkn from "jsonwebtoken";
import { jwtSecret } from "../server";

export function auth(req: Request, res: Response, next: NextFunction): Response | void {
    try {
        const token = req.headers.authorization ? req.headers.authorization.split(" ")[1] : undefined;
        const checkedToken = token ? jwebtkn.verify(token, jwtSecret) : token;
        if (checkedToken && typeof checkedToken !== "string" && checkedToken.id && checkedToken.role) {
            const userId = checkedToken.id;
            const userRole = checkedToken.role;
            req.body.allowedUser = { id: userId, role: userRole };
            return next();
        } else {
            return res.status(403).json({ error: "Authentication required" });
        }
    } catch (err) {
        return res.status(500).json({ err });
    }
}
