import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useSocket } from "../context/SocketContext";
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
    <div className="container mx-auto px-4 py-6 h-[calc(100vh-6rem)] sm:h-[calc(100vh-7.5rem)] max-w-5xl relative z-10 flex flex-col">
      <div className="bg-base-200/40 backdrop-blur-xl shadow-2xl rounded-3xl border border-base-content/10 flex-1 flex flex-col overflow-hidden">
        
        {/* Chat Header */}
        <div className="p-4 bg-base-100/60 backdrop-blur-lg border-b border-base-content/5 flex items-center justify-between z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="btn btn-ghost btn-circle btn-sm md:hidden">
              <ArrowLeft size={18} />
            </button>
            {targetUser?.photoUrl && (
              <div className={`avatar ${isOnline ? "online" : ""}`}>
                <div className="w-10 rounded-full ring-2 ring-primary/40 ring-offset-2 ring-offset-base-100">
                  <img src={targetUser.photoUrl} alt={targetUser.firstName} />
                </div>
              </div>
            )}
            <div>
              <h2 className="text-sm font-bold text-base-content leading-tight">
                {targetUser
                  ? `${targetUser.firstName} ${targetUser.lastName || ""}`
                  : "Chat"}
              </h2>
              <div className="text-[10px] font-semibold mt-0.5 uppercase tracking-wider">
                {isOnline ? (
                  <span className="text-success">Online</span>
                ) : (
                  <span className="opacity-40">Offline</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Collaborative Whiteboard Button */}
            {roomId && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleWhiteboardInvite}
                disabled={!isOnline}
                className="btn btn-xs sm:btn-sm btn-outline btn-primary rounded-xl px-3 sm:px-4"
                title={isOnline ? "Start Collaborative Whiteboard" : "User is offline"}
              >
                <PenTool size={14} className="sm:mr-1.5" />
                <span className="hidden sm:inline">Collaborate</span>
              </motion.button>
            )}

            <div className={`badge ${socket?.connected ? "badge-success" : "badge-error"} badge-xs`}>
              {socket?.connected ? "connected" : "reconnecting"}
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3.5 scroll-smooth bg-base-100/20"
        >
          {messages.map((msg, index) => {
            const showDate =
              index === 0 ||
              formatDateLabel(msg.createdAt) !==
                formatDateLabel(messages[index - 1].createdAt);

            const isMe = msg.senderId === userId;

            return (
              <div key={`${msg._id}-${msg.status}`} className="space-y-1.5">
                {showDate && (
                  <div className="flex justify-center my-4">
                    <span className="text-[9px] uppercase tracking-widest bg-base-200/80 text-base-content/50 border border-base-content/5 px-3.5 py-1 rounded-full font-bold shadow-sm backdrop-blur-sm">
                      {formatDateLabel(msg.createdAt)}
                    </span>
                  </div>
                )}

                <div className={`chat ${isMe ? "chat-end" : "chat-start"}`}>
                  <div className="chat-header text-[10px] font-semibold opacity-50 mb-1">
                    {msg.firstName}
                    <time className="ml-1.5">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>

                  <div
                    className={`chat-bubble shadow-sm text-sm leading-relaxed px-4 py-2.5 rounded-2xl ${
                      isMe
                        ? "bg-gradient-to-br from-primary to-secondary text-primary-content rounded-tr-none"
                        : "bg-base-100 border border-base-content/5 text-base-content rounded-tl-none"
                    }`}
                  >
                    {/* Render Image */}
                    {msg.image && (
                      <img 
                        src={msg.image} 
                        alt="attachment" 
                        className="max-w-xs rounded-xl mb-1.5 cursor-pointer hover:opacity-95 transition-opacity" 
                        onClick={() => window.open(msg.image, "_blank")} 
                      />
                    )}

                    {/* Render Generic File */}
                    {msg.fileUrl && (
                      <a 
                        href={msg.fileUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-3 bg-base-content/10 hover:bg-base-content/20 p-2.5 rounded-xl transition mb-1"
                      >
                        <FileText size={22} className="opacity-75 shrink-0" />
                        <span className="text-xs font-semibold underline truncate max-w-[180px]">
                          {msg.fileName || "View Attachment"}
                        </span>
                      </a>
                    )}

                    {/* Render Text */}
                    {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                  </div>

                  {/* Message Footer (Ticks & Delete Button) */}
                  {isMe && (
                    <div className="chat-footer opacity-50 text-[9px] mt-1 flex gap-2 items-center">
                      <span className="font-bold tracking-tighter">
                        {msg.status === "sent" && "✓"}
                        {msg.status === "delivered" && "✓✓"}
                        {msg.status === "seen" && (
                          <span className="text-primary font-black">✓✓</span>
                        )}
                      </span>

                      <button 
                        onClick={() => handleDeleteMessage(msg._id)}
                        className="hover:text-error transition-colors duration-150 cursor-pointer"
                        title="Delete for everyone"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {isTyping && (
            <div className="chat chat-start animate-pulse mb-2">
              <div className="chat-header text-[10px] font-semibold opacity-50 mb-1">{typingUser}</div>
              <div className="chat-bubble chat-bubble-sm bg-base-300 text-base-content/60 flex items-center gap-1 h-8 rounded-2xl rounded-tl-none">
                <span className="w-1.5 h-1.5 bg-base-content/40 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-base-content/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-1.5 h-1.5 bg-base-content/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
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
            className="btn btn-circle btn-primary btn-sm absolute bottom-24 right-8 shadow-2xl z-10 hover:scale-105 transition-transform"
          >
            <ChevronDown size={16} />
            {unreadCount > 0 && (
              <div className="badge badge-error badge-xs absolute -top-1 -right-1 font-bold">
                {unreadCount}
              </div>
            )}
          </button>
        )}

        {/* Input Area */}
        <div className="p-4 bg-base-100/60 backdrop-blur-lg border-t border-base-content/5 shrink-0 relative">
          {/* Emoji Picker Popup */}
          {showEmojiPicker && (
            <div className="absolute bottom-24 left-4 z-50 shadow-2xl rounded-2xl overflow-hidden border border-base-content/10">
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

          <div className="flex items-end gap-2 bg-base-200/50 p-2 rounded-2xl border border-base-content/5 relative focus-within:ring-2 focus-within:ring-primary/40 transition-all">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="btn btn-circle btn-ghost btn-sm text-base-content/55 hover:text-primary shrink-0"
            >
              <Smile size={18} />
            </button>

            <input
              type="file"
              id="imageUpload"
              className="hidden"
              onChange={handleFileUpload}
            />
            <label
              htmlFor="imageUpload"
              className={`btn btn-circle btn-ghost btn-sm text-base-content/55 hover:text-primary shrink-0 ${
                isUploading ? "loading" : ""
              }`}
            >
              {!isUploading && <ImageIcon size={18} />}
            </label>

            <textarea
              rows={1}
              value={newMessage}
              onChange={handleTypingInput}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="textarea textarea-ghost flex-1 focus:outline-none focus:bg-transparent px-2 w-full resize-none min-h-[38px] max-h-[120px] text-sm leading-relaxed"
              placeholder="Type a message..."
              disabled={!socket || isUploading}
            />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              className="btn btn-primary btn-circle btn-sm shrink-0"
              disabled={!socket || (!newMessage.trim() && !isUploading)}
            >
              <Send size={14} className="-ml-0.5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
