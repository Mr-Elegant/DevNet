import React, { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import { useSocket } from "../utils/SocketContext";
import { ArrowLeft } from "lucide-react";

const Whiteboard = () => {
  const { roomId } = useParams();
  const socket = useSocket();
  const navigate = useNavigate();

  // Pure JS References (NO React state = NO infinite re-renders!)
  const editorRef = useRef(null);
  const cleanupRef = useRef(null);

  const setupSync = () => {
    // Only run if we have the socket, the room, and the canvas has physically mounted
    if (!socket || !roomId || !editorRef.current) return;

    // Prevent attaching multiple duplicate listeners
    if (cleanupRef.current) return;

    const editor = editorRef.current;

    socket.emit("joinWhiteboard", { roomId });

    // Listen for LOCAL drawings
    const cleanupEditor = editor.store.listen(
      (update) => {
        if (update.source === "user") {
          socket.emit("whiteboardUpdate", { roomId, update: update.changes });
        }
      },
      { source: "user", scope: "document" }
    );

    // Listen for REMOTE drawings
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

    // Save our destructors safely
    cleanupRef.current = () => {
      cleanupEditor();
      socket.off("whiteboardUpdateReceived", handleRemoteUpdate);
      socket.emit("leaveWhiteboard", { roomId });
      cleanupRef.current = null;
    };
  };

  // If the socket connects/disconnects later, bind/unbind safely
  useEffect(() => {
    setupSync();
    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [socket, roomId]);

  // When the canvas finishes loading internally, it calls this function exactly once
  const handleMount = (editor) => {
    editorRef.current = editor;
    setupSync();
  };

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
        <Tldraw onMount={handleMount} />
      </div>
    </div>
  );
};

export default Whiteboard;