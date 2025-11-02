import { io, Socket } from "socket.io-client";
import { isAuth } from "../utility/helper";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SERVER_URL, {
      transports: ["websocket"],
      autoConnect: false,
      path: "/socket.io/",
    });

    socket.on("disconnect", () => {
      console.log("⚠️ Socket disconnected");
    });
  }
  return socket;
};

export const initializeSocket = (): void => {
  const user = isAuth();
  if (!user) return console.log("User not authenticated — socket not initialized.");

  const newSocket = getSocket();

  if (!newSocket.connected) newSocket.connect();

  newSocket.on("connect", () => {
    console.log("✅ Socket connected:", newSocket.id);
    newSocket.emit("register", user._id); // register user
  });
};

export const getSocketId = (): string | undefined => {
    return socket?.id;
};
