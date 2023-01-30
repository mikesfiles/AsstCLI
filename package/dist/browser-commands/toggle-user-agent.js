"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUserAgent = exports.currentUserAgent = void 0;
const constants_1 = require("./constants");
exports.currentUserAgent = constants_1.USER_AGENT;
const setUserAgent = (userAgent) => {
    exports.currentUserAgent = userAgent;
};
exports.setUserAgent = setUserAgent;
