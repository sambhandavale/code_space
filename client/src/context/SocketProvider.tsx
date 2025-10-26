import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import { isAuth } from "../utility/helper";

interface SocketContextValue {
  socket: Socket | null;
  socketId: string | null;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  onMatchFound: (callback: (data: any) => void) => void;
  emitChallenge: (opponentId: string) => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  socketId: null,
  joinRoom: () => {},
  leaveRoom: () => {},
  onMatchFound: () => {},
  emitChallenge: () => {},
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const listenersRef = useRef<Record<string, Function[]>>({});

  useEffect(() => {
    if (!isAuth()) return;

    const token = localStorage.getItem("wsToken"); // or cookie.get("wsToken")
    if (!token) return;

    const sock = io(import.meta.env.VITE_SERVER_URL!, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    sock.connect();

    sock.on("connect", () => {
      console.log("✅ Socket connected:", sock.id);
      setSocket(sock);
      setSocketId(sock.id ?? null);

      // Automatically register user on backend
      sock.emit("register", isAuth()._id);
    });

    sock.on("disconnect", (reason) => {
      console.warn("Socket disconnected:", reason);
    });

    // Handle all dynamic event listeners
    sock.onAny((event, data) => {
      const listeners = listenersRef.current[event];
      if (listeners) {
        listeners.forEach((cb) => cb(data));
      }
    });

    setSocket(sock);

    return () => {
      sock.disconnect();
    };
  }, []);

  const joinRoom = (roomId: string) => {
    if (socket) socket.emit("joinRoom", roomId);
  };

  const leaveRoom = (roomId: string) => {
    if (socket) socket.emit("leaveRoom", roomId);
  };

    const onMatchFound = (callback: (data: any) => void) => {
        if (!listenersRef.current["match_found"]) listenersRef.current["match_found"] = [];
        listenersRef.current["match_found"].push(callback);
    };


  const emitChallenge = (opponentId: string) => {
    if (socket) socket.emit("challengeUser", { opponentId });
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        socketId,
        joinRoom,
        leaveRoom,
        onMatchFound,
        emitChallenge,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
