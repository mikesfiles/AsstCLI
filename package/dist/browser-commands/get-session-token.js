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
exports.getSessionToken = void 0;
const chatgpt_api_1 = require("../chatgpt-api");
const electron_1 = require("electron");
const constants_1 = require("./constants");
const toggle_user_agent_1 = require("./toggle-user-agent");
const getSessionToken = () => __awaiter(void 0, void 0, void 0, function* () {
    const win = new electron_1.BrowserWindow({ width: 799, height: 600 });
    win.loadURL(constants_1.CHAT_GPT_DOMAIN);
    win.webContents.on('did-finish-load', () => {
        (0, toggle_user_agent_1.setUserAgent)(win.webContents.getUserAgent());
        let code = `!!(document.querySelector('meta[content="ChatGPT"]'));`;
        win.webContents.executeJavaScript(code).then(executionResult => {
            if (executionResult) {
                checkTokens(win);
            }
        }).catch(e => console.error('custom error', e));
    });
});
exports.getSessionToken = getSessionToken;
const checkTokens = (win) => __awaiter(void 0, void 0, void 0, function* () {
    const cookies = yield win.webContents.session.cookies.get({});
    try {
        const token = cookies.filter((cookie) => cookie.name === constants_1.SESSION_TOKEN_COOKIE)[0].value;
        const clearanceToken = cookies.filter((cookie) => cookie.name === constants_1.CF_CLEARANCE)[0].value;
        const api = yield chatgpt_api_1.ChatGPTAPI.getInstance({
            cookies,
            userAgent: toggle_user_agent_1.currentUserAgent
        });
        /*const authenticated = await api.getIsAuthenticated();
        if(authenticated.type === 'code') {
            process.stdout.write('data: ' + JSON.stringify({token, clearanceToken}));
            win.close();
        }
        if(authenticated.type === 'page') {
            const request = authenticated.content as AxiosRequestConfig;
            await getAccessToken(request);
        }*/
        electron_1.app.exit();
    }
    catch (e) {
        console.error('error during check tokens', e);
    }
});
