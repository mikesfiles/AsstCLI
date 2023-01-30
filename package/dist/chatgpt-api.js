"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGPTAPI = void 0;
const expiry_map_1 = __importDefault(require("expiry-map"));
const uuid_1 = require("uuid");
const types = __importStar(require("./types"));
const chatgpt_conversation_1 = require("./chatgpt-conversation");
const axios_1 = require("axios");
const constants_1 = require("./browser-commands/constants");
const toggle_user_agent_1 = require("./browser-commands/toggle-user-agent");
const fs = require('fs');
const KEY_ACCESS_TOKEN = 'accessToken';
const USER_AGENT = toggle_user_agent_1.currentUserAgent;
function listToCookieString(list) {
    let cookieString = '';
    for (const item of constants_1.cookiesToInclude) {
        const cookie = list.filter(listItem => listItem.name === item)[0];
        if (cookie) {
            const itemString = `${cookie.name}=${cookie.value}`;
            cookieString += `${itemString}; `;
        }
    }
    return cookieString;
}
class ChatGPTAPI {
    constructor(opts) {
        this._cookies = [];
        this._user = null;
        const { cookies = [], markdown = true, apiBaseUrl = 'https://chat.openai.com/api', backendApiBaseUrl = 'https://chat.openai.com/backend-api', userAgent = USER_AGENT, accessTokenTTL = 60000, // 1 hour
        accessToken, headers, debug = false } = opts;
        this.apiClient = new axios_1.Axios({ baseURL: apiBaseUrl });
        this.backendClient = new axios_1.Axios({ baseURL: backendApiBaseUrl });
        this._cookies = cookies;
        this._markdown = !!markdown;
        this._debug = !!debug;
        this._apiBaseUrl = apiBaseUrl;
        this._backendApiBaseUrl = backendApiBaseUrl;
        this._userAgent = userAgent;
        this._headers = Object.assign({ 'user-agent': this._userAgent, 'x-openai-assistant-app-id': '', 'accept-language': 'en-US,en;q=0.9', "Accept-Encoding": "gzip,deflate,compress", origin: 'https://chat.openai.com', referer: 'https://chat.openai.com/chat', 'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"', 'sec-ch-ua-platform': '"Linux"', 'sec-fetch-dest': 'empty', 'sec-fetch-mode': 'cors', 'sec-fetch-site': 'same-origin' }, headers);
        this._accessTokenCache = new expiry_map_1.default(accessTokenTTL);
        if (accessToken) {
            this._accessTokenCache.set(KEY_ACCESS_TOKEN, accessToken);
        }
        if (!this._cookies) {
            throw new types.ChatGPTError('ChatGPT invalid cookies');
        }
    }
    static getInstance(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._instance) {
                this._instance = new ChatGPTAPI(opts);
            }
            return this._instance;
        });
    }
    get user() {
        return this._user;
    }
    get cookies() {
        return this._cookies;
    }
    set cookies(cookies) {
        this._cookies = cookies;
    }
    get sessionToken() {
        return this._cookies.filter((cookie) => cookie.name === constants_1.SESSION_TOKEN_COOKIE)[0].value;
    }
    set accessToken(accessToken) {
        this._accessTokenCache.set(KEY_ACCESS_TOKEN, accessToken);
    }
    get clearanceToken() {
        return this._cookies.filter((cookie) => cookie.name === constants_1.CF_CLEARANCE)[0].value;
    }
    get userAgent() {
        return this._userAgent;
    }
    sendMessage(message, opts = {}) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const { conversationId, parentMessageId = (0, uuid_1.v4)(), messageId = (0, uuid_1.v4)(), action = 'next' } = opts;
            const body = {
                action,
                messages: [
                    {
                        id: messageId,
                        role: 'user',
                        content: {
                            content_type: 'text',
                            parts: [message]
                        }
                    }
                ],
                model: 'text-davinci-002-render',
                parent_message_id: parentMessageId
            };
            if (conversationId) {
                body.conversation_id = conversationId;
            }
            let response = '';
            const headers = Object.assign(Object.assign({}, this._headers), { Authorization: `Bearer ${this._accessTokenCache.get(KEY_ACCESS_TOKEN)}`, Accept: 'text/event-stream', 'Content-Type': 'application/json', Cookie: listToCookieString(this.cookies) });
            const res = yield this.backendClient.request({
                url: '/conversation',
                method: 'POST',
                headers,
                data: JSON.stringify(body)
            });
            try {
                let index = -2;
                let parsedData;
                const parse = () => {
                    try {
                        parsedData = JSON.parse(res.data.split('data: ').slice(index)[0]);
                    }
                    catch (e) {
                        if (Math.abs(index) < res.data.length) {
                            index--;
                            parse();
                        }
                    }
                };
                parse();
                if (!parsedData) {
                    parsedData = JSON.parse(res.data);
                }
                const message = parsedData.message;
                if (message) {
                    let text = (_b = (_a = message === null || message === void 0 ? void 0 : message.content) === null || _a === void 0 ? void 0 : _a.parts) === null || _b === void 0 ? void 0 : _b[0];
                    if (text) {
                        response = text;
                    }
                }
                else if (parsedData.detail) {
                    response = parsedData.detail;
                }
                else {
                    response = 'Empty response';
                }
                return response;
            }
            catch (err) {
                console.warn('error parsing message', res.data, err);
                const errMessageL = err.toString().toLowerCase();
                if (response &&
                    (errMessageL === 'error: typeerror: terminated' || errMessageL === 'typeerror: terminated')) {
                    return response;
                }
                else {
                    return err;
                }
            }
        });
    }
    getConversations(result = [], offset = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            const headers = Object.assign(Object.assign({}, this._headers), { Authorization: `Bearer ${this._accessTokenCache.get(KEY_ACCESS_TOKEN)}`, Accept: 'text/event-stream', 'Content-Type': 'application/json', Cookie: listToCookieString(this.cookies) });
            const url = `/conversations`;
            const conversationsParams = {
                url,
                method: 'get',
                params: {
                    offset,
                    limit: 50
                },
                headers
            };
            console.log('response', (yield this.backendClient.request(conversationsParams)).data);
            const sessions = JSON.parse((yield this.backendClient.request(conversationsParams)).data).items;
            result.push(...(sessions !== null && sessions !== void 0 ? sessions : []));
            return result;
        });
    }
    changeConversationName(id, title) {
        return __awaiter(this, void 0, void 0, function* () {
            const accessToken = this._accessTokenCache.get(KEY_ACCESS_TOKEN);
            const headers = Object.assign(Object.assign({}, this._headers), { Authorization: `Bearer ${accessToken}`, Accept: 'text/event-stream', 'Content-Type': 'application/json', Cookie: listToCookieString(this.cookies) });
            const url = `/conversation/${id}`;
            const conversationsParams = {
                url,
                method: 'patch',
                headers,
                data: JSON.stringify({ title })
            };
            return this.backendClient.request(conversationsParams);
        });
    }
    getConversation(opts = {}) {
        return new chatgpt_conversation_1.ChatGPTConversation(this, opts);
    }
}
exports.ChatGPTAPI = ChatGPTAPI;
