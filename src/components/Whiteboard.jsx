import React, { useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import { useSocket } from "../utils/SocketContext";
import { ArrowLeft } from "lucide-react";

// Pure Memoized Component to absolutely guarantee Tldraw NEVER re-renders from parent state changes
const MemoizedTldraw = React.memo(({ onMount }) => {
  return <Tldraw onMount={onMount} />;
});
MemoizedTldraw.displayName = "MemoizedTldraw";

const Whiteboard = () => {
  const { roomId } = useParams();
  const socket = useSocket();
  const navigate = useNavigate();

  const editorRef = useRef(null);
  const cleanupRef = useRef(null);

  // useCallback ensures this function NEVER changes memory address.
  // This prevents Tldraw from destroying and recreating the canvas when the socket connects!
  const handleMount = useCallback((editor) => {
    editorRef.current = editor;

    if (!socket || !roomId) return;
    if (cleanupRef.current) return;

    socket.emit("joinWhiteboard", { roomId });

    const cleanupEditor = editor.store.listen(
      (update) => {
        if (update.source === "user") {
          socket.emit("whiteboardUpdate", { roomId, update: update.changes });
        }
      },
      { source: "user", scope: "document" }
    );

    const handleRemoteUpdate = (changes) => {
      try {
        editor.store.mergeRemoteChanges(() => {
          const { added, updated, removed } = changes;
          if (added) editor.store.put(Object.values(added));
          if (updated) editor.store.put(Object.values(updated).map(([_from, to]) => to));
          if (removed) editor.store.remove(Object.values(removed).map((record) => record.id));
        });
      } catch (err) {
        console.error("Failed to merge remote drawing:", err);
      }
    };

    socket.on("whiteboardUpdateReceived", handleRemoteUpdate);

    cleanupRef.current = () => {
      cleanupEditor();
      socket.off("whiteboardUpdateReceived", handleRemoteUpdate);
      socket.emit("leaveWhiteboard", { roomId });
      cleanupRef.current = null;
    };
  }, [socket, roomId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full bg-base-100 z-[9999] flex flex-col">
      {/* Custom Header */}
      <div className="h-14 bg-base-200 border-b border-base-300 flex items-center px-4 shrink-0 shadow-sm z-10">
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
        <MemoizedTldraw onMount={handleMount} />
      </div>
    </div>
  );
};

export default Whiteboard;