import { authenticate } from "../../middleware/auth";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken");

describe("auth: token validation", () => {
    test("it should validate users token, build an allowedUser object with gathered infos and call nextFunction", () => {
        const req: Partial<Request> = {
            headers: {
                authorization: "Bearer aValidToken",
            },
            body: {},
        };
        const res: Partial<Response> = {};
        const next: NextFunction = jest.fn();
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);

        jest.spyOn(jwt, "verify").mockImplementationOnce(() => {
            return { id: "aValidId", role: "usersRole" };
        });

        authenticate(req as Request, res as Response, next as NextFunction);
        expect(next).toHaveBeenCalled();
        expect(req.body).toEqual({ allowedUser: { id: "aValidId", role: "usersRole" } });
    });
    test("it should return an error 403 if token is not a valid one", () => {
        const req: Partial<Request> = {
            headers: {},
            body: {},
        };
        const res: Partial<Response> = {};
        const next: NextFunction = jest.fn();
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);

        jest.spyOn(jwt, "verify").mockImplementationOnce(() => {
            return undefined;
        });

        authenticate(req as Request, res as Response, next as NextFunction);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: "Authentication required" });
    });
    test("it should return an error 500 if something goes south with request or jwt", () => {
        const req: Partial<Request> = {
            body: {},
        };
        const res: Partial<Response> = {};
        const next: NextFunction = jest.fn();
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);

        authenticate(req as Request, res as Response, next as NextFunction);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});
