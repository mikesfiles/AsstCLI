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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGPTConversation = void 0;
class ChatGPTConversation {
    constructor(api, opts = {}) {
        this.conversationId = undefined;
        this.parentMessageId = undefined;
        this.api = api;
        this.conversationId = opts.conversationId;
        this.parentMessageId = opts.parentMessageId;
    }
    sendMessage(message, opts = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const { onConversationResponse } = opts, rest = __rest(opts
            /*const allConversations = await this.api.getConversations();
            const conversations = allConversations.filter(item => item.title === 'CLI');
            if(conversations.length === 0) {
                if(allConversations.length > 0) {
                    await this.api.changeConversationName(allConversations[0].id, 'CLI');
                }
            }
            let conversationId = conversations.length > 0 ? conversations[0].id : undefined;*/
            , ["onConversationResponse"]);
            /*const allConversations = await this.api.getConversations();
            const conversations = allConversations.filter(item => item.title === 'CLI');
            if(conversations.length === 0) {
                if(allConversations.length > 0) {
                    await this.api.changeConversationName(allConversations[0].id, 'CLI');
                }
            }
            let conversationId = conversations.length > 0 ? conversations[0].id : undefined;*/
            let conversationId = undefined;
            return this.api.sendMessage(message, Object.assign(Object.assign({}, rest), { conversationId, parentMessageId: this.parentMessageId, onConversationResponse: (response) => {
                    var _a;
                    if (response.detail && onConversationResponse) {
                        return onConversationResponse(response);
                    }
                    if (response.conversation_id) {
                        this.conversationId = response.conversation_id;
                    }
                    if ((_a = response.message) === null || _a === void 0 ? void 0 : _a.id) {
                        this.parentMessageId = response.message.id;
                    }
                    if (onConversationResponse) {
                        return onConversationResponse(response);
                    }
                } }));
        });
    }
}
exports.ChatGPTConversation = ChatGPTConversation;
