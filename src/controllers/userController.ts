import { Request, Response } from "express";
import { User } from "../entity/User";
import { ApiError } from "../tools/customError";

// managers
import { saveUser, checkUser, decodeUser, findUser, removeUser } from "../managers/userManager";

import dotenv from "dotenv";
dotenv.config();

export async function signup(req: Request, res: Response): Promise<Response> {
    try {
        await saveUser(req.body, true);
        return res.status(201).json({ message: "New user created" });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.code).json({ Error: error.message });
        }
        return res.status(500).json({ Error: error });
    }
}

export async function login(req: Request, res: Response): Promise<Response> {
    try {
        const user = await checkUser(req.body.password, "pseudo", req.body.pseudo);
        return res.status(200).json(decodeUser(user, true));
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.code).json({ Error: error.message });
        }
        return res.status(500).json({ Error: error });
    }
}

export async function deleteUser(req: Request, res: Response): Promise<Response> {
    try {
        //Comparing token id and user id
        if (!req.body.allowedUser || req.params.userId !== req.body.allowedUser.id) {
            return res.status(403).json({ error: "Authentication required" });
        }
        const user = await findUser({ key: "id", value: req.params.userId, relations: false });
        await removeUser(user);
        return res.status(200).json({ message: "User removed from database" });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.code).json({ Error: error.message });
        }
        return res.status(500).json({ Error: error });
    }
}

export async function getCurrentUser(req: Request, res: Response): Promise<Response> {
    try {
        //Confirm token validation
        if (!req.body.allowedUser) {
            return res.status(403).json({ error: "Authentication required" });
        }
        const user = await findUser({ key: "id", value: req.body.allowedUser.id, relations: false });
        const decodedUser = decodeUser(user);
        return res.status(200).json(decodedUser);
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.code).json({ Error: error.message });
        }
        return res.status(500).json({ Error: error });
    }
}

export async function modifyUsersPass(req: Request, res: Response): Promise<Response> {
    try {
        //Comparing token id and user id
        if (!req.body.allowedUser || req.params.userId !== req.body.allowedUser.id) {
            return res.status(403).json({ error: "Authentication required" });
        }
        let user = await checkUser(req.body.oldPass, "id", req.params.userId);
        user = decodeUser(user) as User;
        user.password = req.body.password;
        await saveUser(user);
        return res.status(200).json({ message: "Password successfully modified" });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.code).json({ Error: error.message });
        }
        return res.status(500).json({ Error: error });
    }
}
