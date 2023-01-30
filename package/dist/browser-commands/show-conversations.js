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
exports.getConversations = void 0;
const electron_1 = require("electron");
const constants_1 = require("./constants");
const getConversations = () => __awaiter(void 0, void 0, void 0, function* () {
    const win = new electron_1.BrowserWindow({ width: 799, height: 600, show: true });
    win.loadURL(constants_1.CHAT_GPT_DOMAIN);
    return new Promise((resolve) => {
        win.webContents.on('did-finish-load', () => __awaiter(void 0, void 0, void 0, function* () {
            let code = `(!!document.querySelector('meta[content="ChatGPT"]') && !!document.getElementsByTagName("textarea").item(0));`;
            const executionResult = yield win.webContents.executeJavaScript(code);
            if (executionResult) {
                win.webContents.debugger.attach('1.3');
                let requestId;
                return new Promise((resolve) => {
                    win.webContents.debugger.on('message', (event, method, params) => __awaiter(void 0, void 0, void 0, function* () {
                        var _a;
                        console.log(method, (_a = params.response) === null || _a === void 0 ? void 0 : _a.url);
                        if (method === 'Network.responseReceived') {
                            const { response } = params;
                            const { url } = response;
                            if (url.indexOf("/conversations") > -1) {
                                requestId = params.requestId;
                                win.close();
                            }
                        }
                        if (requestId === params.requestId && method === 'Network.loadingFinished') {
                            console.log(requestId);
                            resolve(yield win.webContents.debugger.sendCommand('Network.getResponseBody', { requestId }));
                        }
                    }));
                    win.webContents.debugger.sendCommand('Network.enable');
                });
            }
        }));
    });
});
exports.getConversations = getConversations;
