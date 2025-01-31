"use client";

import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Providers } from "./Providers";
import { useSocket } from "@/lib/socket";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import  React from "react"; // Added import for React
export default function RootLayout({
  children,
}) {
  const socket = useSocket();
  useEffect(() => {
    socket?.on("connect", () => {
      console.log("Connected to socket server:", socket.id);
    });
    socket?.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
    return () => {
      socket?.on("disconnect", () => {
        console.log("Disconnected from socket server");
        socket.emit("leave_room", socket.id);
      });
      if (socket) socket.close();
    };
  }, [socket]);
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="referrer" content="no-referrer-when-downgrade" />
      </head>
      <body 
        className="h-screen w-screen min-w-screen overflow-hidden"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <span>
            {process.env.BACKEND_URL}
            </span>
            {children}
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
