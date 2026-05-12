import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tldraw, useEditor } from "tldraw";
import "tldraw/tldraw.css";

// Assuming your socket instance is available globally or via a custom hook. 
// If you have a hook like `useSocket()`, import it here. Otherwise, you can
// import your global socket object directly.
import { useSocket } from "../utils/SocketContext"; 

// Custom component to bridge Tldraw and Socket.IO
const TldrawSocketSync = ({ roomId }) => {
  const editor = useEditor();
  // Get the socket instance from your context
  const socket = useSocket(); 

  useEffect(() => {
    if (!socket || !editor) return;

    // 1. Join the Whiteboard Room
    socket.emit("joinWhiteboard", { roomId });

    // 2. Listen to local drawing changes and send to server
    const cleanupListener = editor.store.listen(
      (update) => {
        // Only broadcast if the change came from the local user
        if (update.source === "user") {
          socket.emit("whiteboardUpdate", { roomId, update: update.changes });
        }
      },
      { source: "user", scope: "document" }
    );

    // 3. Receive remote drawing changes from the server
    const handleRemoteUpdate = (changes) => {
      // Merge the incoming changes into our local Tldraw store instantly
      editor.store.mergeRemoteChanges(() => {
        const { added, updated, removed } = changes;

        for (const record of Object.values(added)) {
          editor.store.put([record]);
        }
        for (const [_, record] of Object.values(updated)) {
          editor.store.put([record]);
        }
        for (const record of Object.values(removed)) {
          editor.store.remove([record.id]);
        }
      });
    };

    socket.on("whiteboardUpdateReceived", handleRemoteUpdate);

    // Cleanup on unmount
    return () => {
      cleanupListener();
      socket.off("whiteboardUpdateReceived", handleRemoteUpdate);
      socket.emit("leaveWhiteboard", { roomId });
    };
  }, [editor, socket, roomId]);

  return null;
};

const Whiteboard = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen w-full bg-base-100">
      {/* Minimal Header */}
      <div className="flex items-center justify-between p-4 bg-base-200 border-b border-base-300 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn btn-sm btn-ghost">
            ← Back
          </button>
          <h1 className="text-xl font-bold text-primary">Collaborative Whiteboard</h1>
        </div>
        <div className="badge badge-outline badge-primary font-mono shadow-sm">
          Room: {roomId}
        </div>
      </div>
      
      {/* The Tldraw canvas MUST be inside a container with a relative position and explicit height */}
      <div className="flex-1 relative z-0">
        <Tldraw>
          {/* Render our sync logic inside the canvas */}
          <TldrawSocketSync roomId={roomId} />
        </Tldraw>
      </div>
    </div>
  );
};

export default Whiteboard;