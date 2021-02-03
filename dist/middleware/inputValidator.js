"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.inputValidationRules = exports.userValidationRules = void 0;
const express_validator_1 = require("express-validator");
function userValidationRules() {
    return [
        express_validator_1.check('pseudo').isString().trim().isLength({ min: 3, max: 12 }).withMessage("Le pseudo doit contenir entre 3 et 12 caractères, et aucun des caractères spéciaux"),
        express_validator_1.check('password').isStrongPassword({
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
            pointsForContainingSymbol: 10
        })
            .withMessage({ message: 'Le mot de passe doit contenir 8 caractères dont: 1 Majuscule, 1 minuscule, 1 chiffre ET un symbole' })
    ];
}
exports.userValidationRules = userValidationRules;
;
function inputValidationRules() {
    return [
        express_validator_1.check('content').isString().trim().isLength({ min: 4, max: 250 }).withMessage("Le message peut contenir de 4 à 250 caractères.")
    ];
}
exports.inputValidationRules = inputValidationRules;
;
function validate(req, res, next) {
    const errors = express_validator_1.validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    else {
        return res.status(400).json({ errors });
    }
    ;
}
exports.validate = validate;
;
//# sourceMappingURL=inputValidator.js.map