// =========================
// React hooks
// =========================
import { useState, useEffect, useRef } from "react";

// Redux
import { useSelector } from "react-redux";

// Router
import { useParams, useLocation } from "react-router-dom";

// HTTP
import axios from "axios";

// Constants
import { BASE_URL } from "../utils/constants";

// Socket helper
import { CreateSocketConnection } from "../utils/socket";

const Chat = () => {
  // =====================================================
  // 1️⃣ ROUTE PARAM
  // =====================================================
  // URL: /chat/:targetUserId
  const { targetUserId } = useParams();

  // =====================================================
  // 2️⃣ REFS (NO RE-RENDER)
  // =====================================================
  const socketRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // 🔥 Prevent stale scroll state inside socket callbacks
  const isAtBottomRef = useRef(true);

  // =====================================================
  // 3️⃣ STATE
  // =====================================================
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const [chatId, setChatId] = useState(null);
  const [roomId, setRoomId] = useState(null);

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Typing indicator
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");

  // =====================================================
  // 4️⃣ USER (REDUX)
  // =====================================================
  const user = useSelector((store) => store.user);
  const userId = user?._id;

  // =====================================================
  // 5️⃣ CHAT HEADER USER (✅ RESTORED)
  // =====================================================
  // ⚠️ This is what was missing earlier
  const { state } = useLocation();
  const connections = useSelector((store) => store.connections);

  // Priority:
  // 1. Router state
  // 2. Redux connections
  const targetUser =
    state?.user || connections?.find((c) => c._id === targetUserId);

  // =====================================================
  // 6️⃣ FETCH CHAT (REST)
  // =====================================================
  const fetchChat = async () => {
    const res = await axios.get(`${BASE_URL}/chat/${targetUserId}`, {
      withCredentials: true,
    });

    const { chat, roomId } = res.data;

    setChatId(chat._id);
    setRoomId(roomId);

    // Normalize messages
    const normalized = chat.messages.map((m) => ({
      _id: m._id,
      senderId:
        typeof m.senderId === "object" ? m.senderId._id : m.senderId,
      firstName: m.senderId.firstName,
      lastName: m.senderId.lastName,
      text: m.text,
      createdAt: m.createdAt,
      status: m.status,
    }));

    setMessages(normalized);
  };

  useEffect(() => {
    fetchChat();
  }, [targetUserId]);

  // =====================================================
  // 7️⃣ SOCKET SETUP
  // =====================================================
  useEffect(() => {
    if (!roomId || !chatId) return;

    socketRef.current = CreateSocketConnection();

    // Join crypto-based private room
    socketRef.current.emit("joinChat", { roomId });

    // Receive messages
    socketRef.current.on("messageReceived", (msg) => {
      setMessages((prev) => [...prev, msg]);

      // Mark seen for incoming messages
      if (msg.senderId !== userId) {
        socketRef.current.emit("messageSeen", {
          chatId,
          roomId,
          messageId: msg._id,
        });

        setUnreadCount((count) =>
          isAtBottomRef.current ? 0 : count + 1
        );
      }
    });

    // Update message status (sent → delivered → seen)
    socketRef.current.on("updateMessageStatus", ({ messageId, status }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, status } : m
        )
      );
    });

    // Typing indicator
    socketRef.current.on("userTyping", ({ firstName }) => {
      setIsTyping(true);
      setTypingUser(firstName);
    });

    socketRef.current.on("userStopTyping", () => {
      setIsTyping(false);
      setTypingUser("");
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [roomId, chatId]);

  // =====================================================
  // 8️⃣ SCROLL DETECTION
  // =====================================================
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const threshold = 100;

      const atBottom =
        scrollHeight - scrollTop - clientHeight < threshold;

      setIsAtBottom(atBottom);
      isAtBottomRef.current = atBottom;

      if (atBottom) setUnreadCount(0);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // =====================================================
  // 9️⃣ AUTO SCROLL
  // =====================================================
  useEffect(() => {
    if (!isAtBottom) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAtBottom]);

  // =====================================================
  // 🔟 SEND MESSAGE
  // =====================================================
  const sendMessage = () => {
    if (!newMessage.trim() || !socketRef.current) return;

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

  // =====================================================
  // 1️⃣1️⃣ DATE LABEL
  // =====================================================
  const formatDateLabel = (date) => {
    const d = new Date(date);
    const today = new Date();
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const msgOnly = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate()
    );

    const yesterday = new Date(todayOnly);
    yesterday.setDate(todayOnly.getDate() - 1);

    if (msgOnly.getTime() === todayOnly.getTime()) return "Today";
    if (msgOnly.getTime() === yesterday.getTime()) return "Yesterday";

    return d.toLocaleDateString();
  };

  // =====================================================
  // 1️⃣2️⃣ SCROLL BUTTON
  // =====================================================
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setUnreadCount(0);
  };

  // =====================================================
  // 1️⃣3️⃣ UI (HEADER ✅ RESTORED)
  // =====================================================
  return (
    <div className="relative w-1/2 mx-auto border border-gray-600 m-5 h-[70vh] flex flex-col">

      {/* 🧾 CHAT HEADER (FIXED / RESTORED) */}
      <h1 className="p-5 border-b border-gray-600">
        {targetUser
          ? `${targetUser.firstName} ${targetUser.lastName || ""}`
          : "Chat"}
      </h1>

      {/* 💬 MESSAGES */}
      <div ref={messagesContainerRef} className="flex-1 overflow-scroll p-5">
        {messages.map((msg, index) => {
          const showDate =
            index === 0 ||
            formatDateLabel(msg.createdAt) !==
              formatDateLabel(messages[index - 1].createdAt);

          return (
            <div key={msg._id}>
              {showDate && (
                <div className="text-center my-4 text-xs opacity-60">
                  {formatDateLabel(msg.createdAt)}
                </div>
              )}

              <div
                className={
                  "chat " +
                  (msg.senderId === userId
                    ? "chat-end"
                    : "chat-start")
                }
              >
                <div className="chat-header">
                  {msg.firstName}
                  <time className="text-xs opacity-50 px-2">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </time>
                </div>

                <div className="chat-bubble">{msg.text}</div>

                {/* ✔✔ STATUS */}
                {msg.senderId === userId && (
                  <div className="text-xs text-right">
                    {msg.status === "sent" && "✔"}
                    {msg.status === "delivered" && "✔✔"}
                    {msg.status === "seen" && (
                      <span className="text-blue-400">✔✔</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* 🔽 SCROLL BUTTON */}
      {!isAtBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-6 bg-pink-500 text-white w-12 h-12 rounded-full shadow-lg"
        >
          ↓
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 w-5 h-5 rounded-full text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* ✏ INPUT */}
      <div className="p-5 border-t border-gray-600">
        {isTyping && (
          <div className="text-sm italic opacity-70">
            {typingUser} is typing...
          </div>
        )}

        <div className="flex gap-2">
          <input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);

              socketRef.current.emit("typing", {
                roomId,
                firstName: user.firstName,
              });

              if (typingTimeoutRef.current)
                clearTimeout(typingTimeoutRef.current);

              typingTimeoutRef.current = setTimeout(() => {
                socketRef.current.emit("stopTyping", { roomId });
              }, 1500);
            }}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 border border-gray-500 text-white rounded p-2"
            placeholder="Type a message..."
          />

          <button onClick={sendMessage} className="btn btn-secondary">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
