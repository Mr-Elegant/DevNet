import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import { useSocket } from "../utils/SocketContext";
import { ArrowLeft } from "lucide-react";

const Whiteboard = () => {
  const { roomId } = useParams();
  const socket = useSocket();
  const navigate = useNavigate();
  
  // Use a ref to store the editor instance securely without causing React re-renders
  const editorRef = useRef(null);
  const [editorReady, setEditorReady] = useState(false);

  // Native callback when Tldraw is 100% ready
  const handleMount = (editor) => {
    editorRef.current = editor;
    setEditorReady(true);
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!socket || !roomId || !editorReady || !editor) return;

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
        editor.store.mergeRemoteChanges(() => {
          const { added, updated, removed } = changes;
          
          // Added strict length checks because empty payloads sent via Socket.io can crash the canvas
          if (added && Object.keys(added).length > 0) {
            editor.store.put(Object.values(added));
          }
          if (updated && Object.keys(updated).length > 0) {
            const updatedRecords = Object.values(updated).map(([oldRecord, newRecord]) => newRecord);
            editor.store.put(updatedRecords);
          }
          if (removed && Object.keys(removed).length > 0) {
            const removedIds = Object.values(removed).map(record => record.id);
            editor.store.remove(removedIds);
          }
        });
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
  }, [socket, roomId, editorReady]);

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