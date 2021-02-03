"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jwebtkn = require("jsonwebtoken");
function auth(req, res, next) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const checkedToken = jwebtkn.verify(token, 'CRYPTAGEDUTOKEN2226080389');
        const userId = checkedToken.id;
        const userRole = checkedToken.role;
        req.body.allowedUser = { id: userId, role: userRole };
        console.log(req.body);
        if (userId && userRole) {
            next();
        }
        else {
            return res.status(403).json({ message: 'La requête nécessite authentification.' });
        }
        ;
    }
    catch (err) {
        return res.status(500).json({ err });
    }
    ;
}
exports.auth = auth;
;
//# sourceMappingURL=auth.js.map