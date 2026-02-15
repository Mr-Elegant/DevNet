import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useSocket } from "../utils/SocketContext"; // 👈 Import the global socket hook

const Chat = () => {
  const { targetUserId } = useParams();
  const socket = useSocket(); // 👈 Use the global socket instance

  const messagesContainerRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const processedMessagesRef = useRef(new Set()); // 👈 Track processed message IDs to prevent duplicates

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatId, setChatId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [isOnline, setIsOnline] = useState(false); // 👈 New State for Online Status

  const user = useSelector((store) => store.user);
  const userId = user?._id;

  const { state } = useLocation();
  const connections = useSelector((store) => store.connections);

  const targetUser =
    state?.user || connections?.find((c) => c._id === targetUserId);

  // 1. Fetch Chat History
  const fetchChat = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/chat/${targetUserId}`, {
        withCredentials: true,
      });

      const { chat, roomId } = res.data;

      setChatId(chat._id);
      setRoomId(roomId);

      const normalized = chat.messages.map((m) => ({
        _id: m._id.toString(),
        senderId: typeof m.senderId === "object" ? m.senderId._id : m.senderId,
        firstName: m.senderId?.firstName || "Unknown",
        lastName: m.senderId?.lastName || "",
        text: m.text,
        createdAt: m.createdAt,
        status: m.status,
      }));

      setMessages(normalized);

      //  track existing messages to prevent duplicates from socket events (Track existing IDs so we don't duplicate them)
      processedMessagesRef.current = new Set(normalized.map((m) => m._id.toString()));


    } catch (error) {
      console.error("Failed to fetch chat:", error);
    }
  };

  useEffect(() => {
    fetchChat();
  }, [targetUserId]);

  // 2. Handle Socket Events
  useEffect(() => {
    if (!socket || !roomId || !chatId) return;

    console.log("🔌 Attaching Chat Listeners to global socket");

    // -- EMIT JOIN EVENTS --
    socket.emit("joinChat", { roomId });
    socket.emit("markMessagesSeen", { chatId, roomId, userId });
    socket.emit("checkOnlineStatus", targetUserId); // 👈 Ask if they are online


    // -- DEFINE HANDLERS --
    
    // Handle incoming messages
    const handleMessageReceived = (msg) => {

      const msgIdStr = msg._id.toString();

      // 👈 ADD THIS BLOCKER: If we already rendered this ID, ignore it!
      if (processedMessagesRef.current.has(msgIdStr)) {
        console.log("Duplicate message received, ignoring:", msgIdStr);
        return;
      }
      processedMessagesRef.current.add(msgIdStr); // Mark this ID as processed

      const normalizedMsg = {
        _id: msg._id.toString(),
        senderId: msg.senderId,
        firstName: msg.firstName,
        lastName: msg.lastName,
        text: msg.text,
        createdAt: msg.createdAt,
        status: msg.status,
      };

      // Notes:   
          //    Filter by ID: msg.senderId === targetUserId checks if the incoming message is actually from the person currently on your screen.If it's from someone else, it won't be added to this chat's message list at all. This is crucial for preventing "ghost messages" from appearing in the wrong chat window.
          // Prevents Ghost Reads: If you are chatting with "Alice" and "Bob" sends a message, "Bob's" message will be ignored by this specific Chat component instance. It won't be marked as seen, and it won't weirdly appear in Alice's chat log.

      // 1. Only add message to UI if it belongs to THIS chat
      // (This prevents messages from User B appearing in User A's chat window)
      if (msg.senderId === targetUserId || msg.senderId === userId) {
        setMessages((prev) => [...prev, normalizedMsg]);
        
        // 2. Only mark as seen if it comes from the user we are CURRENTLY looking at
        if (msg.senderId === targetUserId) {
          socket.emit("messageSeen", {
            chatId,
            roomId,
            messageId: msgIdStr,
          });
          setUnreadCount((count) => (isAtBottomRef.current ? 0 : count + 1));
        }
      }
    };

    // Handle Ticks (Sent -> Delivered -> Seen)
    const handleUpdateMessageStatus = ({ messageId, status }) => {
      setMessages((prev) => 
        prev.map((msg) => {
          if (msg._id === messageId.toString()) {
            return { ...msg, status }; // Update status immutably
          }
          return msg;
        })
      );
    };

    // Handle Typing
    const handleTyping = ({ firstName }) => {
      setIsTyping(true);
      setTypingUser(firstName);
    };

    const handleStopTyping = () => {
      setIsTyping(false);
      setTypingUser("");
    };

    // Handle Online Status
    const handleOnlineStatus = ({ userId: id, isOnline: status }) => {
      if (id === targetUserId) setIsOnline(status);
    };

    const handleUserOnline = (id) => {
      if (id === targetUserId) setIsOnline(true);
    };

    const handleUserOffline = (id) => {
      if (id === targetUserId) setIsOnline(false);
    };

    // -- ATTACH LISTENERS --
    socket.on("messageReceived", handleMessageReceived);
    socket.on("updateMessageStatus", handleUpdateMessageStatus);
    socket.on("userTyping", handleTyping);
    socket.on("userStopTyping", handleStopTyping);
    socket.on("onlineStatus", handleOnlineStatus);
    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);

    // -- CLEANUP --
    return () => {
      // ⚠️ IMPORTANT: Remove listeners but DO NOT disconnect the socket
      socket.off("messageReceived", handleMessageReceived);
      socket.off("updateMessageStatus", handleUpdateMessageStatus);
      socket.off("userTyping", handleTyping);
      socket.off("userStopTyping", handleStopTyping);
      socket.off("onlineStatus", handleOnlineStatus);
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);
    };
  }, [socket, roomId, chatId, userId, targetUserId]);

  // 3. Scroll & UI Logic
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const atBottom = scrollHeight - scrollTop - clientHeight < 100;

      setIsAtBottom(atBottom);
      isAtBottomRef.current = atBottom;

      if (atBottom) setUnreadCount(0);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    socket.emit("sendMessage", {
      chatId,
      roomId,
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      text: newMessage,
    });

    socket.emit("stopTyping", { roomId });
    setNewMessage("");
  };

  const handleTypingInput = (e) => {
    setNewMessage(e.target.value);

    if (socket) {
      socket.emit("typing", { roomId, firstName: user.firstName });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", { roomId });
      }, 1500);
    }
  };

  const formatDateLabel = (date) => {
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    return d.toLocaleDateString();
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="card bg-base-200 shadow-xl border border-primary/20 max-w-4xl mx-auto h-[75vh] flex flex-col">
        {/* Chat Header */}
        <div className="p-3 border-b border-base-300">
          <div className="flex items-center gap-3">
            {targetUser?.photoUrl && (
              // 👇 Dynamic "online" class from daisyUI
              <div className={`avatar ${isOnline ? 'online' : ''}`}>
                <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1">
                  <img src={targetUser.photoUrl} alt={targetUser.firstName} />
                </div>
              </div>
            )}
            <div>
              <h2 className="text-base font-semibold leading-tight">
                {targetUser
                  ? `${targetUser.firstName} ${targetUser.lastName || ""}`
                  : "Chat"}
              </h2>
              {/* 👇 Text Indicator */}
              <div className="text-xs mt-0.5">
                {isOnline ? (
                  <span className="text-success font-medium">Online</span>
                ) : (
                  <span className="opacity-60">Offline</span>
                )}
              </div>
            </div>
            
            {/* Socket Status Indicator */}
            <div className="ml-auto">
               <div className={`badge badge-xs ${socket?.connected ? 'badge-success' : 'badge-error'}`}>
                 {socket?.connected ? '●' : '○'}
               </div>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.map((msg, index) => {
            const showDate =
              index === 0 ||
              formatDateLabel(msg.createdAt) !==
                formatDateLabel(messages[index - 1].createdAt);

            return (
              <div key={`${msg._id}-${msg.status}`}>
                {showDate && (
                  <div className="divider text-xs opacity-60">
                    {formatDateLabel(msg.createdAt)}
                  </div>
                )}

                <div className={`chat ${msg.senderId === userId ? "chat-end" : "chat-start"}`}>
                  <div className="chat-header text-xs opacity-60 mb-1">
                    {msg.firstName}
                    <time className="ml-2">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>

                  <div
                    className={`chat-bubble ${
                      msg.senderId === userId
                        ? "chat-bubble-primary"
                        : "chat-bubble-secondary"
                    }`}
                  >
                    {msg.text}
                  </div>

                  {msg.senderId === userId && (
                    <div className="chat-footer opacity-50 text-xs mt-1">
                      {msg.status === "sent" && "✓"}
                      {msg.status === "delivered" && "✓✓"}
                      {msg.status === "seen" && (
                        <span className="text-primary font-bold">✓✓ Read</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Scroll Button */}
        {!isAtBottom && (
          <button
            onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="btn btn-circle btn-primary absolute bottom-20 right-8 shadow-lg z-10"
          >
            ↓
            {unreadCount > 0 && (
              <div className="badge badge-error badge-sm absolute -top-2 -right-2">
                {unreadCount}
              </div>
            )}
          </button>
        )}

        {/* Input Area */}
        <div className="p-3 border-t border-base-300">
          {isTyping && (
            <div className="text-xs italic opacity-70 mb-1.5 ml-2">
              {typingUser} is typing...
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={handleTypingInput}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="input input-bordered input-sm flex-1"
              placeholder="Type a message..."
              disabled={!socket}
            />
            <button
              onClick={sendMessage}
              className="btn btn-primary btn-sm"
              disabled={!socket || !newMessage.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;