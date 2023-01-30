"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookiesToInclude = exports.localStorageLocation = exports.ALTERNATIVE_USER_AGENT = exports.USER_AGENT = exports.CHAT_GPT_DOMAIN = exports.CF_CLEARANCE = exports.SESSION_TOKEN_COOKIE = void 0;
exports.SESSION_TOKEN_COOKIE = '__Secure-next-auth.session-token';
exports.CF_CLEARANCE = 'cf_clearance';
exports.CHAT_GPT_DOMAIN = 'https://chat.openai.com/chat';
exports.USER_AGENT = ' Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.5359.62 Electron/22.0.0 Safari/537.36';
exports.ALTERNATIVE_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36';
exports.localStorageLocation = `${__dirname}/../../localStorage`;
exports.cookiesToInclude = ['_ga', '_gid', 'intercom-session-dgkjq2bp', 'intercom-device-id-dgkjq2bp', 'cf_clearance', '__Secure-next-auth.session-token', '__Host-next-auth.csrf-token', '__Secure-next-auth.callback-url', '_cfuvid', 'mp_d7d7628de9d5e6160010b84db960a7ee_mixpanel', '__cf_bm'];