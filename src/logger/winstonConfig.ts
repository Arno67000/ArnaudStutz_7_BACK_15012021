import * as winston from "winston";
import path = require("path");

export function level(): string {
    return process.env.NODE_ENV !== "production" ? "info" : "error";
}

const options = {
    file: {
        level: level(),
        filename: path.join(__dirname, "app.log"),
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    },
    console: {
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};

const colors = {
    error: "red",
    warn: "orange",
    info: "blue",
};

export const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.colorize({ message: true, colors: colors }),
        winston.format.printf((obj) =>
            process.env.NODE_ENV !== "test" ? `${new Date(Date.now()).toLocaleString()} : ${obj.message}` : ""
        )
    ),
    transports: [new winston.transports.File(options.file), new winston.transports.Console(options.console)],
    exitOnError: false, // do not exit on handled exceptions
});

export class LoggerStream {
    write(message: string) {
        logger.info(message.substring(0, message.lastIndexOf("\n")));
    }
}
