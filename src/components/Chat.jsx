import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useSocket } from "../utils/SocketContext";
import EmojiPicker from "emoji-picker-react"; // 👈 New Import
import {
  Send,
  Image as ImageIcon,
  Smile,
  Trash2,
  PenTool,
  ChevronDown,
  ArrowLeft,
  FileText, // ✨ Import FileText icon
} from "lucide-react";

const Chat = () => {
  const { targetUserId } = useParams();
  const socket = useSocket();
  const navigate = useNavigate();

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

  const handleWhiteboardInvite = () => {
    if (socket && roomId && targetUserId && user) {
      socket.emit("whiteboard-invite", {
        targetUserId: targetUserId,
        roomId: roomId,
        senderInfo: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
      // Navigate the inviter to the whiteboard immediately
      navigate(`/whiteboard/${roomId}`);
    }
  };

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
        fileUrl: m.fileUrl, // 👈 Corrected from 'file' to 'fileUrl'
        fileName: m.fileName, // 👈 Added file name for display
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
        fileUrl: msg.fileUrl,    
        fileName: msg.fileName,
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

    // 👈 NEW: Listener for when a message is deleted
    const handleMessageDeleted = ({ messageId }) => {
      // Filter out the deleted message from our local React state
      // This causes it to instantly vanish from the screen without refreshing!
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId.toString()));
    };



    socket.on("messageReceived", handleMessageReceived);
    socket.on("updateMessageStatus", handleUpdateMessageStatus);
    socket.on("userTyping", handleTyping);
    socket.on("userStopTyping", handleStopTyping);
    socket.on("onlineStatus", handleOnlineStatus);
    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);
    socket.on("messageDeleted", handleMessageDeleted); // 👈 Listen for message deletions

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
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);    // 👈 Matches backend upload.single("file")

    try {
      const res = await axios.post(`${BASE_URL}/uploadFile`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const {fileUrl, fileName, resourceType} = res.data;

      // Determine if it's an image or a generic file
      const isImage = resourceType === "image";

      // Instantly send message with the returned image URL
      socket.emit("sendMessage", {
        chatId,
        roomId,
        userId,
        firstName: user.firstName,
        lastName: user.lastName,
        text: newMessage, // Send along any text they had typed
        imageUrl: isImage ? fileUrl : null, // If image , use image UI
        fileUrl: !isImage ? fileUrl : null, // If not image, use file UI
        fileName: !isImage ? fileName : null, // Send file name for display
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


// ==========================================
  // DELETE MESSAGE HANDLER
  // ==========================================
  const handleDeleteMessage = (messageId) => {
    // Add a quick confirmation dialog so they don't accidentally delete things!
    const confirmDelete = window.confirm("Are you sure you want to delete this message for everyone?");
    
    if (confirmDelete && socket) {
      // Tell the server to delete it
      socket.emit("deleteMessage", {
        chatId,
        messageId,
        roomId,
        userId, // Send our ID so the server can verify we own this message
      });
    }
  };


  return (
    <div className="container mx-auto p-2 sm:p-4 h-[calc(100vh-4.5rem)] max-w-5xl">
      <div className="bg-base-200/50 backdrop-blur-md shadow-2xl rounded-3xl border border-primary/10 h-full flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-3 sm:p-4 bg-base-200/90 backdrop-blur-md border-b border-base-300 flex items-center justify-between z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="btn btn-ghost btn-circle btn-sm md:hidden">
              <ArrowLeft size={20} />
            </button>
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
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
              {/* ✨ NEW: Collaborative Whiteboard Button */}
              {roomId && (
                <button
                  onClick={handleWhiteboardInvite}
                  className="btn btn-sm btn-outline btn-primary tooltip tooltip-bottom rounded-full px-3 sm:px-4"
                  data-tip="Start Collaborative Whiteboard"
                >
                  <PenTool size={16} className="sm:mr-1" />
                  <span className="hidden sm:inline">Whiteboard</span>
                </button>
              )}

              <div
                className={`badge badge-xs ${
                  socket?.connected ? "badge-success" : "badge-error"
                }`}
              >
                {socket?.connected ? "●" : "○"}
              </div>
        </div>
        </div>

        {/* Messages Container */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 scroll-smooth bg-base-100/30"
        >
          {messages.map((msg, index) => {
            const showDate =
              index === 0 ||
              formatDateLabel(msg.createdAt) !==
                formatDateLabel(messages[index - 1].createdAt);

            return (
              <div key={`${msg._id}-${msg.status}`}>
                {showDate && (
                  <div className="flex justify-center my-3">
                    <span className="text-xs bg-base-300/80 text-base-content/70 px-4 py-1 rounded-full font-medium shadow-sm backdrop-blur-sm">
                      {formatDateLabel(msg.createdAt)}
                    </span>
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
                    className={`chat-bubble shadow-sm ${
                      msg.senderId === userId
                        ? "chat-bubble-primary"
                        : "bg-base-100 text-base-content border border-base-300"
                    }`}
                  >
                    {/* Render Image */}
                    {msg.image && (
                      <img src={msg.image} alt="attachment" className="max-w-xs rounded-lg mb-2 cursor-pointer hover:opacity-90" onClick={() => window.open(msg.image, "_blank")} />
                    )}

                    {/* 👈 NEW: Render Generic File (PDF, ZIP, etc) */}
                    {msg.fileUrl && (
                      <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-base-100/20 p-3 rounded-lg hover:bg-base-100/40 transition mb-2">
                        <FileText size={28} className="text-base-content/70 shrink-0" />
                        <span className="text-sm font-medium underline truncate max-w-[200px]">{msg.fileName || "Download File"}</span>
                      </a>
                    )}

                    {/* Render Text */}
                    {msg.text && <p>{msg.text}</p>}
                  </div>

                  {/* Message Footer (Ticks & Delete Button) */}
                  {msg.senderId === userId && (
                    <div className="chat-footer opacity-70 text-[10px] mt-1 flex gap-2 items-center">
                      
                      {/* The Read Receipt Ticks */}
                      <span className="tracking-tighter">
                        {msg.status === "sent" && "✓"}
                        {msg.status === "delivered" && "✓✓"}
                        {msg.status === "seen" && (
                          <span className="text-info font-bold">✓✓</span>
                        )}
                      </span>

                      {/* 👈 NEW: The Delete Button */}
                      <button 
                        onClick={() => handleDeleteMessage(msg._id)}
                        className="hover:text-error transition-colors duration-200 cursor-pointer"
                        title="Delete for everyone"
                      >
                        <Trash2 size={12} />
                      </button>

                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {isTyping && (
            <div className="chat chat-start animate-pulse mb-4">
              <div className="chat-header text-xs opacity-60 mb-1">{typingUser}</div>
              <div className="chat-bubble chat-bubble-sm bg-base-300 text-base-content/70 flex items-center gap-1 h-8">
                <span className="w-1.5 h-1.5 bg-base-content/50 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-base-content/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-1.5 h-1.5 bg-base-content/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Scroll Button */}
        {!isAtBottom && (
          <button
            onClick={() =>
              bottomRef.current?.scrollIntoView({ behavior: "smooth" })
            }
            className="btn btn-circle btn-primary btn-sm absolute bottom-24 right-8 shadow-lg z-10"
          >
            <ChevronDown size={18} />
            {unreadCount > 0 && (
              <div className="badge badge-error badge-xs absolute -top-1 -right-1">
                {unreadCount}
              </div>
            )}
          </button>
        )}

        {/* Input Area */}
        <div className="p-3 sm:p-4 bg-base-200/90 backdrop-blur-md border-t border-base-300 shrink-0 relative">
          {/* 👈 Emoji Picker Popup */}
          {showEmojiPicker && (
            <div className="absolute bottom-20 left-4 z-50 shadow-2xl rounded-xl overflow-hidden border border-base-300">
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

          <div className="flex items-end gap-2 bg-base-100 p-1.5 sm:p-2 rounded-3xl shadow-sm border border-base-300 relative focus-within:ring-2 focus-within:ring-primary/50 transition-shadow">
            {/* 👈 Emoji Toggle Button */}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="btn btn-circle btn-ghost btn-sm text-base-content/70 hover:text-primary shrink-0"
            >
              <Smile size={20} />
            </button>

            {/* 👈 Image Upload Button */}
            <input
              type="file"
              id="imageUpload"
              className="hidden"
              onChange={handleFileUpload}
            />
            <label
              htmlFor="imageUpload"
              className={`btn btn-circle btn-ghost btn-sm text-base-content/70 hover:text-primary shrink-0 ${
                isUploading ? "loading" : ""
              }`}
            >
              {!isUploading && <ImageIcon size={20} />}
            </label>

            <input
              type="text"
              value={newMessage}
              onChange={handleTypingInput}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="input input-ghost flex-1 h-10 min-h-10 focus:outline-none focus:bg-transparent px-2 w-full"
              placeholder="Type your message..."
              disabled={!socket || isUploading}
            />

            <button
              onClick={sendMessage}
              className="btn btn-primary btn-circle btn-sm shrink-0"
              disabled={!socket || (!newMessage.trim() && !isUploading)}
            >
              <Send size={16} className="-ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
