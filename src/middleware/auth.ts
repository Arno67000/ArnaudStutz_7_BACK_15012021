import { NextFunction, Request, Response } from "express";
import * as jwebtkn from "jsonwebtoken";
import { logger } from "../logger/winstonConfig";

import dotenv from "dotenv";
dotenv.config();

export function authenticate(req: Request, res: Response, next: NextFunction): Response | void {
    const jwtSecret = process.env.SECRET as string;
    try {
        const token = req.headers.authorization ? req.headers.authorization.split(" ")[1] : undefined;
        const checkedToken = token ? jwebtkn.verify(token, jwtSecret) : token;
        if (checkedToken && typeof checkedToken !== "string" && checkedToken.id && checkedToken.role) {
            req.body.allowedUser = { id: checkedToken.id, role: checkedToken.role };
            return next();
        } else {
            return res.status(403).json({ error: "Authentication required" });
        }
    } catch (error) {
        logger.error(error);
        return res.status(500).json({ error });
    }
}
