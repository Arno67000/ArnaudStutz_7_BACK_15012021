import { app } from "./app";
import { createConnection } from "typeorm";
import dotenv from "dotenv";
import { logger } from "./logger/winstonConfig";
dotenv.config();

(async () => {
    try {
        const connection = await createConnection();
        if (connection) {
            logger.info(`Connected to ${process.env.TYPEORM_DATABASE} DB on port: ${process.env.TYPEORM_PORT}`);
            app.listen(process.env.APP_PORT, () => logger.info(`Server running on port: ${process.env.APP_PORT}`));
        }
    } catch (error) {
        logger.error("Error: DATABASE_CONNECTION FAILED =>" + error);
    }
})();
