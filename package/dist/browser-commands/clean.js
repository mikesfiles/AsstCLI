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
exports.clean = void 0;
const electron_1 = require("electron");
const clean = () => __awaiter(void 0, void 0, void 0, function* () {
    const win = new electron_1.BrowserWindow({ width: 799, height: 600 });
    win.loadURL('https://chat.openai.com/chat');
    return new Promise((resolve, reject) => {
        win.webContents.on('did-finish-load', () => {
            let code = `!!document.querySelector('meta[content="ChatGPT"]');`;
            win.webContents.executeJavaScript(code).then((executionResult) => __awaiter(void 0, void 0, void 0, function* () {
                if (executionResult) {
                    try {
                        yield win.webContents.session.clearCache();
                        yield win.webContents.session.clearStorageData({ origin: 'https://chat.openai.com' });
                        yield win.webContents.session.clearAuthCache();
                        resolve(executionResult);
                    }
                    catch (e) {
                        reject(e);
                    }
                    finally {
                        win.close();
                    }
                }
            }));
        });
    });
});
exports.clean = clean;
