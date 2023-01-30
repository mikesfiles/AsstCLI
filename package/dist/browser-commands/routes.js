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
const clean_1 = require("./clean");
const send_message_1 = require("./send-message");
const cliMd = require('cli-md');
const node_html_markdown_1 = require("node-html-markdown");
const show_conversations_1 = require("./show-conversations");
const core_1 = require("../core");
const routes = {
    CLEAN: {
        request: clean_1.clean,
        response: () => __awaiter(void 0, void 0, void 0, function* () { })
    },
    SEND_MESSAGE: {
        request: send_message_1.sendMessage,
        response: (response) => __awaiter(void 0, void 0, void 0, function* () {
            core_1.loadingSpinner.stop(true);
            console.clear();
            console.log(cliMd(node_html_markdown_1.NodeHtmlMarkdown.translate(response || '')));
            return response;
        })
    },
    GET_CONVERSATIONS: {
        request: show_conversations_1.getConversations,
        response: (response) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(response);
            return response;
        })
    }
};
exports.default = routes;
