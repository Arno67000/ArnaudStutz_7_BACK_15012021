import * as express from 'express';
import {Application, Response, Request} from 'express';

const app: Application = express();

app.get('/test', (req: Request, res: Response) => {
    res.send('Hello TS')
});

app.listen(3000, () => {
    console.log('Express Server running on port: 3000')
})