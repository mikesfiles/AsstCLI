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
exports.sendMessage = void 0;
const constants_1 = require("./constants");
const electron_1 = require("electron");
const sendMessage = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const win = new electron_1.BrowserWindow({ width: 799, height: 600, show: true });
    win.loadURL(constants_1.CHAT_GPT_DOMAIN);
    return new Promise((resolve) => {
        win.webContents.on('did-finish-load', () => __awaiter(void 0, void 0, void 0, function* () {
            console.log('finish load');
            let code = `(!!document.querySelector('meta[content="ChatGPT"]') && !!document.getElementsByTagName("textarea").item(0) && !!document.getElementsByTagName("nav").item(0));`;
            const executionResult = yield win.webContents.executeJavaScript(code);
            if (executionResult) {
                if (process.env.ENV !== 'dev') {
                    win.hide();
                }
                resolve(yield handleMainPage(win, message.join(' ')));
            }
        }));
    });
});
exports.sendMessage = sendMessage;
const selectNextConversation = (win, index = 0) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('selecting ', index);
    return new Promise((resolve) => __awaiter(void 0, void 0, void 0, function* () {
        win.webContents.debugger.on('message', (event, method, params) => __awaiter(void 0, void 0, void 0, function* () {
            if (method === 'Network.responseReceived') {
                const { response } = params;
                const { url } = response;
                if (url.indexOf("/conversation") > -1 && !url.endsWith('conversation')) {
                    resolve(null);
                }
            }
        }));
        const code = `document.getElementsByTagName('nav').item(0).getElementsByClassName("flex-col").item(0).childNodes.item(0).getElementsByTagName("a").item(${index}).click()`;
        yield win.webContents.executeJavaScript(code);
    }));
});
const findConversation = (win) => __awaiter(void 0, void 0, void 0, function* () {
    let index = 0;
    let executionResult = true;
    const navItems = yield new Promise(resolve => setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        const code = `document.getElementsByTagName('nav').item(0).getElementsByClassName("flex-col").item(1).childElementCount`;
        const length = yield win.webContents.executeJavaScript(code);
        if (!!length) {
            resolve(length);
        }
    }), 1000));
    if (navItems > 1) {
        while (executionResult) {
            yield selectNextConversation(win, index);
            let code = `(!!document.querySelector('meta[content="ChatGPT"]') && !!document.getElementsByTagName("textarea").item(0) && !!document.getElementsByTagName("nav").item(0));`;
            executionResult = !(yield win.webContents.executeJavaScript(code));
            console.log('check index', index, executionResult);
            index++;
        }
    }
});
const handleMainPage = (win, message) => __awaiter(void 0, void 0, void 0, function* () {
    win.webContents.debugger.attach('1.3');
    let requestId;
    return new Promise((resolve) => __awaiter(void 0, void 0, void 0, function* () {
        win.webContents.debugger.on('message', (event, method, params) => __awaiter(void 0, void 0, void 0, function* () {
            if (method === 'Network.responseReceived') {
                const { response } = params;
                const { url } = response;
                if (response.mimeType === 'text/event-stream' && url.endsWith("/conversation")) {
                    requestId = params.requestId;
                }
            }
            if (requestId && params.requestId === requestId && method === 'Network.dataReceived') {
                try {
                    const currentMessageContent = yield win.webContents.executeJavaScript(`
                        document.getElementsByClassName('markdown').item(document.getElementsByClassName('markdown').length - 1).innerHTML;
                    `);
                    process.stdout.write(JSON.stringify({ return: currentMessageContent }));
                }
                catch (e) {
                    console.error(e);
                }
            }
            if (requestId && params.requestId === requestId && (method === 'Network.loadingFinished' || method === 'Network.loadingFailed')) {
                process.stdout.write(JSON.stringify({ return: 'done' }));
                resolve('done');
                win.close();
            }
        }));
        win.webContents.debugger.sendCommand('Network.enable');
        yield findConversation(win);
        win.webContents.executeJavaScript(`
            document.getElementsByTagName("textarea").item(0).value = "${message}";
            document.getElementsByTagName("textarea").item(0).nextElementSibling.click();
        `);
    }));
});
