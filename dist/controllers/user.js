"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.modifyUsersPass = exports.getCurrentUser = exports.deleteUser = exports.login = exports.signup = void 0;
const bcrypt = require("bcrypt");
const typeorm_1 = require("typeorm");
const User_1 = require("../entity/User");
const jwebtkn = require("jsonwebtoken");
function signup(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const repo = typeorm_1.getRepository(User_1.User);
        //Vérification de la disponibilité du pseudo (pseudo unique)
        const checkingPseudo = (yield repo.findOne({ pseudo: encodeURI(req.body.pseudo) })) || undefined;
        if (checkingPseudo) {
            return res.status(400).json({ message: 'Pseudo déjà utilisé' });
        }
        bcrypt.hash(req.body.password, 15)
            .then((hash) => {
            const user = new User_1.User();
            user.firstName = Buffer.from(req.body.firstName, 'binary').toString('base64');
            user.lastName = Buffer.from(req.body.lastName, 'binary').toString('base64');
            user.pseudo = encodeURI(req.body.pseudo);
            user.password = hash;
            if (req.body.pseudo === "admin") {
                user.role = "Moderateur";
            }
            else {
                user.role = "User";
            }
            repo.save(user).then(() => res.status(201).json({ message: 'Nouvel utilisateur enregistré ! ' }))
                .catch(err => res.status(500).json({ 'Error': err }));
        })
            .catch(err => res.status(500).json({ 'Error': err }));
    });
}
exports.signup = signup;
function login(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const repo = typeorm_1.getRepository(User_1.User);
        const user = yield repo.findOne({ pseudo: encodeURI(req.body.pseudo) }).catch(err => res.status(500).json({ 'Error': err }));
        if (user instanceof User_1.User) {
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                if (valid) {
                    return res.status(200).json({
                        pseudo: decodeURI(user.pseudo),
                        firstName: Buffer.from(user.firstName, "base64").toString('utf-8'),
                        lastName: Buffer.from(user.lastName, "base64").toString('utf-8'),
                        role: user.role,
                        id: user.id,
                        token: jwebtkn.sign({
                            id: user.id,
                            role: user.role,
                        }, 'CRYPTAGEDUTOKEN2226080389', { expiresIn: '24h' })
                    });
                }
                else {
                    return res.status(403).json({ message: 'Mot de passe invalide.' });
                }
            })
                .catch(err => res.status(500).json({ 'Error': err }));
        }
        else {
            return res.status(404).json({ message: 'Pseudo non valide !!' });
        }
    });
}
exports.login = login;
;
function deleteUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //Comparaison de l'Id du token avec l'Id utilisateur de la requête
        if (req.params.userId === req.body.allowedUser.id) {
            const repo = typeorm_1.getRepository(User_1.User);
            const user = yield repo.findOne({ id: req.params.userId }).catch(error => console.log('aucun utilisateur trouvé avec cet id : ', error));
            if (user instanceof User_1.User) {
                console.log('Supression de : ', user);
                repo.remove(user)
                    .then(() => res.status(200).json({ message: 'Profil supprimé!!' }))
                    .catch(err => res.status(500).json({ message: err }));
            }
            else {
                return res.status(404).json({ error: 'Aucun utilisateur trouvé avec cet identifiant !!' });
            }
            ;
        }
        else {
            return res.status(403).json({ error: 'Cette requête nécessite une authentification !!' });
        }
    });
}
exports.deleteUser = deleteUser;
function getCurrentUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //Confirmation du token valide
        if (req.body.allowedUser) {
            const repo = typeorm_1.getRepository(User_1.User);
            yield repo.findOne({ id: req.body.allowedUser.id })
                .then(user => res.status(200).json({
                pseudo: decodeURI(user.pseudo),
                firstName: Buffer.from(user.firstName, "base64").toString('utf-8'),
                lastName: Buffer.from(user.lastName, "base64").toString('utf-8'),
                role: user.role,
                id: user.id
            }))
                .catch(err => res.status(404).json({ message: `Aucun utilisateur trouvé avec cet identifiant :${err}` }));
        }
        else {
            return res.status(403).json({ error: 'Cette requête nécessite une authentification !!' });
        }
    });
}
exports.getCurrentUser = getCurrentUser;
;
function modifyUsersPass(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //Comparaison de l'Id du token avec l'Id utilisateur de la requête
        if (req.body.allowedUser && req.body.allowedUser.id === req.params.userId) {
            const repo = typeorm_1.getRepository(User_1.User);
            const user = yield repo.findOne({ id: req.params.userId }).catch(err => res.status(500).json({ message: err }));
            if (user instanceof User_1.User) {
                try {
                    yield bcrypt.compare(req.body.oldPass, user.password) //Vérification du Mot-de-passe à changer
                        .then(valid => {
                        if (valid) {
                            return true;
                        }
                        else {
                            return res.status(403).json({ message: 'Mot de passe invalide.' });
                        }
                        ;
                    })
                        .catch(err => res.status(500).json({ 'Error': err }));
                    bcrypt.hash(req.body.password, 15) // Cryptage du nouveau mot de passe
                        .then((hash) => {
                        //mise à jour du mot-de-passe
                        user.password = hash;
                        repo.save(user)
                            .then(() => res.status(200).json({ message: 'Le mot de passe à bien été modifié !!' }))
                            .catch(error => {
                            console.log(error);
                            return res.status(500).json({ error });
                        });
                    })
                        .catch(err => res.status(500).json({ 'Error': err }));
                }
                catch (err) {
                    throw err;
                }
                ;
            }
            else {
                return res.status(404).json({ message: 'Aucun utilisateur trouvé avec cet identifiant !!' });
            }
            ;
        }
        else {
            return res.status(403).json({ message: 'Cette requête nécessite une authentification !!' });
        }
        ;
    });
}
exports.modifyUsersPass = modifyUsersPass;
//# sourceMappingURL=user.js.map