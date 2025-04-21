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

dotenv.config();

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:1507",
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
const PORT = process.env.PORT || 6000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
 