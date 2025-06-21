import { io, Socket } from "socket.io-client";
import { isAuth } from "../utility/helper";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(import.meta.env.VITE_SERVER_URL, {
            transports: ["websocket"],
            autoConnect: false,
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected");
        });
    }
    return socket;
};

export const initializeSocket = (): void => {
    if (isAuth()) {
        const newSocket = getSocket();

        if (!newSocket.connected) {
            newSocket.connect();
        }

        newSocket.emit("register", isAuth()._id);

        newSocket.on("connect", () => {
            console.log("Socket connected:", newSocket.id);
            newSocket.emit("userConnected", isAuth()._id);
        });
    } else {
        console.log("User is not authenticated, socket not initialized.");
    }
};

export const getSocketId = (): string | undefined => {
    return socket?.id;
};
