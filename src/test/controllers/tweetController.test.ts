import { Request, Response } from "express";
import { db } from "../testTools";
import { ApiError } from "../../tools/customError";

import { User } from "../../entity/User";
import { Tweet } from "../../entity/Tweet";

import { saveUser, findUser, decodeUser } from "../../managers/userManager";
import { encodeTweetContent, saveTweet } from "../../managers/tweetManager";

import * as tweetManager from "../../managers/tweetManager";
import * as userManager from "../../managers/userManager";

import { getAllTweets, postTweet, modifyTweet, deleteTweet } from "../../controllers/tweetController";

let userJeanCaisse: User;
const jeanCaisse = {
    pseudo: "JeanCaisse",
    password: "J!@3n_Caisse_Pass",
    firstName: "Jean",
    lastName: "Caisse",
} as User;
const tweetOne = {
    content: "Hello World",
};
let tweetFromDb = {} as Tweet;

beforeAll(async () => {
    await db.connect();

    await saveUser(jeanCaisse, true);
    userJeanCaisse = decodeUser(
        await findUser({ key: "pseudo", value: jeanCaisse.pseudo, relations: false, encoded: true })
    ) as User;
    const tweet = encodeTweetContent(tweetOne as Tweet);
    tweet.user = userJeanCaisse;
    tweetFromDb = await saveTweet(tweet);
});

afterAll(async () => {
    await db.close();
});

describe("getAllTweets", () => {
    test("should return an arrray containing all tweets", async () => {
        const req: Partial<Request> = { body: { allowedUser: { id: userJeanCaisse.id } } };
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);

        jest.spyOn(tweetManager, "getAll").mockImplementationOnce(async () => {
            return Promise.resolve([tweetFromDb]);
        });

        await getAllTweets(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([tweetFromDb]);
    });
    test("should return an error 500 if something goes south with the request", async () => {
        const req: Partial<Request> = {};
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);

        await getAllTweets(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
    });
    test("should return an error 403 if allowedUser isn't set by the middleware", async () => {
        const req: Partial<Request> = { body: {} };
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);

        await getAllTweets(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ Error: "Authentication required" });
    });
});

describe("postTweet", () => {
    test("should save a new tweet and return a status 201 and the saved tweet", async () => {
        const req: Partial<Request> = {
            body: { allowedUser: { id: userJeanCaisse.id }, user: { id: userJeanCaisse.id } },
        };
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);

        jest.spyOn(userManager, "findUser").mockImplementationOnce(async () => {
            return Promise.resolve(userJeanCaisse);
        });
        jest.spyOn(tweetManager, "saveTweet").mockImplementationOnce(async () => {
            return Promise.resolve(tweetFromDb);
        });

        await postTweet(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(tweetFromDb);
    });
    test("should return the apiError if the user doesn't exist in database", async () => {
        const req: Partial<Request> = {
            body: { allowedUser: { id: userJeanCaisse.id }, user: { id: userJeanCaisse.id } },
        };
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);

        const err = new ApiError("Error", "User not found", 404);
        jest.spyOn(userManager, "findUser").mockImplementationOnce(async () => {
            return Promise.reject(err);
        });

        await postTweet(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ Error: "User not found" });
    });
    test("should return an error 500 if something goes south with the request", async () => {
        const req: Partial<Request> = {};
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);

        await postTweet(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
    });
    test("should return an error 403 if allowedUser id isn't the same as user id", async () => {
        const req: Partial<Request> = {
            body: { allowedUser: { id: userJeanCaisse.id }, user: { id: "someOtherId" } },
        };
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);

        await postTweet(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ Error: "Authentication required" });
    });
});

describe("modifyTweet", () => {
    test("should modify a tweet and return a status 200 and the modified tweet", async () => {
        const req: Partial<Request> = {
            body: {
                allowedUser: { id: userJeanCaisse.id, role: "User" },
                user: { id: userJeanCaisse.id },
                content: "new content",
            },
            params: { tweetId: tweetFromDb.id },
        };
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);

        jest.spyOn(tweetManager, "getOne").mockImplementationOnce(async () => {
            return Promise.resolve(tweetFromDb);
        });
        jest.spyOn(tweetManager, "checkUserTweet").mockImplementationOnce(async () => {
            return Promise.resolve();
        });
        jest.spyOn(tweetManager, "saveTweet").mockImplementationOnce(async () => {
            return Promise.resolve(tweetFromDb);
        });

        await modifyTweet(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: tweetFromDb.id }));
    });
    test("should return the apiError if the tweet doesn't exist in database", async () => {
        const req: Partial<Request> = {
            body: {
                allowedUser: { id: userJeanCaisse.id, role: "User" },
                user: { id: userJeanCaisse.id },
                content: "new content",
            },
            params: { tweetId: "aBadId" },
        };
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);

        const err = new ApiError("Error", "Tweet not found", 404);
        jest.spyOn(tweetManager, "getOne").mockImplementationOnce(async () => {
            return Promise.reject(err);
        });

        await modifyTweet(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ Error: "Tweet not found" });
    });
    test("should return an error 500 if something goes south with the request", async () => {
        const req: Partial<Request> = {};
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);

        await modifyTweet(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
    });
    test("should return an error 403 if allowedUser id isn't the same as user id", async () => {
        const req: Partial<Request> = {
            body: {
                allowedUser: { id: userJeanCaisse.id, role: "User" },
                user: { id: "someOtherId" },
                content: "new content",
            },
            params: { tweetId: "aBadId" },
        };
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);

        await modifyTweet(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ Error: "Authentication required" });
    });
    test("should modify a tweet and return a status 200 and the modified tweet without verifying ids if user is Admin", async () => {
        const req: Partial<Request> = {
            body: {
                allowedUser: { id: "adminId", role: "Admin" },
                user: { id: userJeanCaisse.id },
                content: "moderated content",
            },
            params: { tweetId: tweetFromDb.id },
        };
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);

        jest.spyOn(tweetManager, "getOne").mockImplementationOnce(async () => {
            return Promise.resolve(tweetFromDb);
        });
        jest.spyOn(tweetManager, "saveTweet").mockImplementationOnce(async () => {
            return Promise.resolve(tweetFromDb);
        });

        await modifyTweet(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: tweetFromDb.id }));
    });
});

describe("deleteTweet", () => {
    test("should delete a tweet and return a status 200", async () => {
        const req: Partial<Request> = {
            body: {
                allowedUser: { id: userJeanCaisse.id, role: "User" },
                user: { id: userJeanCaisse.id },
            },
            params: { tweetId: tweetFromDb.id },
        };
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);

        jest.spyOn(tweetManager, "getOne").mockImplementationOnce(async () => {
            return Promise.resolve(tweetFromDb);
        });
        jest.spyOn(tweetManager, "checkUserTweet").mockImplementationOnce(async () => {
            return Promise.resolve();
        });
        jest.spyOn(tweetManager, "removeTweet").mockImplementationOnce(async () => {
            return Promise.resolve();
        });

        await deleteTweet(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Tweet successfully deleted" });
    });
    test("should return the apiError if the tweet doesn't exist in database", async () => {
        const req: Partial<Request> = {
            body: {
                allowedUser: { id: userJeanCaisse.id, role: "User" },
                user: { id: userJeanCaisse.id },
            },
            params: { tweetId: "aBadId" },
        };
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);

        const err = new ApiError("Error", "Tweet not found", 404);
        jest.spyOn(tweetManager, "getOne").mockImplementationOnce(async () => {
            return Promise.reject(err);
        });

        await deleteTweet(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ Error: "Tweet not found" });
    });
    test("should return an error 500 if something goes south with the request", async () => {
        const req: Partial<Request> = {};
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);

        await deleteTweet(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
    });
    test("should return an error 403 if allowedUser id isn't the same as user id", async () => {
        const req: Partial<Request> = {
            body: {
                allowedUser: { id: userJeanCaisse.id, role: "User" },
                user: { id: "someOtherId" },
            },
            params: { tweetId: "aBadId" },
        };
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);

        await deleteTweet(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ Error: "Authentication required" });
    });
    test("should delete a tweet and return a status 200 without checking ids if the requester is Admin", async () => {
        const req: Partial<Request> = {
            body: {
                allowedUser: { id: "adminId", role: "Admin" },
                user: { id: userJeanCaisse.id },
            },
            params: { tweetId: tweetFromDb.id },
        };
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);

        jest.spyOn(tweetManager, "getOne").mockImplementationOnce(async () => {
            return Promise.resolve(tweetFromDb);
        });
        jest.spyOn(tweetManager, "removeTweet").mockImplementationOnce(async () => {
            return Promise.resolve();
        });

        await deleteTweet(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Tweet successfully deleted" });
    });
});
