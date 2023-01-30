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
exports.unnecessaryClientCommand = exports.commands = exports.resetAuth = exports.useConversation = exports.runSandbox = exports.loadingSpinner = void 0;
const constants_1 = require("./browser-commands/constants");
const routes_1 = require("./browser-commands/routes");
const Spinner = require('cli-spinner').Spinner;
const child_process_1 = require("child_process");
const electronPath = require("electron");
const fs = require('fs');
const readline = require('readline');
const cliMd = require('cli-md');
let authTry = 0;
exports.loadingSpinner = new Spinner('processing... %s');
const runSandbox = (route, ...args) => __awaiter(void 0, void 0, void 0, function* () {
    const path = `${__dirname}/browser-commands/execute-browser.js`;
    if (typeof electronPath === 'object') {
        return routes_1.default[route].response(yield routes_1.default[route].request(args));
    }
    else {
        return new Promise((resolve) => {
            const opResult = (0, child_process_1.spawn)(electronPath, ['--no-logging', path, args.join(' ')], { env: Object.assign(Object.assign({}, process.env), { ROUTE: route, ELECTRON_ENABLE_LOGGING: '0' }) });
            opResult.stdout.on('data', (data) => {
                try {
                    const returnedValue = JSON.parse(data.toString()).return;
                    if (returnedValue === 'done') {
                        resolve(returnedValue);
                        return;
                    }
                    routes_1.default[route].response(returnedValue);
                }
                catch (e) {
                    if (process.env.ENV === 'dev') {
                        console.error(e, 'error:', data.toString());
                    }
                }
            });
        });
    }
});
exports.runSandbox = runSandbox;
const useConversation = (rl, answer = "Hello how can i help you?") => {
    rl.question(`${cliMd('🤖 ' + answer)}> `, (request) => {
        if (request.length > 0) {
            exports.loadingSpinner.start();
            (0, exports.runSandbox)('SEND_MESSAGE', request).then(res => {
                (0, exports.useConversation)(rl, res);
            })
                .catch(e => (0, exports.useConversation)(rl, e))
                .finally(() => exports.loadingSpinner.stop(true));
        }
        else {
            (0, exports.useConversation)(rl, 'Please write a message');
        }
    });
};
exports.useConversation = useConversation;
const startConversation = () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    (0, exports.useConversation)(rl);
};
const resetAuth = () => __awaiter(void 0, void 0, void 0, function* () {
    if (fs.existsSync(constants_1.localStorageLocation)) {
        fs.rmSync(constants_1.localStorageLocation);
    }
    yield (0, exports.runSandbox)('CLEAN');
    console.log('Cache cleaned!');
});
exports.resetAuth = resetAuth;
const getVersion = () => {
    const version = JSON.parse(fs.readFileSync(`${__dirname}/../package.json`).toString()).version;
    console.log(version);
};
exports.commands = {
    'open chat': startConversation,
    'start conversation': startConversation,
    'start chat': startConversation,
    'chat': startConversation
};
exports.unnecessaryClientCommand = {
    'reset auth': exports.resetAuth,
    'clear session': exports.resetAuth,
    'version': getVersion,
    'clean': exports.resetAuth
};
