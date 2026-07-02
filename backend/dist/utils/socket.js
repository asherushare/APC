"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const env_1 = require("../config/env");
let io = null;
/**
 * Initialize Socket.io Server with proper CORS settings
 */
const initSocket = (httpServer) => {
    const allowedOrigins = [
        'https://apc-rose.vercel.app',
        'http://localhost:3000',
    ];
    if (env_1.env.FRONTEND_URL) {
        const normalizedFrontend = env_1.env.FRONTEND_URL.replace(/\/$/, '');
        if (!allowedOrigins.includes(normalizedFrontend)) {
            allowedOrigins.push(normalizedFrontend);
        }
    }
    if (env_1.env.CORS_ORIGIN) {
        env_1.env.CORS_ORIGIN.split(',')
            .map((o) => o.trim().replace(/\/$/, ''))
            .filter(Boolean)
            .forEach((origin) => {
            if (!allowedOrigins.includes(origin)) {
                allowedOrigins.push(origin);
            }
        });
    }
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Upload-Token'],
        },
    });
    return io;
};
exports.initSocket = initSocket;
/**
 * Retrieve active Socket.io Server instance
 */
const getIO = () => {
    if (!io) {
        throw new Error('Socket.io has not been initialized');
    }
    return io;
};
exports.getIO = getIO;
