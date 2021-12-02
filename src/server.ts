import { app } from "./app";
import { createConnection } from "typeorm";
import { logger } from "./logger/winstonConfig";
import { ApiError } from "./tools/customError";
import * as dotenv from "dotenv";
dotenv.config();

const { FRONT_URL, APP_PORT, TYPEORM_DATABASE, TYPEORM_PORT, SECRET } = process.env;

export let frontUrl: string;
export let jwtSecret: string;

(async () => {
    try {
        if (!FRONT_URL || !APP_PORT || !TYPEORM_DATABASE || !TYPEORM_PORT || !SECRET) {
            throw new ApiError("Missing environment variables", 500);
        }
        frontUrl = FRONT_URL;
        jwtSecret = SECRET;
        await createConnection();
        logger.info(`Connected to ${TYPEORM_DATABASE} DB on port: ${TYPEORM_PORT}`);
        app.listen(APP_PORT, () => logger.info(`Server running on port: ${APP_PORT}`));
    } catch (error) {
        if (error instanceof ApiError) {
            logger.error(error.message);
        }
        logger.error("Error: DATABASE_CONNECTION FAILED =>" + error);
    }
})();
