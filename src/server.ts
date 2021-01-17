import * as http from 'http';
import { app } from './app';
require('dotenv').config();

app.set('PORT', process.env.APP_PORT);

const server = http.createServer(app);

server.listen(process.env.APP_PORT);