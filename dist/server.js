"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const app_1 = require("./app");
require('dotenv').config();
app_1.app.set('PORT', process.env.APP_PORT);
const server = http.createServer(app_1.app);
server.listen(process.env.APP_PORT);
//# sourceMappingURL=server.js.map