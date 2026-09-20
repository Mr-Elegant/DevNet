import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import { useSocket } from "../context/SocketContext";
import { ArrowLeft, Share2, Check, Users } from "lucide-react";

// Pure Memoized Component to ensure Tldraw canvas instance is preserved across re-renders
const MemoizedTldraw = React.memo(({ onMount }) => {
  return <Tldraw onMount={onMount} autoFocus />;
});
MemoizedTldraw.displayName = "MemoizedTldraw";

const Whiteboard = () => {
  const { roomId } = useParams();
  const socket = useSocket();
  const navigate = useNavigate();

  const editorRef = useRef(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [collaboratorCount, setCollaboratorCount] = useState(1);

  // 1. Capture Tldraw editor instance on mount
  const handleMount = useCallback((editor) => {
    editorRef.current = editor;
    setIsEditorReady(true);
  }, []);

  // 2. Manage Socket.IO Room Lifecycle & Bidirectional Synchronization
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !isEditorReady || !socket || !roomId) return;

    // Join the collaborative room on the server
    socket.emit("joinWhiteboard", { roomId });

    // A. Handle initial canvas snapshot from backend
    const handleSnapshot = ({ snapshot }) => {
      try {
        if (!snapshot || !Array.isArray(snapshot)) return;
        const validRecords = snapshot.filter(
          (r) => r && (r.typeName === "shape" || r.typeName === "asset" || r.typeName === "binding")
        );
        if (validRecords.length > 0) {
          editor.store.mergeRemoteChanges(() => {
            editor.store.put(validRecords);
          });
        }
      } catch (err) {
        console.error("Failed to load whiteboard snapshot:", err);
      }
    };

    // B. Handle live drawing diffs from collaborator
    const handleRemoteUpdate = (changes) => {
      try {
        editor.store.mergeRemoteChanges(() => {
          editor.store.applyDiff(changes);
        });
      } catch (err) {
        console.error("Failed to merge remote drawing diff:", err);
      }
    };

    // C. When another collaborator joins, share our current state to ensure parity
    const handlePeerJoined = () => {
      try {
        setCollaboratorCount((prev) => prev + 1);
        const allRecords = editor.store.allRecords();
        const docRecords = allRecords.filter(
          (r) => r && (r.typeName === "shape" || r.typeName === "asset" || r.typeName === "binding")
        );
        if (docRecords.length > 0) {
          socket.emit("whiteboardSendSync", { roomId, snapshot: docRecords });
        }
      } catch (err) {
        console.error("Failed to sync state with new peer:", err);
      }
    };

    socket.on("whiteboardSnapshot", handleSnapshot);
    socket.on("whiteboardUpdateReceived", handleRemoteUpdate);
    socket.on("whiteboardPeerJoined", handlePeerJoined);

    // D. Listen to local user changes and broadcast diffs
    const cleanupEditor = editor.store.listen(
      (entry) => {
        if (entry.source === "user") {
          socket.emit("whiteboardUpdate", { roomId, update: entry.changes });
        }
      },
      { source: "user", scope: "document" }
    );

    // E. Cleanup on unmount or socket change
    return () => {
      cleanupEditor();
      socket.off("whiteboardSnapshot", handleSnapshot);
      socket.off("whiteboardUpdateReceived", handleRemoteUpdate);
      socket.off("whiteboardPeerJoined", handlePeerJoined);
      socket.emit("leaveWhiteboard", { roomId });
    };
  }, [socket, roomId, isEditorReady]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-base-100 z-[9999] flex flex-col">
      {/* Custom Collaboration Header */}
      <div className="h-14 bg-base-200/90 backdrop-blur-md border-b border-base-content/10 flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-ghost btn-sm rounded-xl gap-1.5"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold text-primary">Collaborative Whiteboard</h1>
            <span className="badge badge-neutral badge-xs font-mono hidden md:inline truncate max-w-[140px]">
              {roomId.slice(0, 10)}...
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Copy Room Link */}
          <button
            onClick={handleCopyLink}
            className="btn btn-xs sm:btn-sm btn-outline rounded-xl gap-1.5"
            title="Copy Whiteboard Link to share with partner"
          >
            {copied ? <Check size={14} className="text-success" /> : <Share2 size={14} />}
            <span className="hidden sm:inline">{copied ? "Copied!" : "Share Link"}</span>
          </button>

          {/* Sync Status Badge */}
          <div 
            className={`badge ${socket?.connected ? "badge-success" : "badge-error"} badge-sm gap-1.5 py-2.5 px-3 rounded-xl`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${socket?.connected ? "bg-success-content animate-ping" : "bg-error-content"}`}></span>
            <span>{socket?.connected ? "Live Sync Active" : "Connecting..."}</span>
          </div>
        </div>
      </div>
      
      {/* Tldraw Canvas */}
      <div className="flex-1 relative w-full h-full overflow-hidden">
        <MemoizedTldraw onMount={handleMount} />
      </div>
    </div>
  );
};

export default Whiteboard;