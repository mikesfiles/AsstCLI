"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCookies = void 0;
const electron_1 = require("electron");
const constants_1 = require("./constants");
const getCookies = () => __awaiter(void 0, void 0, void 0, function* () {
    const win = new electron_1.BrowserWindow({ width: 799, height: 600 });
    win.loadURL(constants_1.CHAT_GPT_DOMAIN);
    win.webContents.debugger.attach('1.3');
    return new Promise((resolve) => {
        win.webContents.debugger.on('message', (event, method, params) => __awaiter(void 0, void 0, void 0, function* () {
            if (method === 'Network.responseReceived') {
                const url = params.response.url;
                const response = yield win.webContents.debugger.sendCommand('Network.getResponseBody', { requestId: params.requestId });
                if (url.indexOf('/session') > -1) {
                    const securityInfo = {
                        accessToken: JSON.parse(response.body).accessToken,
                        cookies: yield win.webContents.session.cookies.get({})
                    };
                    resolve(securityInfo);
                    process.stdout.write(JSON.stringify({ return: securityInfo }));
                    //win.close();
                }
            }
        }));
        win.webContents.debugger.sendCommand('Network.enable');
    });
});
exports.getCookies = getCookies;
