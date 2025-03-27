import { io, Socket } from "socket.io-client";
import { isAuth } from "../utility/helper";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SERVER_URL, { autoConnect: false });

    socket.on("connect", () => {});

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  }
  return socket;
};

export const initializeSocket = (): void => {
  if (isAuth()) {
    const newSocket = getSocket();
    newSocket.emit("register", isAuth()._id);
    
    if (!newSocket.connected) {
      newSocket.connect();
    }

    newSocket.on("connect", () => {
      newSocket.emit("userConnected", isAuth()._id);
    });
  } else {
    console.log("User is not authenticated, socket not initialized.");
  }
};

export const getSocketId = (): string | undefined => {
  return socket?.id;
};
