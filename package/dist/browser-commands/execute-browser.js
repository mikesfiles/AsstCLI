"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const routes_1 = require("./routes");
electron_1.app.on('ready', () => routes_1.default[process.env.ROUTE].request(process.argv.slice(3)));
electron_1.app.on('window-all-closed', () => {
    electron_1.app.quit();
});
