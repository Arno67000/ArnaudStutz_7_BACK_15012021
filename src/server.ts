import { app } from "./app";
import { createConnection } from "typeorm";
import dotenv from "dotenv";
dotenv.config();

(async () => {
    try {
        const connection = await createConnection();
        if (connection) {
            console.log(`Connected to ${process.env.TYPEORM_DATABASE} DB on port: ${process.env.TYPEORM_PORT}`);
            app.listen(process.env.APP_PORT, () => console.log(`Server running on port: ${process.env.APP_PORT}`));
        }
    } catch (error) {
        console.log("Error: DATABASE_CONNECTION FAILED =>" + error);
    }
})();
