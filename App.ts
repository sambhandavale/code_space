import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import morgan from "morgan";
import connectDB from './Config/db';
import cookieParser from "cookie-parser";
import passport from "passport";
import { passportInit } from './Controllers/Authentication/auth';
import { routes } from './Routes';
import { Server } from 'socket.io';
import path from 'path';
import MatchMaking from './Models/Challenges/MatchMaking';
import { MatchmakingService } from './Services/ChallengeServices/matchmakingService';
import { initSocket, io, userSockets } from './Config/socket';
import './Workers/Challenges/CodeWorker';

dotenv.config();

const app = express();
const server = http.createServer(app);
initSocket(server);

app.use(
    cors({
      credentials: true,
      origin: [
        process.env.REACT_APP_BASE_URL,
        process.env.REACT_APP_BASE_URL2,
        process.env.REACT_APP_BASE_URL3,
        'https://www.code-space.tech',
        'https://code-space.tech',
      ],
    }),
  );

// Middleware
app.use(express.json());

// Database connection
connectDB();

app.use(cookieParser());

app.use(morgan("dev"));

app.use(passport.initialize());
passportInit(passport);

routes(app);

io.on("connection", (socket) => {
  console.log(`🔌 New connection: ${socket.id}`);

  socket.on("register", (userId) => {
      if (!userSockets.has(userId)) {
          userSockets.set(userId, new Set());
      }
      userSockets.get(userId).add(socket.id);
  });

  socket.on("join_queue", async ({ userId, language, timeControl, timezone }) => {
    try {
      console.log(`🎯 ${userId} joined matchmaking queue`);
      const result = await MatchmakingService.joinMatchmaking(
        userId,
        language,
        timeControl,
        timezone
      );

      if (result.matchFound) {
        console.log(`✅ Match found for ${userId}`);
        // MatchmakingService handles socket emits internally now
      } else {
        socket.emit("queued", { message: "Searching for a match..." });
      }
    } catch (err) {
      console.error("Error in join_queue:", err);
      socket.emit("error_message", { message: "Internal server error" });
    }
  });

  socket.on("disconnect", () => {
      userSockets.forEach((socketIds, userId) => {
          if (socketIds.has(socket.id)) {
              socketIds.delete(socket.id);
              console.log(`❌ User ${userId} disconnected from socket ${socket.id}`);

              if (socketIds.size === 0) {
                  userSockets.delete(userId);
                  console.log(`💨 All sockets for user ${userId} are disconnected.`);

                  // Cleanup matchmaking entry
                  MatchMaking.deleteOne({ user_id: userId }).then(() => {
                      console.log(`🧹 Removed user ${userId} from matchmaking queue.`);
                  }).catch(err => console.error("Error removing user from matchmaking queue:", err));
              }
          }
      });
  });

}); 

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
 