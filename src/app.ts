import * as express from 'express';
import {Application, Response, Request, NextFunction} from 'express';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
dotenv.config();
import * as helmet from 'helmet';

import { userRouter } from './routes/user';
import { createConnection } from 'typeorm';
import { tweetRouter } from './routes/tweet';

export const app: Application = express();

app.use(helmet());

app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

createConnection()
    .then(() => {
        console.log('Connecté à la DATABASE : port '+process.env.TYPEORM_PORT);
    })
    .catch(err => console.log('Error: DATABASE_CONNECTION FAILED =>'+err));

app.use(bodyParser.json({ limit: "1kb" }));
app.use(bodyParser.urlencoded({extended: false, limit: "1kb"}));

app.use('/user', userRouter);
app.use('/tweets', tweetRouter);

// error handler
app.use(function(err: any, req: Request, res: Response, next: NextFunction) {
    res.status(err.status || 500);
    res.render('error');
   });
  
