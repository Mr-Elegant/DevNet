import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const user = useSelector((store) => store.user);

  useEffect(() => {
    // 1. Connect when user logs in
    if (user && !socket) {
      const isExternal = BASE_URL.startsWith("http://") || BASE_URL.startsWith("https://");
      const socketUrl = isExternal ? BASE_URL : "/";
      const socketOptions = {
        withCredentials: true,
        ...(isExternal ? {} : { path: "/api/socket.io" }),
      };

      const newSocket = io(socketUrl, socketOptions);

      newSocket.on("connect", () => {
        console.log("🔌 Global Socket Connected:", newSocket.id);
        // Immediately register user as online
        newSocket.emit("registerUser", user._id); 
      });

      setSocket(newSocket);
    } 
    
    // 2. Disconnect when user logs out
    else if (!user && socket) {
      console.log("🔌 Global Socket Disconnecting...");
      socket.disconnect();
      setSocket(null);
    }
    
    // Cleanup on unmount
    return () => {
      // Optional: usually we want to keep the socket alive unless the specific provider unmounts
      // but if user becomes null, the else-if block handles it.
    };
  }, [user, socket]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};