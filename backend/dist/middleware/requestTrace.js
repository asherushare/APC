"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestTraceMiddleware = void 0;
const uuid_1 = require("uuid");
const requestTraceMiddleware = (req, res, next) => {
    const requestId = (0, uuid_1.v4)();
    req.requestId = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
};
exports.requestTraceMiddleware = requestTraceMiddleware;
