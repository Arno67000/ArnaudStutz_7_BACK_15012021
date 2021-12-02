import { NextFunction, Request, Response } from "express";
import { check, ValidationChain, validationResult } from "express-validator";

export function userValidationRules(): ValidationChain[] {
    return [
        check("pseudo")
            .isString()
            .trim()
            .isLength({ min: 3, max: 12 })
            .withMessage("Le pseudo doit contenir entre 3 et 12 caractères, et aucun des caractères spéciaux"),
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
                    "Le mot de passe doit contenir 8 caractères dont: 1 Majuscule, 1 minuscule, 1 chiffre ET un symbole",
            }),
    ];
}

export function inputValidationRules(): ValidationChain[] {
    return [
        check("content")
            .isString()
            .trim()
            .isLength({ min: 4, max: 250 })
            .withMessage("Le message peut contenir de 4 à 250 caractères."),
    ];
}

export function validate(req: Request, res: Response, next: NextFunction): void {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        next();
    } else {
        res.status(406).json({ errors });
    }
}
