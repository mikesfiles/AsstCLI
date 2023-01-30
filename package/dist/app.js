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
const core_1 = require("./core");
const os = require('os');
(() => __awaiter(void 0, void 0, void 0, function* () {
    if (parseInt(process.versions.node.split(".")[0], 10) < 16) {
        console.error('You are using a node version earlier than 16, please update it and retry');
        return;
    }
    let argumentIndex = 4;
    if (os.platform() === 'win32') {
        argumentIndex++;
    }
    const args = process.argv.slice(argumentIndex);
    const noClientDef = core_1.unnecessaryClientCommand[args.join(' ')];
    if (noClientDef) {
        noClientDef();
        return;
    }
    const def = core_1.commands[args.join(' ')];
    if (def) {
        def();
    }
    else {
        core_1.loadingSpinner.start();
        yield (0, core_1.runSandbox)('SEND_MESSAGE', args);
    }
}))().catch((err) => console.log(err));
