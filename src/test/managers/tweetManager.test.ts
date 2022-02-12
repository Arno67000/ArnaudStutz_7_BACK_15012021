import { db } from "../testTools";
import { ApiError } from "../../tools/customError";

import { User } from "../../entity/User";
import { Tweet } from "../../entity/Tweet";

import { saveUser, findUser, decodeUser } from "../../managers/userManager";
import {
    encodeTweetContent,
    saveTweet,
    getAll,
    decodeTweet,
    getOne,
    checkUserTweet,
    removeTweet,
} from "../../managers/tweetManager";

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

describe("saveTweet", () => {
    test("should save a tweet in database and link it to the user", async () => {
        const tweet = encodeTweetContent(tweetOne as Tweet);
        tweet.user = userJeanCaisse;
        const savedTweet = await saveTweet(tweet);
        expect(savedTweet.content).toEqual(tweetOne.content);
        expect(savedTweet.user).toEqual(expect.objectContaining({ pseudo: jeanCaisse.pseudo }));
    });
});

describe("getAll", () => {
    test("should return a list of all the tweets present in database", async () => {
        const tweetList = await getAll();
        expect(tweetList.length).toEqual(1);
        const decodedTweet = decodeTweet(tweetList[0]);
        expect(decodedTweet).toEqual(
            expect.objectContaining({
                content: "Hello World",
                user: expect.objectContaining({ pseudo: jeanCaisse.pseudo }),
            })
        );
    });
});

describe("getOne", () => {
    test("should return a tweet given its id", async () => {
        const tweet = await getOne(tweetFromDb.id);
        expect(tweet).toBeDefined();
        expect(typeof tweet.content === "string").toBeTruthy();
    });
    test("should throw an error if id doesn't exist in database", async () => {
        let res;
        try {
            res = await getOne("aWrongId");
        } catch (error) {
            res = error;
        }
        expect(res instanceof ApiError).toBeTruthy();
        expect(res).toEqual(expect.objectContaining({ name: "Error", code: 404, message: "Tweet not found" }));
    });
});

describe("checkUserTweet", () => {
    test("should check if the user is the tweets creator given their ids", async () => {
        let err;
        try {
            await checkUserTweet(tweetFromDb.id, userJeanCaisse.id);
        } catch (error) {
            err = error;
        }
        expect(err).toBeUndefined();
    });
    test("should throw an error if the user is not the tweets author", async () => {
        let err;
        try {
            await checkUserTweet("someTweetId", userJeanCaisse.id);
        } catch (error) {
            err = error;
        }
        expect(err instanceof ApiError).toBeTruthy();
        expect(err).toEqual(expect.objectContaining({ name: "Error", code: 403, message: "Forbidden action" }));
    });
});

describe("removeTweet", () => {
    test("should delete a tweet from database", async () => {
        await removeTweet(tweetFromDb);
        const tweetList = await getAll();
        expect(tweetList.length).toEqual(0);
    });
});
