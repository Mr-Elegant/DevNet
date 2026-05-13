import { Route, Routes, Navigate } from "react-router-dom"; // ✨ Added Navigate
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { SocketProvider } from "./utils/SocketContext";
import Body from "./components/Body";
import Login from "./components/Login";
import Profile from "./components/Profile";
import Feed from "./components/Feed";
import Connections from "./components/Connections";
import Requests from "./components/Requests";
import Signup from "./components/Signup";
import Premium from "./components/Premium";
import Chat from "./components/Chat";
import GlobalFeed from "./components/GlobalFeed";
import PostDetails from "./components/PostDetails";
import Search from "./components/Search";
import SpiderCursor from "./components/SpiderCursor";
import ViewProfile from "./components/ViewProfile";
import Whiteboard from "./components/Whiteboard"; // ✨ Added Whiteboard Import
import AdminDashboard from "./components/AdminDashboard"; // ✨ Added AdminDashboard Import
import { useSocket } from "./utils/SocketContext";
import { useNavigate } from "react-router-dom";

// 🛡️ Admin Route Protection Component
const AdminRoute = ({ children }) => {
  const user = useSelector((store) => store.user);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  return children;
};

// ==========================================
// ✨ REAL-TIME INVITATION COMPONENTS
// ==========================================

const WhiteboardInviteModal = ({ invite, onClose }) => {
  const navigate = useNavigate();
  const socket = useSocket();
  const user = useSelector((store) => store.user);

  if (!invite) return null;

  const { roomId, senderInfo } = invite;

  const handleAccept = () => {
    navigate(`/whiteboard/${roomId}`);
    onClose();
  };

  const handleReject = () => {
    if (socket && user) {
      socket.emit("whiteboard-invite-rejected", {
        senderId: senderInfo._id, // The original inviter
        rejecterInfo: {
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="card w-96 bg-base-100 shadow-xl animate-jump-in border border-primary/20">
        <div className="card-body items-center text-center">
          <h2 className="card-title text-primary">Whiteboard Invitation</h2>
          <p className="mt-2">
            <b>
              {senderInfo.firstName} {senderInfo.lastName}
            </b>{" "}
            has invited you to collaborate.
          </p>
          <div className="card-actions justify-end mt-6 w-full">
            <button className="btn btn-ghost flex-1" onClick={handleReject}>
              Reject
            </button>
            <button className="btn btn-primary flex-1" onClick={handleAccept}>
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppContent = () => {
  const socket = useSocket();
  const [whiteboardInvite, setWhiteboardInvite] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handleInvite = (data) => setWhiteboardInvite(data);
    const handleRejection = ({ rejecterInfo }) =>
      alert(`${rejecterInfo.firstName} rejected the whiteboard invitation.`);

    socket.on("whiteboard-invite-received", handleInvite);
    socket.on("whiteboard-invite-was-rejected", handleRejection);

    return () => {
      socket.off("whiteboard-invite-received", handleInvite);
      socket.off("whiteboard-invite-was-rejected", handleRejection);
    };
  }, [socket]);

  return (
    <>
      <WhiteboardInviteModal
        invite={whiteboardInvite}
        onClose={() => setWhiteboardInvite(null)}
      />
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Body />}>
          <Route index element={<Feed />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<ViewProfile />} />
          <Route path="/connections" element={<Connections />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="/chat/:targetUserId" element={<Chat />} />
          <Route path="/community" element={<GlobalFeed />} />
          <Route path="/post/:postId" element={<PostDetails />} />
          <Route path="/search" element={<Search />} />
          <Route path="/whiteboard/:roomId" element={<Whiteboard />} />

          {/* 👑 God Mode Admin Route */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Route>
      </Routes>
    </>
  );
};

const App = () => {
  const theme = useSelector((store) => store.theme);

  // Apply theme on mount and when it changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="min-h-screen w-full relative bg-base-100">

      <SpiderCursor />

      {/* Dashed Bottom Left Fade Grid */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 0",
          color: "var(--fallback-bc,oklch(var(--bc)/0.1))", // Using base-content with opacity for theme compatibility
          maskImage: `
            repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 80% 80% at 100% 100%, #000 50%, transparent 90%)
          `,
          WebkitMaskImage: `
            repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 80% 80% at 100% 100%, #000 50%, transparent 90%)
          `,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />
      
      {/* Content with higher z-index */}
      <div className="relative z-10">
        {/* 👇 WRAP ROUTES IN SOCKETPROVIDER */}
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </div>
    </div>
  );
};

export default App;