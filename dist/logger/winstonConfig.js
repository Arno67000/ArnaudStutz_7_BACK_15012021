"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerStream = void 0;
const winston = require("winston");
const path = require("path");
const options = {
    file: {
        level: 'info',
        filename: path.join(__dirname, 'app.log'),
        handleExceptions: true,
        json: true,
        maxsize: 5242880,
        maxFiles: 5,
        colorize: false,
    },
    console: {
        level: 'info',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};
const logger = winston.createLogger({
    transports: [
        new winston.transports.File(options.file),
        new winston.transports.Console(options.console)
    ],
    exitOnError: false,
});
class LoggerStream {
    write(message) {
        logger.info(message.substring(0, message.lastIndexOf('\n')));
    }
}
exports.LoggerStream = LoggerStream;
//# sourceMappingURL=winstonConfig.js.map