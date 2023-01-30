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
exports.conversationLoaded = void 0;
const conversationLoaded = (win) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve) => {
        win.webContents.on('did-finish-load', () => __awaiter(void 0, void 0, void 0, function* () {
            let code = `(!!document.querySelector('meta[content="ChatGPT"]') && !!document.getElementsByTagName("textarea").item(0));`;
            const executionResult = yield win.webContents.executeJavaScript(code);
            if (executionResult) {
                win.webContents.debugger.attach('1.3');
                let requestId;
                return new Promise((resolve) => {
                    win.webContents.debugger.on('message', (event, method, params) => __awaiter(void 0, void 0, void 0, function* () {
                        if (method === 'Network.responseReceived') {
                            const { response } = params;
                            const { url } = response;
                            if (url.indexOf("/conversations") > -1) {
                                requestId = params.requestId;
                                win.close();
                            }
                        }
                        if (requestId === params.requestId && (method === 'Network.loadingFinished' || method === 'Network.loadingFailed')) {
                            resolve(true);
                        }
                    }));
                    win.webContents.debugger.sendCommand('Network.enable');
                });
            }
        }));
    });
});
exports.conversationLoaded = conversationLoaded;
