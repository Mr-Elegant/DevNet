import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tldraw, useEditor } from "tldraw";
import "tldraw/tldraw.css";
import { useSocket } from "../utils/SocketContext";
import { ArrowLeft } from "lucide-react";

// 1. Error Boundary: Prevents the app from turning black and catches the exact error!
class WhiteboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Tldraw crashed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-base-200 text-error overflow-auto">
          <h2 className="text-2xl font-bold mb-4">Whiteboard Crash Detected</h2>
          <p className="mb-4 text-base-content">Please copy this exact error and send it back so we can fix it permanently:</p>
          <pre className="text-left text-xs bg-base-300 p-4 rounded-xl overflow-auto max-w-[90vw] whitespace-pre-wrap">
            {this.state.error?.toString() || "Unknown Error"}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Hidden child component that securely connects to the editor without causing page re-renders
const TldrawSync = ({ roomId }) => {
  const editor = useEditor();
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !roomId || !editor) return;

    // 1. Join our custom Socket.io room
    socket.emit("joinWhiteboard", { roomId });

    // 2. Listen for LOCAL drawing changes and send them to our backend
    const cleanupSync = editor.store.listen(
      (update) => {
        if (update.source === "user") {
          socket.emit("whiteboardUpdate", { roomId, update: update.changes });
        }
      },
      { source: "user", scope: "document" } 
    );

    // 3. Listen for REMOTE drawing changes from the backend and apply them
    const handleRemoteUpdate = (changes) => {
      try {
        // The editor's store is the source of truth.
        // We use mergeRemoteChanges to apply updates from other users.
        editor.store.mergeRemoteChanges(() => {
          const { added, updated, removed } = changes;
          if (added) editor.store.put(Object.values(added));
          if (updated) editor.store.put(Object.values(updated).map(([_from, to]) => to));
          if (removed) editor.store.remove(Object.values(removed).map((record) => record.id));
        })
      } catch (err) {
        console.error("Failed to merge remote drawing:", err);
      }
    };

    socket.on("whiteboardUpdateReceived", handleRemoteUpdate);

    // 4. Cleanup when leaving the page
    return () => {
      cleanupSync();
      socket.off("whiteboardUpdateReceived", handleRemoteUpdate);
      socket.emit("leaveWhiteboard", { roomId });
    };
  }, [socket, roomId, editor]);

  return null; // This component strictly manages logic, no UI
};

// 2. Memoized Canvas: Prevents Tldraw from re-rendering when the socket connects!
const IsolatedCanvas = React.memo(({ roomId, assetUrls }) => {
  return (
    <WhiteboardErrorBoundary>
      <Tldraw assetUrls={assetUrls}>
        <TldrawSync roomId={roomId} />
      </Tldraw>
    </WhiteboardErrorBoundary>
  );
});

IsolatedCanvas.displayName = "IsolatedCanvas";

const Whiteboard = () => {
  const { roomId } = useParams();
  const socket = useSocket();
  const navigate = useNavigate();
  
  // Point Tldraw to your local domain instead of the external CDN
  // This completely bypasses the Firefox/Safari SVG Security Error!
  const customAssetUrls = {
    icons: "/tldraw-assets/icons",
    translations: "/tldraw-assets/translations",
    embedIcons: "/tldraw-assets/embed-icons",
    fonts: "/tldraw-assets/fonts",
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-base-100 z-[9999] flex flex-col">
      {/* Custom Header */}
      <div className="h-14 bg-base-200 border-b border-base-300 flex items-center px-4 shrink-0 shadow-sm">
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-ghost btn-sm mr-4"
        >
          <ArrowLeft size={18} />
          Back to Chat
        </button>
        <h1 className="text-lg font-bold text-primary">Collaborative Whiteboard</h1>
        <div className={`ml-auto badge ${socket?.connected ? "badge-success" : "badge-error"} badge-sm`}>
          {socket?.connected ? "Live Sync Active" : "Disconnected"}
        </div>
      </div>
      
      {/* Tldraw Canvas */}
      <div className="flex-1 relative w-full h-full">
        <IsolatedCanvas roomId={roomId} assetUrls={customAssetUrls} />
      </div>
    </div>
  );
};

export default Whiteboard;