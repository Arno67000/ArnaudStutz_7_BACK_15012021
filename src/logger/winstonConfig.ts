import * as winston from "winston";
import path = require("path");

const options = {
    file: {
        level: "info",
        filename: path.join(__dirname, "app.log"),
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    },
    console: {
        level: "info",
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};

const logger = winston.createLogger({
    transports: [new winston.transports.File(options.file), new winston.transports.Console(options.console)],
    exitOnError: false, // do not exit on handled exceptions
});

export class LoggerStream {
    write(message: string) {
        logger.info(message.substring(0, message.lastIndexOf("\n")));
    }
}
