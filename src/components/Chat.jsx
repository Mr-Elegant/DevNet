import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { CreateSocketConnection } from "../utils/socket";

const Chat = () => {
  const { targetUserId } = useParams();

  const socketRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isAtBottomRef = useRef(true);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatId, setChatId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [isSocketReady, setIsSocketReady] = useState(false);

  const user = useSelector((store) => store.user);
  const userId = user?._id;

  const { state } = useLocation();
  const connections = useSelector((store) => store.connections);

  const targetUser =
    state?.user || connections?.find((c) => c._id === targetUserId);

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
      console.log("Chat fetched, messages:", normalized);
    } catch (error) {
      console.error("Failed to fetch chat:", error);
    }
  };

  useEffect(() => {
    fetchChat();
  }, [targetUserId]);

  // Socket setup
  useEffect(() => {
    if (!roomId || !chatId) return;

    console.log("🔌 Setting up socket connection...");
    socketRef.current = CreateSocketConnection();

    socketRef.current.on("connect", () => {
      console.log("✅ Socket connected:", socketRef.current.id);
      setIsSocketReady(true);

      socketRef.current.emit("joinChat", { roomId });
      console.log("🏠 Joined room:", roomId);

      socketRef.current.emit("messagesDelivered", {
        chatId,
        roomId,
        userId,
      });
      console.log("📨 Emitted messagesDelivered");
    });

    socketRef.current.on("messageReceived", (msg) => {
      console.log("📩 Message received:", msg);
      
      const normalizedMsg = {
        _id: msg._id.toString(),
        senderId: msg.senderId,
        firstName: msg.firstName,
        lastName: msg.lastName,
        text: msg.text,
        createdAt: msg.createdAt,
        status: msg.status,
      };
      
      setMessages((prev) => [...prev, normalizedMsg]);

      if (msg.senderId !== userId) {
        socketRef.current.emit("messageSeen", {
          chatId,
          roomId,
          messageId: msg._id.toString(),
        });

        setUnreadCount((count) => (isAtBottomRef.current ? 0 : count + 1));
      }
    });

    // ✅ FIXED: Update message status handler
    socketRef.current.on("updateMessageStatus", ({ messageId, status }) => {
      console.log(`📩 Received updateMessageStatus: ${messageId} -> ${status}`);
      
      const msgIdStr = messageId.toString();
      
      setMessages((prevMessages) => {
        console.log("📋 Before:", prevMessages.map(m => ({ id: m._id.slice(-6), status: m.status })));
        
        // Create completely new objects to force React re-render
        const updatedMessages = prevMessages.map((msg) => {
          if (msg._id === msgIdStr) {
            console.log(`✅ MATCH! ${msg._id.slice(-6)}: "${msg.status}" -> "${status}"`);
            return {
              _id: msg._id,
              senderId: msg.senderId,
              firstName: msg.firstName,
              lastName: msg.lastName,
              text: msg.text,
              createdAt: msg.createdAt,
              status: status, // New status
            };
          }
          return { ...msg };
        });
        
        console.log("📋 After:", updatedMessages.map(m => ({ id: m._id.slice(-6), status: m.status })));
        return updatedMessages;
      });
    });

    socketRef.current.on("userTyping", ({ firstName }) => {
      setIsTyping(true);
      setTypingUser(firstName);
    });

    socketRef.current.on("userStopTyping", () => {
      setIsTyping(false);
      setTypingUser("");
    });

    socketRef.current.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setIsSocketReady(false);
    });

    return () => {
      if (socketRef.current) {
        console.log("🧹 Cleaning up socket connection");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId, chatId, userId]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const threshold = 100;

      const atBottom = scrollHeight - scrollTop - clientHeight < threshold;

      setIsAtBottom(atBottom);
      isAtBottomRef.current = atBottom;

      if (atBottom) setUnreadCount(0);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isAtBottom) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAtBottom]);

  const sendMessage = () => {
    if (!newMessage.trim() || !socketRef.current || !isSocketReady) {
      console.log("❌ Cannot send - socket not ready or message empty");
      return;
    }

    console.log("📤 Sending message:", newMessage);

    socketRef.current.emit("sendMessage", {
      chatId,
      roomId,
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      text: newMessage,
    });

    socketRef.current.emit("stopTyping", { roomId });
    setNewMessage("");
  };

  const formatDateLabel = (date) => {
    const d = new Date(date);
    const today = new Date();
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const msgOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const yesterday = new Date(todayOnly);
    yesterday.setDate(todayOnly.getDate() - 1);

    if (msgOnly.getTime() === todayOnly.getTime()) return "Today";
    if (msgOnly.getTime() === yesterday.getTime()) return "Yesterday";

    return d.toLocaleDateString();
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setUnreadCount(0);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="card bg-base-200 shadow-xl border border-primary/20 max-w-4xl mx-auto h-[75vh] flex flex-col">
        {/* Chat Header */}
        <div className="p-3 border-b border-base-300">
          <div className="flex items-center gap-3">
            {targetUser?.photoUrl && (
              <div className="avatar">
                <div className="w-9 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1">
                  <img src={targetUser.photoUrl} alt={targetUser.firstName} />
                </div>
              </div>
            )}
            <h2 className="text-base font-semibold">
              {targetUser
                ? `${targetUser.firstName} ${targetUser.lastName || ""}`
                : "Chat"}
            </h2>
            <div className={`badge badge-xs ${isSocketReady ? 'badge-success' : 'badge-error'}`}>
              {isSocketReady ? '●' : '○'}
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
      <div 
        key={`${msg._id}-${msg.status}`}  // ✅ CRITICAL FIX: Include status in key
      >
        {showDate && (
          <div className="divider text-xs opacity-60">
            {formatDateLabel(msg.createdAt)}
          </div>
        )}

        <div
          className={
            "chat " +
            (msg.senderId === userId ? "chat-end" : "chat-start")
          }
        >
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
                <span className="text-primary">✓✓ Read</span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  })}
  <div ref={bottomRef} />
</div>

        {/* Scroll to Bottom Button */}
        {!isAtBottom && (
          <button
            onClick={scrollToBottom}
            className="btn btn-circle btn-primary absolute bottom-20 right-8 shadow-lg"
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
            <div className="text-xs italic opacity-70 mb-1.5">
              {typingUser} is typing...
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);

                if (socketRef.current && isSocketReady) {
                  socketRef.current.emit("typing", {
                    roomId,
                    firstName: user.firstName,
                  });

                  if (typingTimeoutRef.current)
                    clearTimeout(typingTimeoutRef.current);

                  typingTimeoutRef.current = setTimeout(() => {
                    socketRef.current.emit("stopTyping", { roomId });
                  }, 1500);
                }
              }}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="input input-bordered input-sm flex-1"
              placeholder="Type a message..."
              disabled={!isSocketReady}
            />

            <button 
              onClick={sendMessage} 
              className="btn btn-primary btn-sm"
              disabled={!isSocketReady || !newMessage.trim()}
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

// ## 🧪 **What to Look For Now**

// After this fix, in the console you should see:

// **Sender's console:**
// ```
// 📩 Received updateMessageStatus: 698b01040... -> delivered
// 📋 Before: [{ id: '040...', status: 'sent' }]
// ✅ MATCH! 040...: "sent" -> "delivered"
// 📋 After: [{ id: '040...', status: 'delivered' }]