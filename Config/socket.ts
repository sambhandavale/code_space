import { Server } from 'socket.io';
import http from 'http';

export const userSockets = new Map<string, Set<string>>();
export let io: Server;

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: [
        process.env.REACT_APP_BASE_URL,
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
    path: '/socket.io/',
  });
  return io;
};