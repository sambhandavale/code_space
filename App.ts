import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import connectDB from './config/db';
import cookieParser from "cookie-parser";
import passport from "passport";
import { passportInit } from './controllers/authentication/auth';
import { routes } from './routes';
import { Server } from 'socket.io';
import path from 'path';

dotenv.config();

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: [
      process.env.REACT_APP_BASE_URL,
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  path: '/socket.io/',
});

app.use(
    cors({
      credentials: true,
      origin: [
        process.env.REACT_APP_BASE_URL,
        "https://code-space-frontend.onrender.com",
        "https://code-space-w5m1.vercel.app",
        "https://code-space-4u.vercel.app",
      ],
    }),
  );

// Middleware
app.use(express.json());

// Database connection
connectDB();

app.use(cookieParser());

app.use(passport.initialize());
passportInit(passport);

routes(app);

export const userSockets = new Map<string, string>();

io.on("connection", (socket) => {
  console.log(`🔌 New connection: ${socket.id}`);

  socket.on("register", (userId) => {
      userSockets.set(userId, socket.id);
      console.log(`✅ User ${userId} registered with Socket ID: ${socket.id}`);
  });

  socket.on("disconnect", () => {
      userSockets.forEach((socketId, userId) => {
          if (socketId === socket.id) {
              console.log(`❌ User ${userId} disconnected`);
              userSockets.delete(userId);
          }
      });
  });
}); 

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
 