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
exports.getAccessToken = void 0;
const electron_1 = require("electron");
const chatgpt_api_1 = require("../chatgpt-api");
const toggle_user_agent_1 = require("./toggle-user-agent");
const getAccessToken = (extraHeaders) => __awaiter(void 0, void 0, void 0, function* () {
    let headers = '';
    Object.keys(extraHeaders).forEach(hKey => {
        headers += `${hKey}=${extraHeaders[hKey]}`;
    });
    const win = new electron_1.BrowserWindow({ width: 799, height: 600 });
    win.loadURL('https://chat.openai.com/api/auth/session', { userAgent: toggle_user_agent_1.currentUserAgent, extraHeaders: headers });
    return new Promise(resolve => {
        win.webContents.on('did-finish-load', () => __awaiter(void 0, void 0, void 0, function* () {
            (0, toggle_user_agent_1.setUserAgent)(win.webContents.getUserAgent());
            resolve(yield getToken(win));
        }));
    });
});
exports.getAccessToken = getAccessToken;
const getToken = (win) => __awaiter(void 0, void 0, void 0, function* () {
    const cookies = yield win.webContents.session.cookies.get({});
    try {
        let code = `const elements = document.getElementsByTagName('pre');
        if(elements.length > 0) {
            elements.item(0).innerHTML;
        }`;
        const executionResult = yield win.webContents.executeJavaScript(code);
        if (executionResult) {
            const parsedExecutionResult = JSON.parse(executionResult);
            const api = yield chatgpt_api_1.ChatGPTAPI.getInstance({
                cookies,
                userAgent: toggle_user_agent_1.currentUserAgent
            });
            api.accessToken = parsedExecutionResult.accessToken;
            process.stdout.write(parsedExecutionResult.accessToken);
            win.close();
            return parsedExecutionResult.accessToken;
        }
    }
    catch (e) {
        console.error(e);
    }
});
