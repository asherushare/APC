import { Server as SocketServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { env } from '../config/env';

let io: SocketServer | null = null;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      io?: SocketServer;
    }
  }
}

/**
 * Initialize Socket.io Server with proper CORS settings
 */
export const initSocket = (httpServer: HTTPServer): SocketServer => {
  const allowedOrigins = [
    'https://apc-rose.vercel.app',
    'http://localhost:3000',
  ];

  if (env.FRONTEND_URL) {
    const normalizedFrontend = env.FRONTEND_URL.replace(/\/$/, '');
    if (!allowedOrigins.includes(normalizedFrontend)) {
      allowedOrigins.push(normalizedFrontend);
    }
  }

  if (env.CORS_ORIGIN) {
    env.CORS_ORIGIN.split(',')
      .map((o) => o.trim().replace(/\/$/, ''))
      .filter(Boolean)
      .forEach((origin) => {
        if (!allowedOrigins.includes(origin)) {
          allowedOrigins.push(origin);
        }
      });
  }

  io = new SocketServer(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Upload-Token'],
    },
  });

  return io;
};

/**
 * Retrieve active Socket.io Server instance
 */
export const getIO = (): SocketServer => {
  if (!io) {
    throw new Error('Socket.io has not been initialized');
  }
  return io;
};
