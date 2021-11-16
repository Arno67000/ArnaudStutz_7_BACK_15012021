import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { getRepository } from "typeorm";
import { User } from "../entity/User";
import jwebtkn from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export async function signup(req: Request, res: Response) {
    try {
        const repo = getRepository(User);
        //Vérification de la disponibilité du pseudo (pseudo unique)
        const checkingPseudo = await repo.findOne({ pseudo: encodeURI(req.body.pseudo) });
        if (checkingPseudo) {
            res.status(400).json({ message: "Pseudo déjà utilisé" });
        }
        const hash = await bcrypt.hash(req.body.password, 15);
        const user = new User();
        user.firstName = Buffer.from(req.body.firstName, "binary").toString("base64");
        user.lastName = Buffer.from(req.body.lastName, "binary").toString("base64");
        user.pseudo = encodeURI(req.body.pseudo);
        user.password = hash;
        if (req.body.pseudo === "admin") {
            user.role = "Moderateur";
        } else {
            user.role = "User";
        }
        await repo.save(user);
        res.status(201).json({ message: "Nouvel utilisateur enregistré ! " });
    } catch (error) {
        res.status(500).json({ Error: error });
    }
}

export async function login(req: Request, res: Response) {
    try {
        const repo = getRepository(User);
        const user = await repo.findOne({ pseudo: encodeURI(req.body.pseudo) });
        if (user instanceof User) {
            const checkedPassword = await bcrypt.compare(req.body.password, user.password);
            if (checkedPassword) {
                res.status(200).json({
                    pseudo: decodeURI(user.pseudo),
                    firstName: Buffer.from(user.firstName, "base64").toString("utf-8"),
                    lastName: Buffer.from(user.lastName, "base64").toString("utf-8"),
                    role: user.role,
                    id: user.id,
                    token: jwebtkn.sign(
                        {
                            id: user.id,
                            role: user.role,
                        },
                        process.env.SECRET!,
                        { expiresIn: "24h" }
                    ),
                });
            } else {
                res.status(403).json({ message: "Mot de passe invalide." });
            }
        } else {
            res.status(404).json({ message: "Pseudo non valide !!" });
        }
    } catch (error) {
        res.status(500).json({ Error: error });
    }
}

export async function deleteUser(req: Request, res: Response) {
    try {
        //Comparaison de l'Id du token avec l'Id utilisateur de la requête
        if (req.params.userId === req.body.allowedUser.id) {
            const repo = getRepository(User);
            const user = await repo.findOne({ id: req.params.userId });
            if (user instanceof User) {
                console.log("Supression de : ", user);
                await repo.remove(user);
                res.status(200).json({ message: "Profil supprimé!!" });
            } else {
                return res.status(404).json({ error: "Aucun utilisateur trouvé avec cet identifiant !!" });
            }
        } else {
            return res.status(403).json({ error: "Cette requête nécessite une authentification !!" });
        }
    } catch (error) {
        res.status(500).json({ Error: error });
    }
}

export async function getCurrentUser(req: Request, res: Response) {
    try {
        //Confirmation du token valide
        if (req.body.allowedUser) {
            const repo = getRepository(User);
            const user = await repo.findOne({ id: req.body.allowedUser.id });
            if (user instanceof User) {
                res.status(200).json({
                    pseudo: decodeURI(user.pseudo),
                    firstName: Buffer.from(user.firstName, "base64").toString("utf-8"),
                    lastName: Buffer.from(user.lastName, "base64").toString("utf-8"),
                    role: user.role,
                    id: user.id,
                });
            } else {
                res.status(404).json({ message: `Aucun utilisateur trouvé avec cet identifiant` });
            }
        } else {
            return res.status(403).json({ error: "Cette requête nécessite une authentification !!" });
        }
    } catch (error) {
        res.status(500).json({ Error: error });
    }
}

export async function modifyUsersPass(req: Request, res: Response) {
    try {
        //Comparaison de l'Id du token avec l'Id utilisateur de la requête
        if (req.body.allowedUser && req.body.allowedUser.id === req.params.userId) {
            const repo = getRepository(User);
            const user = await repo.findOne({ id: req.params.userId });
            if (user instanceof User) {
                const valid = await bcrypt.compare(req.body.oldPass, user.password);
                if (!valid) {
                    res.status(403).json({ message: "Mot de passe invalide." });
                }
                user.password = await bcrypt.hash(req.body.password, 15);
                await repo.save(user);
                res.status(200).json({ message: "Le mot de passe à bien été modifié !!" });
            } else {
                res.status(404).json({ message: "Aucun utilisateur trouvé avec cet identifiant !!" });
            }
        } else {
            res.status(403).json({ message: "Cette requête nécessite une authentification !!" });
        }
    } catch (error) {
        res.status(500).json({ Error: error });
    }
}
