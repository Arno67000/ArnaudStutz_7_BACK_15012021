import { getRepository, Repository } from "typeorm";
import { User } from "../entity/User";
import bcrypt from "bcrypt";
import { ApiError } from "../tools/customError";
import { jwtSecret } from "../server";
import jwebtkn from "jsonwebtoken";

export async function saveUser(user: User, signup?: boolean): Promise<void> {
    const repo = getRepository(User);
    if (signup) await checkUniquePseudo(user.pseudo, repo);
    const newUser = await encodeUser(user);
    await repo.save(newUser);
}

export async function checkUser(password: string, key: string, value: string): Promise<User> {
    const dbUser = await findUser(key, value, false, true);
    if (!dbUser || !(await checkUserPassword(password, dbUser.password))) {
        throw new ApiError("Wrong login or wrong password", 403);
    }
    return dbUser;
}

export async function findUser(
    key: string,
    value: string,
    relations: boolean,
    encoded?: boolean
): Promise<User | undefined> {
    let query;
    if (encoded) {
        query = relations ? { relations: ["tweets"], where: { [key]: encodeURI(value) } } : { [key]: encodeURI(value) };
    } else {
        query = relations ? { relations: ["tweets"], where: { [key]: value } } : { [key]: value };
    }
    const repo = getRepository(User);
    return await repo.findOne(query);
}

export async function checkUserPassword(passwordValue: string, expectedValue: string): Promise<boolean> {
    return await bcrypt.compare(passwordValue, expectedValue);
}

async function checkUniquePseudo(pseudo: string, repo: Repository<User>): Promise<void> {
    const pseudoExists = await repo.findOne({ pseudo: encodeURI(pseudo) });
    if (pseudoExists) {
        throw new ApiError("Pseudo already used", 400);
    }
}

export function decodeUser(user: User, login?: boolean): Partial<User> | Record<string, unknown> {
    if (login) {
        return {
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
                jwtSecret,
                { expiresIn: "24h" }
            ),
        };
    } else {
        return {
            pseudo: decodeURI(user.pseudo),
            firstName: Buffer.from(user.firstName, "base64").toString("utf-8"),
            lastName: Buffer.from(user.lastName, "base64").toString("utf-8"),
            role: user.role,
            id: user.id,
        };
    }
}

async function encodeUser(user: User): Promise<Partial<User>> {
    const hash = await bcrypt.hash(user.password, 15);
    return {
        firstName: Buffer.from(user.firstName, "binary").toString("base64"),
        lastName: Buffer.from(user.lastName, "binary").toString("base64"),
        pseudo: encodeURI(user.pseudo),
        password: hash,
        role: user.pseudo === "admin" ? "Moderateur" : "User",
    };
}

export async function removeUser(user: User): Promise<void> {
    const repo = getRepository(User);
    await repo.remove(user);
}
