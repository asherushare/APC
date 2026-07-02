import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 
  (process.env.NEXT_PUBLIC_API_URL 
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, '') 
    : (process.env.NODE_ENV === 'production' 
        ? 'https://apc-backend-wsyo.onrender.com' 
        : 'http://localhost:4000'));

let globalSocket: Socket | null = null;

const getSocket = (): Socket => {
  if (!globalSocket) {
    globalSocket = io(SOCKET_URL, {
      autoConnect: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
  }
  return globalSocket;
};

/**
 * Custom React hook to hook into the global socket.io client connection.
 * Dynamic event listeners are updated via mutable refs to prevent re-subscription cycles.
 */
export const useSocket = (
  events: Record<string, (...args: unknown[]) => void>
) => {
  const eventsRef = useRef(events);
  
  // Keep event refs updated with current closures
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    // Capture current list of event listeners for cleanup matching
    const registeredHandlers: Record<string, (...args: unknown[]) => void> = {};

    Object.keys(eventsRef.current).forEach((eventName) => {
      const handler = (...args: unknown[]) => {
        eventsRef.current[eventName]?.(...args);
      };
      registeredHandlers[eventName] = handler;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socket.on(eventName, handler as (...args: any[]) => void);
    });

    return () => {
      Object.entries(registeredHandlers).forEach(([eventName, handler]) => {
        socket.off(eventName, handler);
      });
    };
  }, []); // Run on mount and unmount only

  return globalSocket || getSocket();
};
