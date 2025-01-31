"use client";

import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:8000";
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000;

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const retryCountRef = useRef(0);
  const socketRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || socketRef.current) return;

    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: false, // Handling reconnection manually
      autoConnect: false,
    });

    socketRef.current = newSocket;
    newSocket.connect();

    newSocket.on("connect", () => {
      console.log("✅ Socket connected successfully:", newSocket.id);
      setIsConnected(true);
      retryCountRef.current = 0;
      newSocket.emit("join_room", newSocket.id);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
      setIsConnected(false);

      if (retryCountRef.current < MAX_RETRIES) {
        const nextRetryDelay = INITIAL_RETRY_DELAY * Math.pow(2, retryCountRef.current);
        retryCountRef.current += 1;
        console.log(`🔄 Retrying connection in ${nextRetryDelay}ms...`);

        setTimeout(() => {
          newSocket.connect();
        }, nextRetryDelay);
      }
    });

    newSocket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      if (socketRef.current?.connected) {
        console.log("🧹 Cleaning up socket connection");
        socketRef.current.disconnect();
      }
      socketRef.current = null;
    };
  }, []);

  return socket;
};
