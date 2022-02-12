import { Request, Response } from "express";
import { ApiError } from "../../tools/customError";
import { db } from "../testTools";
import { User } from "../../entity/User";
import { saveUser, findUser, decodeUser } from "../../managers/userManager";

import { signup, login } from "../../controllers/userController";
import * as userManager from "../../managers/userManager";

let userJeanCaisse: User;
const jeanCaisse = {
    pseudo: "JeanCaisse",
    password: "J!@3n_Caisse_Pass",
    firstName: "Jean",
    lastName: "Caisse",
} as User;

beforeAll(async () => {
    await db.connect();

    await saveUser(jeanCaisse, true);
    userJeanCaisse = decodeUser(
        await findUser({ key: "pseudo", value: jeanCaisse.pseudo, relations: false, encoded: true })
    ) as User;
});

afterAll(async () => {
    await db.close();
});

describe("signup", () => {
    test("should sign a user up and return status 201", async () => {
        const req: Partial<Request> = {
            body: {
                pseudo: "JeanCaisse",
                password: "J!@3n_Caisse_Pass",
                firstName: "Jean",
                lastName: "Caisse",
            },
        };
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);

        jest.spyOn(userManager, "saveUser").mockImplementationOnce(async () => {
            Promise.resolve();
        });

        await signup(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: "New user created" });
    });
    test("should return the error to user if saveUser throws an ApiError", async () => {
        const req: Partial<Request> = {
            body: {
                pseudo: "JeanCaisse",
                password: "J!@3n_Caisse_Pass",
                firstName: "Jean",
                lastName: "Caisse",
            },
        };
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);

        const err = new ApiError("Error", "Pseudo already used", 400);
        jest.spyOn(userManager, "saveUser").mockImplementationOnce(async () => {
            return Promise.reject(err);
        });

        await signup(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ Error: "Pseudo already used" });
    });
    test("should return an error 500 to user if body isn't set ", async () => {
        const req: Partial<Request> = {};
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);

        const err = new Error("Cannot read propertie body of undefined");
        jest.spyOn(userManager, "saveUser").mockImplementationOnce(async () => {
            return Promise.reject(err);
        });

        await signup(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ Error: err });
    });
});

describe("login", () => {
    test("should log a user and return the user object status 200", async () => {
        const req: Partial<Request> = {
            body: {
                pseudo: "JeanCaisse",
                password: "J!@3n_Caisse_Pass",
            },
        };
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);

        jest.spyOn(userManager, "checkUser").mockImplementationOnce(async () => {
            return Promise.resolve(userJeanCaisse);
        });

        await login(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ pseudo: jeanCaisse.pseudo }));
    });
    test("should return the error to user if checkUser throws an ApiError beacause of a wrong password or unexisting user", async () => {
        const req: Partial<Request> = {
            body: {
                pseudo: "JeanCaisse",
                password: "J!@3n_Pass_Wrong",
            },
        };
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);

        const err = new ApiError("Error", "Wrong credentials", 403);
        jest.spyOn(userManager, "checkUser").mockImplementationOnce(async () => {
            return Promise.reject(err);
        });

        await login(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ Error: "Wrong credentials" });
    });
    test("should return an error 500 to user if body isn't set properly ", async () => {
        const req: Partial<Request> = {};
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);

        // const err = new Error("Cannot read propertie pseudo of undefined");
        // jest.spyOn(userManager, "saveUser").mockImplementationOnce(async () => {
        //     return Promise.reject(err);
        // });

        await login(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
        // expect(res.json).toHaveBeenCalledWith({ Error: err });
    });
});
