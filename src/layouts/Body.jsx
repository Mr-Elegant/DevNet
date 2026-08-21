import axios from "axios"
import { useDispatch, useSelector } from 'react-redux'
import { BASE_URL } from '../utils/constants'
import Footer from '../components/Footer'
import NavBar from '../components/NavBar'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {addUser} from "../store/userSlice"
import { addNotification } from "../store/notificationSlice"
import { useEffect } from 'react'
import { useSocket } from "../context/SocketContext"
import BottomNav from "../components/BottomNav"
import { AnimatePresence, motion } from "framer-motion"

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const userData = useSelector((store) => store.user);
  const socket = useSocket();    // 👈 GET SOCKET INSTANCE

  const fetchUser = async () => {
    if (userData) return;
    try {
      const res = await axios.get(BASE_URL + "/profile/view", { withCredentials: true });
      dispatch(addUser(res.data));
    } catch (error) {
      navigate("/login");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);


 // ✅ GLOBAL MESSAGE LISTENER and Requests LISTENER
  useEffect(() => {
    if (!socket || !userData) return;

    // 🧹 1. BULLETPROOF FIX: Aggressively remove any ghost listeners first!
    socket.off("messageReceived");
    socket.off("connectionRequestReceived");

    // 2. Define your handlers
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

        // Check if we are NOT currently in that chat room
        const currentPath = window.location.pathname;
        if(!currentPath.includes(`/chat/${msg.senderId}`)) {
          // Dispatch a notification to the redux store
          dispatch(addNotification({
            senderId: msg.senderId,
            text: msg.image ? "🖼️ Sent you an image" : msg.text,  // Handle image attachments gracefully
            type: "message",
            firstName: msg.firstName,
            lastName: msg.lastName,            
          }));
        }

      }
    };

    //   2. 👈 NEW: Friend Request Listener
    const handleIncomingRequest = (data) => {
        console.log("Global Listener: Caught new connection request!");
        dispatch(addNotification({
          type: "request",    // Matches the type in your Navbar!
          senderId: data.senderId,
          firstName: data.firstName,
          text: data.text,
        }))
    }

    // Attach listeners 
    socket.on("messageReceived", handleIncomingMessage);
    socket.on("connectionRequestReceived", handleIncomingRequest);

    // Cleanup
    return () => {
      socket.off("messageReceived");
      socket.off("connectionRequestReceived");
    };
  }, [socket, userData, dispatch]);   // Re-run if socket or user changes



  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      
      <main className="flex-1 container mx-auto px-4 py-6 relative">
        <Outlet />
      </main>

      <Footer />

      <BottomNav  />
    </div>
  );
};

export default Body