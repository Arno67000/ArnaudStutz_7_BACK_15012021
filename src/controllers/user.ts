import { Request, Response } from "express";
import { User } from "../entity/User";
import { ApiError } from "../tools/customError";

// managers
import { saveUser, checkUser, decodeUser, findUser, removeUser } from "../managers/userManager";

import dotenv from "dotenv";
dotenv.config();

export async function signup(req: Request, res: Response): Promise<void> {
    try {
        await saveUser(req.body, true);
        res.status(201).json({ message: "New user created" });
    } catch (error) {
        if (error instanceof ApiError) {
            res.status(error.code).json({ Error: error.message });
        } else {
            res.status(500).json({ Error: error });
        }
    }
}

export async function login(req: Request, res: Response): Promise<void> {
    try {
        const user = await checkUser(req.body.password, "pseudo", req.body.pseudo);
        const decodedUser = decodeUser(user, true);
        res.status(200).json(decodedUser);
    } catch (error) {
        if (error instanceof ApiError) {
            res.status(error.code).json({ Error: error.message });
        } else {
            res.status(500).json({ Error: error });
        }
    }
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
    try {
        //Comparing token id and user id
        if (req.params.userId === req.body.allowedUser.id) {
            const user = await findUser("id", req.params.userId);
            if (user) {
                await removeUser(user);
                res.status(200).json({ message: "User removed from database" });
            } else {
                res.status(404).json({ error: "User not found" });
            }
        } else {
            res.status(403).json({ error: "Authentication required" });
        }
    } catch (error) {
        if (error instanceof ApiError) {
            res.status(error.code).json({ Error: error.message });
        } else {
            res.status(500).json({ Error: error });
        }
    }
}

export async function getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
        //Confirm token validation
        if (req.body.allowedUser) {
            const user = await findUser("id", req.body.allowedUser.id);
            if (user) {
                const decodedUser = decodeUser(user);
                res.status(200).json(decodedUser);
            } else {
                res.status(404).json({ message: "User not found" });
            }
        } else {
            res.status(403).json({ error: "Authentication required" });
        }
    } catch (error) {
        res.status(500).json({ Error: error });
    }
}

export async function modifyUsersPass(req: Request, res: Response): Promise<void> {
    try {
        //Comparing token id and user id
        if (req.body.allowedUser && req.body.allowedUser.id === req.params.userId) {
            let user = await checkUser(req.body.oldPass, "id", req.params.userId);
            user = decodeUser(user) as User;
            user.password = req.body.password;
            await saveUser(user);
            res.status(200).json({ message: "Password successfully modified" });
        } else {
            res.status(403).json({ message: "Authentication required" });
        }
    } catch (error) {
        if (error instanceof ApiError) {
            res.status(error.code).json({ Error: error.message });
        } else {
            res.status(500).json({ Error: error });
        }
    }
}
