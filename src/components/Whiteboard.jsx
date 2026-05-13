import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tldraw, createTLStore, defaultShapeUtils } from "tldraw";
import "tldraw/tldraw.css";
import { useSocket } from "../utils/SocketContext";
import { ArrowLeft } from "lucide-react";

const Whiteboard = () => {
  const { roomId } = useParams();
  const socket = useSocket();
  const navigate = useNavigate();

  // 1. Create an empty, local tldraw store (NO demo sync!)
  const [store] = useState(() => createTLStore({ shapeUtils: defaultShapeUtils }));

  useEffect(() => {
    if (!socket || !roomId) return;

    // 2. Join our custom Socket.io room
    socket.emit("joinWhiteboard", { roomId });

    // 3. Listen for LOCAL drawing changes and send them to our backend
    const cleanupSync = store.listen(
      (update) => {
        // Only broadcast changes made by the actual user (not incoming remote changes)
        if (update.source === "user") {
          socket.emit("whiteboardUpdate", {
            roomId,
            update: update.changes,
          });
        }
      },
      { source: "user", scope: "document" } 
    );

    // 4. Listen for REMOTE drawing changes from the backend and apply them
    const handleRemoteUpdate = (changes) => {
      // mergeRemoteChanges ensures we don't accidentally re-broadcast incoming updates
      store.mergeRemoteChanges(() => {
        const { added, updated, removed } = changes;
        
        if (added) {
          for (const record of Object.values(added)) store.put([record]);
        }
        if (updated) {
          // 'updated' gives us an array of [oldRecord, newRecord]. We only want to save the new one.
          for (const [oldRecord, newRecord] of Object.values(updated)) store.put([newRecord]);
        }
        if (removed) {
          for (const record of Object.values(removed)) store.remove([record.id]);
        }
      });
    };

    socket.on("whiteboardUpdateReceived", handleRemoteUpdate);

    // 5. Cleanup when leaving the page
    return () => {
      cleanupSync();
      socket.off("whiteboardUpdateReceived", handleRemoteUpdate);
      socket.emit("leaveWhiteboard", { roomId });
    };
  }, [socket, roomId, store]);

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
        <Tldraw store={store} inferDarkMode />
      </div>
    </div>
  );
};

export default Whiteboard;