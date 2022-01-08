import { createConnection, getConnection } from "typeorm";
import { User } from "../entity/User";
import { Tweet } from "../entity/Tweet";

class DB {
    connect = async () => {
        return await createConnection({
            type: "sqlite",
            database: ":memory:",
            dropSchema: true,
            entities: [User, Tweet],
            synchronize: true,
            logging: false,
        });
    };
    close = async () => {
        const connection = getConnection();
        if (connection) {
            await connection.dropDatabase();
            await connection.close();
        }
    };
}

export const db = new DB();
