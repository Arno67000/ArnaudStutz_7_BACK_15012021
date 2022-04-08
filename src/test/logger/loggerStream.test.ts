import { LoggerStream, level } from "../../logger/winstonConfig";
import fs from "fs";

const path = "src/logger";
const logFileName = "app.log";

beforeEach(() => {
    // changing env variable to re-activate logs
    process.env.NODE_ENV = "activatingLogger";
    // testing if logFile exists and setting it if not
    if (!fs.readdirSync(path).find((filename) => filename === logFileName)) {
        fs.writeFileSync(`${path}/${logFileName}`, "");
    }
});

afterEach(() => {
    // returning to test environment for logger
    process.env.NODE_ENV = "test";
});

test("should log [test-loggers-behaviour-code-TIMESTAMP-with-jest] and update a logFile", () => {
    const streamer = new LoggerStream();
    const baseLog = "test-loggers-behaviour-code-" + Date.now().toString() + "-with-jest";
    // streaming with an add not supposed to be logged
    streamer.write(baseLog + "\n you freak!!!");
    const logFile = fs.readFileSync(`${path}/${logFileName}`, "utf-8");
    const found = logFile.match(baseLog);
    const notFound = logFile.match("you freak!!!");
    expect(found).toBeDefined();
    expect(notFound).toBeNull();
});

test("should transform level of log in env variable is set differently", () => {
    expect(level()).toEqual("info");
    process.env.NODE_ENV = "production";
    expect(level()).toEqual("error");
});
