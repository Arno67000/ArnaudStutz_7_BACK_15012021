import { app } from "./app";
import { createConnection } from "typeorm";
import { logger } from "./logger/winstonConfig";
import { ApiError } from "./tools/customError";
import * as dotenv from "dotenv";
dotenv.config();

const { FRONT_URL, APP_PORT, TYPEORM_DATABASE, TYPEORM_PORT, SECRET, NODE_ENV } = process.env;

(async () => {
    try {
        if (NODE_ENV !== "test") {
            if (!FRONT_URL || !APP_PORT || !TYPEORM_DATABASE || !TYPEORM_PORT || !SECRET) {
                throw new ApiError("Environment_Error", "Missing environment variables", 500);
            }
            await createConnection();
            logger.info(`Connected to ${TYPEORM_DATABASE} DB on port: ${TYPEORM_PORT}`);
            app.listen(APP_PORT, () => logger.info(`Server running on port: ${APP_PORT}`));
        }
    } catch (error) {
        if (error instanceof ApiError) {
            logger.error(error.message);
        }
        logger.error("Error: DATABASE_CONNECTION FAILED =>" + error);
    }
})();
