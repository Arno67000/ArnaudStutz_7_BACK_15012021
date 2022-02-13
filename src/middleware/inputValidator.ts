import { NextFunction, Request, Response } from "express";
import { check, ValidationChain, validationResult, param } from "express-validator";

export function userValidationRules(): ValidationChain[] {
    return [
        check("pseudo")
            .isString()
            .trim()
            .isLength({ min: 3, max: 12 })
            .withMessage("Pseudo must contain between 3 and 12 characters, and none of the special characters"),
        check("password")
            .isStrongPassword({
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
                returnScore: false,
                pointsPerUnique: 1,
                pointsPerRepeat: 0.5,
                pointsForContainingLower: 10,
                pointsForContainingUpper: 10,
                pointsForContainingNumber: 10,
                pointsForContainingSymbol: 10,
            })
            .withMessage({
                message:
                    "Password must contain 8 characters including: 1 uppercase, 1 lowercase, 1 number AND a symbol",
            }),
    ];
}

export function inputValidationRules(): ValidationChain[] {
    return [
        check("content")
            .isString()
            .trim()
            .isLength({ min: 4, max: 250 })
            .withMessage("Message must contain between 4 and 250 characters."),
    ];
}

export function tweetParamsValidationChain(): ValidationChain[] {
    return [param("tweetId").exists().isString()];
}

export function userParamsValidationChain(): ValidationChain[] {
    return [param("userId").exists().isString()];
}

export function validate(req: Request, res: Response, next: NextFunction): void {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        next();
    } else {
        res.status(406).json({ errors });
    }
}
