import axios from "axios"
import { useDispatch, useSelector } from 'react-redux'
import { BASE_URL } from '../utils/constants'
import Footer from './Footer'
import NavBar from './NavBar'
import { Outlet, useNavigate } from 'react-router-dom'
import {addUser} from "../utils/userSlice.js"
import { useEffect } from 'react'
import { useSocket } from "../utils/SocketContext.jsx"

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((store) => store.user);
  const socket = useSocket();    // 👈 GET SOCKET INSTANCE

  const fetchUser = async () => {
    if (userData) return;
    try {
      const res = await axios.get(BASE_URL + "/profile/view", { withCredentials: true });
      dispatch(addUser(res.data));
    } catch (error) {
      if (error.response?.status === 401) navigate("/login");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);


 // ✅ GLOBAL MESSAGE LISTENER
  useEffect(() => {
    if (!socket || !userData) return;

    const handleIncomingMessage = (msg) => {
      // If the message is NOT from me (it's incoming)
      if (msg.senderId !== userData._id) {
        console.log("Global Listener: Caught message, marking delivered.");
        
        // Emit 'Delivered' event immediately
        socket.emit("markMessageDelivered", {
          chatId: msg.chatId,
          messageId: msg._id,
          roomId: msg.roomId,
        });
      }
    };

    socket.on("messageReceived", handleIncomingMessage);

    return () => {
      socket.off("messageReceived", handleIncomingMessage);
    };
  }, [socket, userData]);  // Re-run if socket or user changes



  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Body