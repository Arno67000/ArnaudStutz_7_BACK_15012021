import { db } from "../testTools";
import { ApiError } from "../../tools/customError";

import { User } from "../../entity/User";
import { Tweet } from "../../entity/Tweet";

import { saveUser, findUser, decodeUser, encodeUser, checkUser, removeUser } from "../../managers/userManager";
import { encodeTweetContent, saveTweet } from "../../managers/tweetManager";

let userJeanCaisse: User;
const jeanCaisse = {
    pseudo: "JeanCaisse",
    password: "J!@3n_Caisse_Pass",
    firstName: "Jean",
    lastName: "Caisse",
} as User;
const jeanClenche = {
    pseudo: "JeanClenche",
    password: "J!@3n_Pass",
    firstName: "Jean",
    lastName: "Clenche",
} as User;
const tweetOne = {
    content: "Hello World",
};
beforeAll(async () => {
    await db.connect();

    await saveUser(jeanCaisse, true);
    userJeanCaisse = decodeUser(
        await findUser({ key: "pseudo", value: jeanCaisse.pseudo, relations: false, encoded: true })
    ) as User;
    const tweet = encodeTweetContent(tweetOne as Tweet);
    tweet.user = userJeanCaisse;
    await saveTweet(tweet);
});

afterAll(async () => {
    await db.close();
});

describe("saveUser", () => {
    test("should save a new user in database if pseudo is not already taken", async () => {
        await saveUser(jeanClenche, true);
        const savedUser = await findUser({ key: "pseudo", value: jeanClenche.pseudo, relations: false, encoded: true });
        expect(decodeUser(savedUser)).toEqual(
            expect.objectContaining({
                pseudo: jeanClenche.pseudo,
                firstName: jeanClenche.firstName,
                lastName: jeanClenche.lastName,
                role: "User",
            })
        );
    });

    test("should NOT save a new user in database if pseudo is already taken and throw error", async () => {
        let user = {
            pseudo: "JeanClenche",
            password: "J'Pass",
            firstName: "Jean",
            lastName: "Clen-Che",
        } as User;

        try {
            await saveUser(user, true);
        } catch (error) {
            user = error;
        }

        expect(user instanceof ApiError).toBeTruthy();
        expect(user).toEqual(
            expect.objectContaining({
                name: "Error",
                message: "Pseudo already used",
                code: 400,
            })
        );
    });
});

describe("checkUser", () => {
    test("should check user's existence and his passwords validity successfully", async () => {
        const checkedUser = await checkUser(jeanCaisse.password, "id", userJeanCaisse.id);
        const decodedCheckedUser = decodeUser(checkedUser);
        expect(userJeanCaisse).toEqual(decodedCheckedUser);
    });
    test("should check user's existence and his passwords validity successfully", async () => {
        let checkedUser;
        try {
            checkedUser = await checkUser("aWrongPassword", "id", userJeanCaisse.id);
        } catch (error) {
            checkedUser = error;
        }
        expect(checkedUser instanceof ApiError).toBeTruthy();
        expect(checkedUser).toEqual(
            expect.objectContaining({
                name: "Error",
                message: "Wrong credentials",
                code: 403,
            })
        );
    });
});

describe("findUser", () => {
    test("should find a user by its id (not encoded) without relations", async () => {
        const user = await findUser({ key: "id", value: userJeanCaisse.id, relations: false, encoded: false });
        expect(decodeUser(user)).toEqual(
            expect.objectContaining({ lastName: jeanCaisse.lastName, firstName: jeanCaisse.firstName, role: "User" })
        );
    });
    test("should find a user by its id (not encoded) with relations", async () => {
        const user = await findUser({ key: "id", value: userJeanCaisse.id, relations: true, encoded: false });
        expect(decodeUser(user)).toEqual(
            expect.objectContaining({
                lastName: jeanCaisse.lastName,
                firstName: jeanCaisse.firstName,
                role: "User",
                tweets: [
                    expect.objectContaining({
                        content: "Hello World",
                    }),
                ],
            })
        );
    });

    test("should find a user by its pseudo (encoded) without relations", async () => {
        const user = await findUser({
            key: "pseudo",
            value: userJeanCaisse.pseudo,
            relations: false,
            encoded: true,
        });
        expect(decodeUser(user)).toEqual(
            expect.objectContaining({ lastName: jeanCaisse.lastName, firstName: jeanCaisse.firstName, role: "User" })
        );
    });
    test("should find a user by its pseudo (encoded) with relations", async () => {
        const user = await findUser({
            key: "pseudo",
            value: userJeanCaisse.pseudo,
            relations: true,
            encoded: true,
        });
        expect(decodeUser(user)).toEqual(
            expect.objectContaining({
                lastName: jeanCaisse.lastName,
                firstName: jeanCaisse.firstName,
                role: "User",
                tweets: [
                    expect.objectContaining({
                        content: "Hello World",
                    }),
                ],
            })
        );
    });

    test("should throw an error if user doesn't exists", async () => {
        let expected;
        try {
            expected = await findUser({
                key: "pseudo",
                value: "pseudo",
                relations: true,
                encoded: true,
            });
        } catch (error) {
            expected = error;
        }
        expect(expected instanceof ApiError).toBeTruthy();
        expect(expected).toEqual(
            expect.objectContaining({
                name: "Error",
                message: "User not found",
                code: 404,
            })
        );
    });
});

describe("removeUser", () => {
    test("should remove a user from database", async () => {
        const savedUser = await findUser({ key: "pseudo", value: jeanClenche.pseudo, relations: false, encoded: true });
        const user = decodeUser(savedUser) as User;
        await removeUser(user);
        let expected;
        try {
            expected = await findUser({ key: "pseudo", value: jeanClenche.pseudo, relations: false, encoded: true });
        } catch (error) {
            expected = error;
        }
        expect(expected instanceof ApiError).toBeTruthy();
        expect(expected).toEqual(
            expect.objectContaining({
                name: "Error",
                message: "User not found",
                code: 404,
            })
        );
    });
});

describe("decodeUser", () => {
    test("In a login situation, decodeUser should decode the user and send him a JWT", async () => {
        const user = await findUser({ key: "pseudo", value: jeanCaisse.pseudo, relations: false, encoded: true });
        const loggedJeanCaisse = decodeUser(user, true) as Record<string, unknown>;
        expect(loggedJeanCaisse).toEqual(
            expect.objectContaining({
                id: userJeanCaisse.id,
                firstName: jeanCaisse.firstName,
                lastName: jeanCaisse.lastName,
                pseudo: jeanCaisse.pseudo,
                token: expect.stringMatching(/.*/gm),
            })
        );
        expect(loggedJeanCaisse.token).toBeDefined();
        expect(typeof loggedJeanCaisse.token === "string").toBeTruthy();
    });
});

describe("encodeUser", () => {
    test("encoding an admin should set his role as Admin", async () => {
        const admin = {
            pseudo: "admin",
            password: "Adm1n_Pass",
            firstName: "Ad",
            lastName: "Min",
        } as User;
        const encoded = await encodeUser(admin);
        expect(encoded.role).toEqual("Admin");
    });
});
