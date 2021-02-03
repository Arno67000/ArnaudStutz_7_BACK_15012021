"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();
const helmet = require("helmet");
const morgan = require("morgan");
const user_1 = require("./routes/user");
const typeorm_1 = require("typeorm");
const tweet_1 = require("./routes/tweet");
const winstonConfig_1 = require("./logger/winstonConfig");
exports.app = express();
exports.app.use(helmet());
exports.app.use(morgan('combined', { stream: new winstonConfig_1.LoggerStream() }));
exports.app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});
typeorm_1.createConnection()
    .then(() => {
    console.log('Connecté à la DATABASE : port ' + process.env.TYPEORM_PORT);
})
    .catch(err => console.log('Error: DATABASE_CONNECTION FAILED =>' + err));
exports.app.use(bodyParser.json({ limit: "1kb" }));
exports.app.use(bodyParser.urlencoded({ extended: false, limit: "1kb" }));
exports.app.use('/user', user_1.userRouter);
exports.app.use('/tweets', tweet_1.tweetRouter);
// error handler
exports.app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error');
});
//# sourceMappingURL=app.js.map