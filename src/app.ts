import express, { Application, Response, Request, NextFunction } from "express";
import * as swaggerDoc from "./swagger/swagger.json";
import swaggerUi from "swagger-ui-express";
//Logger
import helmet from "helmet";
import morgan from "morgan";
import { LoggerStream } from "./logger/winstonConfig";

//Routers
import { userRouter } from "./routes/userRoutes";
import { tweetRouter } from "./routes/tweetRoutes";

export const app: Application = express();

app.use(helmet());
app.use(morgan("combined", { stream: new LoggerStream() }));

app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Access-Control-Allow-Origin", process.env.FRONT_URL ?? "");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    next();
});

app.use(express.json({ limit: "1kb" }));
app.use(express.urlencoded({ extended: false, limit: "1kb" }));

app.use("/user", userRouter);
app.use("/tweets", tweetRouter);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
