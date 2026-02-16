import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useSocket } from "../utils/SocketContext";
import EmojiPicker from "emoji-picker-react"; // 👈 New Import

const Chat = () => {
  const { targetUserId } = useParams();
  const socket = useSocket();

  const messagesContainerRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const processedMessagesRef = useRef(new Set());

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatId, setChatId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [isOnline, setIsOnline] = useState(false);

  // 👈 New States for Emojis & Uploads
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const user = useSelector((store) => store.user);
  const theme = useSelector((store) => store.theme); // Get current theme for emoji picker
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
        image: m.image, // 👈 Added image field
        createdAt: m.createdAt,
        status: m.status,
      }));

      setMessages(normalized);
      processedMessagesRef.current = new Set(
        normalized.map((m) => m._id.toString()),
      );
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

    socket.emit("joinChat", { roomId });
    socket.emit("markMessagesSeen", { chatId, roomId, userId });
    socket.emit("checkOnlineStatus", targetUserId);

    const handleMessageReceived = (msg) => {
      const msgIdStr = msg._id.toString();

      // Prevent duplicate rendering
      if (processedMessagesRef.current.has(msgIdStr)) return;
      processedMessagesRef.current.add(msgIdStr);

      const normalizedMsg = {
        _id: msgIdStr,
        senderId: msg.senderId,
        firstName: msg.firstName,
        lastName: msg.lastName,
        text: msg.text,
        image: msg.image, // 👈 Capture incoming image
        createdAt: msg.createdAt,
        status: msg.status,
      };

      if (msg.senderId === targetUserId || msg.senderId === userId) {
        setMessages((prev) => [...prev, normalizedMsg]);

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

    const handleUpdateMessageStatus = ({ messageId, status }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg._id === messageId.toString()) {
            return { ...msg, status };
          }
          return msg;
        }),
      );
    };

    const handleTyping = ({ firstName }) => {
      setIsTyping(true);
      setTypingUser(firstName);
    };

    const handleStopTyping = () => {
      setIsTyping(false);
      setTypingUser("");
    };

    const handleOnlineStatus = ({ userId: id, isOnline: status }) => {
      if (id === targetUserId) setIsOnline(status);
    };

    const handleUserOnline = (id) => {
      if (id === targetUserId) setIsOnline(true);
    };

    const handleUserOffline = (id) => {
      if (id === targetUserId) setIsOnline(false);
    };

    socket.on("messageReceived", handleMessageReceived);
    socket.on("updateMessageStatus", handleUpdateMessageStatus);
    socket.on("userTyping", handleTyping);
    socket.on("userStopTyping", handleStopTyping);
    socket.on("onlineStatus", handleOnlineStatus);
    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);

    return () => {
      socket.off("messageReceived", handleMessageReceived);
      socket.off("updateMessageStatus", handleUpdateMessageStatus);
      socket.off("userTyping", handleTyping);
      socket.off("userStopTyping", handleStopTyping);
      socket.off("onlineStatus", handleOnlineStatus);
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);
    };
  }, [socket, roomId, chatId, userId, targetUserId]);

  // 3. Scroll Logic
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

  // 4. Send Message (Text)
  const sendMessage = () => {
    if ((!newMessage.trim() && !isUploading) || !socket) return;

    socket.emit("sendMessage", {
      chatId,
      roomId,
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      text: newMessage,
      imageUrl: null, // No image in a standard text message
    });

    socket.emit("stopTyping", { roomId });
    setNewMessage("");
    setShowEmojiPicker(false); // Close emoji picker on send
  };

  // 5. Handle Image Upload (Secure via backend)
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post(`${BASE_URL}/uploadImage`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imageUrl = res.data.imageUrl;

      // Instantly send message with the returned image URL
      socket.emit("sendMessage", {
        chatId,
        roomId,
        userId,
        firstName: user.firstName,
        lastName: user.lastName,
        text: newMessage, // Send along any text they had typed
        imageUrl: imageUrl,
      });

      setNewMessage("");
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setIsUploading(false);
    }
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
              <div className={`avatar ${isOnline ? "online" : ""}`}>
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
              <div className="text-xs mt-0.5">
                {isOnline ? (
                  <span className="text-success font-medium">Online</span>
                ) : (
                  <span className="opacity-60">Offline</span>
                )}
              </div>
            </div>

            <div className="ml-auto">
              <div
                className={`badge badge-xs ${
                  socket?.connected ? "badge-success" : "badge-error"
                }`}
              >
                {socket?.connected ? "●" : "○"}
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

                <div
                  className={`chat ${
                    msg.senderId === userId ? "chat-end" : "chat-start"
                  }`}
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
                    {/* 👈 Render Image if it exists */}
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="attachment"
                        className="max-w-xs rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(msg.image, "_blank")}
                      />
                    )}
                    {/* Render Text if it exists */}
                    {msg.text && <p>{msg.text}</p>}
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
            onClick={() =>
              bottomRef.current?.scrollIntoView({ behavior: "smooth" })
            }
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
        <div className="p-3 border-t border-base-300 relative">
          {/* 👈 Emoji Picker Popup */}
          {showEmojiPicker && (
            <div className="absolute bottom-16 left-4 z-50 shadow-2xl">
              <EmojiPicker
                onEmojiClick={(emojiData) =>
                  setNewMessage((prev) => prev + emojiData.emoji)
                }
                theme={
                  theme === "dark" || theme === "dracula" ? "dark" : "light"
                }
              />
            </div>
          )}

          {isTyping && (
            <div className="text-xs italic opacity-70 mb-1.5 ml-2">
              {typingUser} is typing...
            </div>
          )}

          <div className="flex gap-2 items-center">
            {/* 👈 Emoji Toggle Button */}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="btn btn-circle btn-ghost btn-sm text-xl"
            >
              😀
            </button>

            {/* 👈 Image Upload Button */}
            <input
              type="file"
              id="imageUpload"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
            <label
              htmlFor="imageUpload"
              className={`btn btn-circle btn-ghost btn-sm ${
                isUploading ? "loading" : ""
              }`}
            >
              {!isUploading && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
                  />
                </svg>
              )}
            </label>

            <input
              type="text"
              value={newMessage}
              onChange={handleTypingInput}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="input input-bordered input-sm flex-1"
              placeholder="Type a message..."
              disabled={!socket || isUploading}
            />

            <button
              onClick={sendMessage}
              className="btn btn-primary btn-sm"
              disabled={!socket || (!newMessage.trim() && !isUploading)}
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
