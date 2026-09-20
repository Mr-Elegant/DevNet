import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { useSocket } from "../context/SocketContext";
import { BASE_URL } from "../utils/constants";
import {
  ArrowLeft,
  Share2,
  Check,
  Users,
  MousePointer,
  Hand,
  Pencil,
  Square,
  Database,
  Circle,
  ArrowRight,
  Type,
  StickyNote,
  Eraser,
  Undo2,
  Redo2,
  Download,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Loader2,
  Key,
  Bot,
} from "lucide-react";

// Vibrant developer color palette
const PALETTE = [
  { name: "Cyan", value: "#06b6d4" },
  { name: "Emerald", value: "#10b981" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Purple", value: "#a855f7" },
  { name: "White", value: "#f8fafc" },
];

const STROKE_WIDTHS = [
  { label: "S", value: 2 },
  { label: "M", value: 4 },
  { label: "L", value: 7 },
];

const STICKY_COLORS = [
  { name: "Amber", bg: "#fef3c7", text: "#78350f" },
  { name: "Cyan", bg: "#cffafe", text: "#164e63" },
  { name: "Emerald", bg: "#d1fae5", text: "#064e3b" },
  { name: "Rose", bg: "#ffe4e6", text: "#881337" },
  { name: "Purple", bg: "#f3e8ff", text: "#581c87" },
];

const QUICK_PROMPT_CHIPS = [
  { label: "⚡ URL Shortener", prompt: "High-scale URL shortener with rate limiter, base62 encoder, Redis cache, and PostgreSQL database" },
  { label: "🛒 E-Commerce Pipeline", prompt: "E-Commerce checkout microservices with API gateway, Order Service, Kafka topic, and Stripe Payment Worker" },
  { label: "💬 Real-Time Chat", prompt: "Real-time chat architecture with WebSocket load balancer, Socket.IO cluster, Redis Pub/Sub, and MongoDB" },
  { label: "📊 Event Analytics", prompt: "High-throughput analytics pipeline with Client Tracking SDK, Ingestion API, Kafka cluster, and ClickHouse DB" },
];

const Whiteboard = () => {
  const { roomId } = useParams();
  const socket = useSocket();
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Canvas Viewport Transformation
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // Elements & History
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Active Tool & Styles
  const [activeTool, setActiveTool] = useState("select"); // 'select' | 'hand' | 'pen' | 'rect' | 'cylinder' | 'circle' | 'arrow' | 'text' | 'sticky' | 'eraser'
  const [strokeColor, setStrokeColor] = useState("#06b6d4");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isFilled, setIsFilled] = useState(true);

  // Interaction State
  const [selectedId, setSelectedId] = useState(null);
  const [currentDraft, setCurrentDraft] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editingText, setEditingText] = useState(null);

  // Collaboration State
  const [collaborators, setCollaborators] = useState({});
  const [collaboratorCount, setCollaboratorCount] = useState(1);
  const [copied, setCopied] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  // AI Architect State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiStatusMsg, setAiStatusMsg] = useState("");
  const [userApiKey, setUserApiKey] = useState(() => localStorage.getItem("openrouter_api_key") || "");
  const [showKeyConfig, setShowKeyConfig] = useState(false);

  // User details for multiplayer presence
  const myName = user?.firstName ? `${user.firstName}${user.lastName ? " " + user.lastName[0] + "." : ""}` : "Dev Partner";
  const myColorRef = useRef(PALETTE[Math.floor(Math.random() * PALETTE.length)].value);

  // -------------------------------------------------------------
  // 1. Helper: Coordinate Transformations
  // -------------------------------------------------------------
  const getCanvasPoint = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0;
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom,
    };
  }, [pan, zoom]);

  const canvasToScreen = useCallback((cx, cy) => {
    return {
      x: cx * zoom + pan.x,
      y: cy * zoom + pan.y,
    };
  }, [pan, zoom]);

  // Push state to Undo/Redo history
  const commitToHistory = useCallback((newElements) => {
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, newElements];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  // -------------------------------------------------------------
  // 2. Hit-testing for Selection & Deletion
  // -------------------------------------------------------------
  const hitTest = useCallback((point, el) => {
    if (!el) return false;
    const threshold = 12 / zoom;

    if (el.type === "stroke") {
      return el.points.some((p) => Math.hypot(p.x - point.x, p.y - point.y) < threshold);
    }
    if (el.type === "rect" || el.type === "cylinder" || el.type === "sticky") {
      return (
        point.x >= el.x - threshold &&
        point.x <= el.x + el.w + threshold &&
        point.y >= el.y - threshold &&
        point.y <= el.y + el.h + threshold
      );
    }
    if (el.type === "circle") {
      const dist = Math.hypot(point.x - el.x, point.y - el.y);
      return Math.abs(dist - el.radius) <= threshold || (el.filled && dist <= el.radius);
    }
    if (el.type === "arrow") {
      const { startX, startY, endX, endY } = el;
      const l2 = Math.hypot(endX - startX, endY - startY) ** 2;
      if (l2 === 0) return Math.hypot(point.x - startX, point.y - startY) < threshold;
      let t = ((point.x - startX) * (endX - startX) + (point.y - startY) * (endY - startY)) / l2;
      t = Math.max(0, Math.min(1, t));
      const projX = startX + t * (endX - startX);
      const projY = startY + t * (endY - startY);
      return Math.hypot(point.x - projX, point.y - projY) <= threshold;
    }
    if (el.type === "text") {
      const w = el.w || 140;
      const h = el.h || 32;
      return (
        point.x >= el.x &&
        point.x <= el.x + w &&
        point.y >= el.y - h &&
        point.y <= el.y + 10
      );
    }
    return false;
  }, [zoom]);

  // -------------------------------------------------------------
  // 3. Socket.IO Synchronization Lifecycle
  // -------------------------------------------------------------
  useEffect(() => {
    if (!socket || !roomId) return;

    socket.emit("joinWhiteboard", { roomId });

    // Handle initial snapshot when joining room
    const handleSnapshot = ({ snapshot }) => {
      if (Array.isArray(snapshot) && snapshot.length > 0) {
        const valid = snapshot.filter((e) => e && e.id && e.type);
        setElements(valid);
        setHistory([valid]);
        setHistoryIndex(0);
      }
    };

    // Live element broadcast from peer
    const handleRemoteDraw = (element) => {
      if (!element || !element.id) return;
      setElements((prev) => {
        const filtered = prev.filter((el) => el.id !== element.id);
        return [...filtered, element];
      });
    };

    // Live element update from peer (move, resize, text edit)
    const handleRemoteUpdate = (element) => {
      if (!element || !element.id) return;
      setElements((prev) =>
        prev.map((el) => (el.id === element.id ? { ...el, ...element } : el))
      );
    };

    // Remote element deletion
    const handleRemoteDelete = (elementIds) => {
      if (!Array.isArray(elementIds)) return;
      const idSet = new Set(elementIds);
      setElements((prev) => prev.filter((el) => !idSet.has(el.id)));
    };

    // Remote canvas cleared
    const handleRemoteClear = () => {
      setElements([]);
      setHistory([[]]);
      setHistoryIndex(0);
      setSelectedId(null);
    };

    // Remote cursor streaming
    const handleCursorUpdate = ({ peerId, cursor }) => {
      if (!peerId || !cursor) return;
      setCollaborators((prev) => ({
        ...prev,
        [peerId]: {
          ...cursor,
          lastSeen: Date.now(),
        },
      }));
    };

    const handlePeerJoined = () => {
      setCollaboratorCount((prev) => prev + 1);
      setElements((currentElements) => {
        if (currentElements.length > 0) {
          socket.emit("whiteboardSendSync", { roomId, snapshot: currentElements });
        }
        return currentElements;
      });
    };

    const handlePeerLeft = ({ peerSocketId }) => {
      setCollaboratorCount((prev) => Math.max(1, prev - 1));
      setCollaborators((prev) => {
        const copy = { ...prev };
        delete copy[peerSocketId];
        return copy;
      });
    };

    socket.on("whiteboardSnapshot", handleSnapshot);
    socket.on("whiteboardDraw", handleRemoteDraw);
    socket.on("whiteboardUpdateElement", handleRemoteUpdate);
    socket.on("whiteboardDeleteElements", handleRemoteDelete);
    socket.on("whiteboardClear", handleRemoteClear);
    socket.on("whiteboardCursorUpdate", handleCursorUpdate);
    socket.on("whiteboardPeerJoined", handlePeerJoined);
    socket.on("whiteboardPeerLeft", handlePeerLeft);

    return () => {
      socket.off("whiteboardSnapshot", handleSnapshot);
      socket.off("whiteboardDraw", handleRemoteDraw);
      socket.off("whiteboardUpdateElement", handleRemoteUpdate);
      socket.off("whiteboardDeleteElements", handleRemoteDelete);
      socket.off("whiteboardClear", handleRemoteClear);
      socket.off("whiteboardCursorUpdate", handleCursorUpdate);
      socket.off("whiteboardPeerJoined", handlePeerJoined);
      socket.off("whiteboardPeerLeft", handlePeerLeft);
      socket.emit("leaveWhiteboard", { roomId });
    };
  }, [socket, roomId]);

  // Clean up stale multiplayer cursors (>4s inactive)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setCollaborators((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const [key, val] of Object.entries(next)) {
          if (now - val.lastSeen > 4000) {
            delete next[key];
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Broadcast throttled cursor updates
  const lastCursorEmit = useRef(0);
  const handleMouseMoveBroadcast = useCallback((e) => {
    if (!socket || !roomId) return;
    const now = Date.now();
    if (now - lastCursorEmit.current < 35) return; // ~30 FPS throttling
    lastCursorEmit.current = now;

    const pt = getCanvasPoint(e);
    socket.emit("whiteboardCursor", {
      roomId,
      cursor: {
        x: Math.round(pt.x),
        y: Math.round(pt.y),
        name: myName,
        color: myColorRef.current,
      },
    });
  }, [socket, roomId, getCanvasPoint, myName]);

  // -------------------------------------------------------------
  // 4. Canvas Rendering Engine
  // -------------------------------------------------------------
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Dark architectural background
    ctx.fillStyle = "#0a0e17";
    ctx.fillRect(0, 0, width, height);

    // Subtle dynamic dot grid
    const gridSize = 32 * zoom;
    const offsetX = pan.x % gridSize;
    const offsetY = pan.y % gridSize;
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    for (let x = offsetX; x < width; x += gridSize) {
      for (let y = offsetY; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Apply pan & zoom viewport
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Render elements list + current draft
    const allToRender = currentDraft ? [...elements, currentDraft] : elements;

    for (const el of allToRender) {
      ctx.save();
      ctx.strokeStyle = el.color || "#06b6d4";
      ctx.lineWidth = el.width || 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (el.type === "stroke") {
        if (el.points && el.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(el.points[0].x, el.points[0].y);
          for (let i = 1; i < el.points.length - 1; i++) {
            const xc = (el.points[i].x + el.points[i + 1].x) / 2;
            const yc = (el.points[i].y + el.points[i + 1].y) / 2;
            ctx.quadraticCurveTo(el.points[i].x, el.points[i].y, xc, yc);
          }
          const last = el.points[el.points.length - 1];
          ctx.lineTo(last.x, last.y);
          ctx.stroke();
        }
      } else if (el.type === "rect") {
        // Architecture Service Box
        if (el.filled) {
          ctx.fillStyle = `${el.color}15`;
          ctx.beginPath();
          ctx.roundRect(el.x, el.y, el.w, el.h, 8);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.roundRect(el.x, el.y, el.w, el.h, 8);
        ctx.stroke();

        // Render Service Label
        if (el.text) {
          ctx.font = "600 13px 'Outfit', Inter, sans-serif";
          ctx.fillStyle = el.color;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const lines = el.text.split("\n");
          if (lines.length > 1) {
            lines.forEach((line, idx) => {
              ctx.fillText(line, el.x + el.w / 2, el.y + el.h / 2 - 8 + idx * 16);
            });
          } else {
            ctx.fillText(el.text, el.x + el.w / 2, el.y + el.h / 2);
          }
        }
      } else if (el.type === "cylinder") {
        // Database Cylinder Icon
        const rY = Math.min(18, el.h / 4);
        const w = el.w;
        const h = el.h;

        if (el.filled) {
          ctx.fillStyle = `${el.color}18`;
          ctx.beginPath();
          ctx.ellipse(el.x + w / 2, el.y + rY, w / 2, rY, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.rect(el.x, el.y + rY, w, h - rY * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(el.x + w / 2, el.y + h - rY, w / 2, rY, 0, 0, Math.PI);
          ctx.fill();
        }

        // Top ellipse
        ctx.beginPath();
        ctx.ellipse(el.x + w / 2, el.y + rY, w / 2, rY, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Sides
        ctx.beginPath();
        ctx.moveTo(el.x, el.y + rY);
        ctx.lineTo(el.x, el.y + h - rY);
        ctx.moveTo(el.x + w, el.y + rY);
        ctx.lineTo(el.x + w, el.y + h - rY);
        ctx.stroke();

        // Bottom ellipse
        ctx.beginPath();
        ctx.ellipse(el.x + w / 2, el.y + h - rY, w / 2, rY, 0, 0, Math.PI);
        ctx.stroke();

        // Center Text
        if (el.text) {
          ctx.font = "600 13px 'Outfit', Inter, sans-serif";
          ctx.fillStyle = el.color;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const lines = el.text.split("\n");
          if (lines.length > 1) {
            lines.forEach((line, idx) => {
              ctx.fillText(line, el.x + w / 2, el.y + h / 2 - 8 + idx * 16);
            });
          } else {
            ctx.fillText(el.text, el.x + w / 2, el.y + h / 2);
          }
        }
      } else if (el.type === "circle") {
        // Queue / Worker / Cache Node
        if (el.filled) {
          ctx.fillStyle = `${el.color}15`;
          ctx.beginPath();
          ctx.arc(el.x, el.y, el.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(el.x, el.y, el.radius, 0, Math.PI * 2);
        ctx.stroke();

        if (el.text) {
          ctx.font = "600 12px 'Outfit', Inter, sans-serif";
          ctx.fillStyle = el.color;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const lines = el.text.split("\n");
          if (lines.length > 1) {
            lines.forEach((line, idx) => {
              ctx.fillText(line, el.x, el.y - 7 + idx * 15);
            });
          } else {
            ctx.fillText(el.text, el.x, el.y);
          }
        }
      } else if (el.type === "arrow") {
        // API / Data Flow Arrow
        const { startX, startY, endX, endY } = el;
        const angle = Math.atan2(endY - startY, endX - startX);
        const headlen = 14;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Arrowhead
        ctx.beginPath();
        ctx.fillStyle = el.color;
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - headlen * Math.cos(angle - Math.PI / 6),
          endY - headlen * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          endX - headlen * Math.cos(angle + Math.PI / 6),
          endY - headlen * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();

        if (el.text) {
          ctx.font = "500 11px 'Outfit', Inter, sans-serif";
          ctx.fillStyle = "#ffffff";
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2;
          ctx.fillText(el.text, midX, midY - 6);
        }
      } else if (el.type === "text") {
        ctx.font = "600 16px 'Outfit', Inter, sans-serif";
        ctx.fillStyle = el.color || "#ffffff";
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(el.text || "Type here...", el.x, el.y);
      } else if (el.type === "sticky") {
        // Sticky Note
        ctx.fillStyle = el.bgColor || "#fef3c7";
        ctx.shadowColor = "rgba(0,0,0,0.35)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 4;

        ctx.beginPath();
        ctx.roundRect(el.x, el.y, el.w, el.h, 6);
        ctx.fill();

        ctx.shadowColor = "transparent";

        // Folded bottom corner accent
        ctx.fillStyle = "rgba(0,0,0,0.12)";
        ctx.beginPath();
        ctx.moveTo(el.x + el.w - 18, el.y + el.h);
        ctx.lineTo(el.x + el.w, el.y + el.h - 18);
        ctx.lineTo(el.x + el.w - 18, el.y + el.h - 18);
        ctx.closePath();
        ctx.fill();

        // Note Text
        ctx.fillStyle = el.textColor || "#78350f";
        ctx.font = "500 12px 'Outfit', Inter, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        const lines = (el.text || "Sticky Note").split("\n");
        lines.forEach((line, idx) => {
          ctx.fillText(line, el.x + 10, el.y + 12 + idx * 17, el.w - 20);
        });
      }

      // Selection Highlight
      if (selectedId && el.id === selectedId) {
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);

        let bx = el.x;
        let by = el.y;
        let bw = el.w || 0;
        let bh = el.h || 0;

        if (el.type === "circle") {
          bx = el.x - el.radius;
          by = el.y - el.radius;
          bw = el.radius * 2;
          bh = el.radius * 2;
        } else if (el.type === "arrow") {
          bx = Math.min(el.startX, el.endX) - 6;
          by = Math.min(el.startY, el.endY) - 6;
          bw = Math.abs(el.endX - el.startX) + 12;
          bh = Math.abs(el.endY - el.startY) + 12;
        } else if (el.type === "stroke" && el.points) {
          const xs = el.points.map((p) => p.x);
          const ys = el.points.map((p) => p.y);
          bx = Math.min(...xs) - 6;
          by = Math.min(...ys) - 6;
          bw = Math.max(...xs) - bx + 6;
          bh = Math.max(...ys) - by + 6;
        } else if (el.type === "text") {
          bw = el.w || 140;
          bh = 26;
          by = el.y - 20;
        }

        ctx.strokeRect(bx - 4, by - 4, bw + 8, bh + 8);
        ctx.setLineDash([]);
      }

      ctx.restore();
    }

    ctx.restore();
  }, [pan, zoom, elements, currentDraft, selectedId]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => renderCanvas();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [renderCanvas]);

  // -------------------------------------------------------------
  // 5. Mouse & Touch Event Handlers
  // -------------------------------------------------------------
  const handleMouseDown = (e) => {
    // Middle click or Space held triggers pan
    if (e.button === 1 || activeTool === "hand") {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    const pt = getCanvasPoint(e);

    // Eraser tool
    if (activeTool === "eraser") {
      const hit = elements.slice().reverse().find((el) => hitTest(pt, el));
      if (hit) {
        const next = elements.filter((el) => el.id !== hit.id);
        setElements(next);
        commitToHistory(next);
        socket?.emit("whiteboardDeleteElements", { roomId, elementIds: [hit.id] });
      }
      return;
    }

    // Select tool
    if (activeTool === "select") {
      const hit = elements.slice().reverse().find((el) => hitTest(pt, el));
      if (hit) {
        setSelectedId(hit.id);
        setIsPanning(false);
        setDragOffset({
          x: pt.x - (hit.x ?? hit.startX ?? 0),
          y: pt.y - (hit.y ?? hit.startY ?? 0),
        });
      } else {
        setSelectedId(null);
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
      return;
    }

    // Drawing Tools
    const newId = `elem_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    if (activeTool === "pen") {
      setCurrentDraft({
        id: newId,
        type: "stroke",
        points: [pt],
        color: strokeColor,
        width: strokeWidth,
      });
    } else if (activeTool === "rect") {
      setCurrentDraft({
        id: newId,
        type: "rect",
        x: pt.x,
        y: pt.y,
        w: 0,
        h: 0,
        startX: pt.x,
        startY: pt.y,
        color: strokeColor,
        width: strokeWidth,
        filled: isFilled,
        text: "",
      });
    } else if (activeTool === "cylinder") {
      setCurrentDraft({
        id: newId,
        type: "cylinder",
        x: pt.x,
        y: pt.y,
        w: 0,
        h: 0,
        startX: pt.x,
        startY: pt.y,
        color: strokeColor,
        width: strokeWidth,
        filled: isFilled,
        text: "",
      });
    } else if (activeTool === "circle") {
      setCurrentDraft({
        id: newId,
        type: "circle",
        x: pt.x,
        y: pt.y,
        radius: 0,
        color: strokeColor,
        width: strokeWidth,
        filled: isFilled,
        text: "",
      });
    } else if (activeTool === "arrow") {
      setCurrentDraft({
        id: newId,
        type: "arrow",
        startX: pt.x,
        startY: pt.y,
        endX: pt.x,
        endY: pt.y,
        color: strokeColor,
        width: strokeWidth,
        text: "",
      });
    } else if (activeTool === "text") {
      setEditingText({
        id: newId,
        x: pt.x,
        y: pt.y,
        text: "",
        isNew: true,
      });
      setActiveTool("select");
    } else if (activeTool === "sticky") {
      const chosenColor = STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)];
      const newSticky = {
        id: newId,
        type: "sticky",
        x: pt.x - 70,
        y: pt.y - 60,
        w: 150,
        h: 130,
        text: "Architecture Note\n• Add details here",
        bgColor: chosenColor.bg,
        textColor: chosenColor.text,
      };
      const next = [...elements, newSticky];
      setElements(next);
      commitToHistory(next);
      socket?.emit("whiteboardDraw", { roomId, element: newSticky });
      setSelectedId(newId);
      setActiveTool("select");
    }
  };

  const handleMouseMove = (e) => {
    handleMouseMoveBroadcast(e);

    // Canvas panning
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    const pt = getCanvasPoint(e);

    // Moving a selected element
    if (activeTool === "select" && selectedId && e.buttons === 1) {
      setElements((prev) =>
        prev.map((el) => {
          if (el.id !== selectedId) return el;
          if (el.type === "arrow") {
            const dx = el.endX - el.startX;
            const dy = el.endY - el.startY;
            const newStartX = pt.x - dragOffset.x;
            const newStartY = pt.y - dragOffset.y;
            return {
              ...el,
              startX: newStartX,
              startY: newStartY,
              endX: newStartX + dx,
              endY: newStartY + dy,
            };
          }
          if (el.type === "stroke") {
            const minX = Math.min(...el.points.map((p) => p.x));
            const minY = Math.min(...el.points.map((p) => p.y));
            const shiftX = pt.x - dragOffset.x - minX;
            const shiftY = pt.y - dragOffset.y - minY;
            return {
              ...el,
              points: el.points.map((p) => ({ x: p.x + shiftX, y: p.y + shiftY })),
            };
          }
          return {
            ...el,
            x: pt.x - dragOffset.x,
            y: pt.y - dragOffset.y,
          };
        })
      );
      return;
    }

    // Continuous Eraser Drag
    if (activeTool === "eraser" && e.buttons === 1) {
      const hit = elements.slice().reverse().find((el) => hitTest(pt, el));
      if (hit) {
        const next = elements.filter((el) => el.id !== hit.id);
        setElements(next);
        socket?.emit("whiteboardDeleteElements", { roomId, elementIds: [hit.id] });
      }
      return;
    }

    // Updating temporary draft shapes
    if (!currentDraft) return;

    if (currentDraft.type === "stroke") {
      setCurrentDraft((prev) => ({
        ...prev,
        points: [...prev.points, pt],
      }));
    } else if (currentDraft.type === "rect" || currentDraft.type === "cylinder") {
      const w = pt.x - currentDraft.startX;
      const h = pt.y - currentDraft.startY;
      setCurrentDraft((prev) => ({
        ...prev,
        x: w < 0 ? pt.x : prev.startX,
        y: h < 0 ? pt.y : prev.startY,
        w: Math.abs(w),
        h: Math.abs(h),
      }));
    } else if (currentDraft.type === "circle") {
      const r = Math.hypot(pt.x - currentDraft.x, pt.y - currentDraft.y);
      setCurrentDraft((prev) => ({
        ...prev,
        radius: r,
      }));
    } else if (currentDraft.type === "arrow") {
      setCurrentDraft((prev) => ({
        ...prev,
        endX: pt.x,
        endY: pt.y,
      }));
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (activeTool === "select" && selectedId) {
      const moved = elements.find((el) => el.id === selectedId);
      if (moved) {
        commitToHistory(elements);
        socket?.emit("whiteboardUpdateElement", { roomId, element: moved });
      }
      return;
    }

    if (!currentDraft) return;

    let valid = true;
    if (currentDraft.type === "rect" || currentDraft.type === "cylinder") {
      if (currentDraft.w < 10 && currentDraft.h < 10) valid = false;
    } else if (currentDraft.type === "circle") {
      if (currentDraft.radius < 8) valid = false;
    } else if (currentDraft.type === "arrow") {
      if (Math.hypot(currentDraft.endX - currentDraft.startX, currentDraft.endY - currentDraft.startY) < 10) {
        valid = false;
      }
    } else if (currentDraft.type === "stroke") {
      if (currentDraft.points.length < 2) valid = false;
    }

    if (valid) {
      const next = [...elements, currentDraft];
      setElements(next);
      commitToHistory(next);
      socket?.emit("whiteboardDraw", { roomId, element: currentDraft });
    }

    setCurrentDraft(null);
  };

  // Zooming with Wheel
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = 1.08;
    let newZoom = e.deltaY < 0 ? zoom * zoomFactor : zoom / zoomFactor;
    newZoom = Math.min(Math.max(0.2, newZoom), 3.5);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
    const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  // Double Click: Inline Text Editing
  const handleDoubleClick = (e) => {
    const pt = getCanvasPoint(e);
    const hit = elements.slice().reverse().find((el) => hitTest(pt, el));
    if (hit) {
      setEditingText({
        id: hit.id,
        x: hit.x ?? hit.startX,
        y: hit.y ?? hit.startY,
        text: hit.text || "",
        type: hit.type,
      });
    }
  };

  // Commit inline text label
  const handleCommitText = () => {
    if (!editingText) return;

    if (editingText.isNew) {
      if (editingText.text.trim()) {
        const newTextEl = {
          id: editingText.id,
          type: "text",
          x: editingText.x,
          y: editingText.y,
          text: editingText.text,
          color: strokeColor,
          w: editingText.text.length * 10 + 20,
          h: 24,
        };
        const next = [...elements, newTextEl];
        setElements(next);
        commitToHistory(next);
        socket?.emit("whiteboardDraw", { roomId, element: newTextEl });
      }
    } else {
      const updated = elements.map((el) =>
        el.id === editingText.id ? { ...el, text: editingText.text } : el
      );
      setElements(updated);
      commitToHistory(updated);
      const changedEl = updated.find((el) => el.id === editingText.id);
      if (changedEl) {
        socket?.emit("whiteboardUpdateElement", { roomId, element: changedEl });
      }
    }

    setEditingText(null);
  };

  // -------------------------------------------------------------
  // 6. Global Keyboard Shortcuts
  // -------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedId) {
          const next = elements.filter((el) => el.id !== selectedId);
          setElements(next);
          commitToHistory(next);
          socket?.emit("whiteboardDeleteElements", { roomId, elementIds: [selectedId] });
          setSelectedId(null);
        }
      }

      const key = e.key.toLowerCase();
      if (key === "v") setActiveTool("select");
      else if (key === "h") setActiveTool("hand");
      else if (key === "p") setActiveTool("pen");
      else if (key === "r") setActiveTool("rect");
      else if (key === "d") setActiveTool("cylinder");
      else if (key === "c") setActiveTool("circle");
      else if (key === "a") setActiveTool("arrow");
      else if (key === "t") setActiveTool("text");
      else if (key === "s") setActiveTool("sticky");
      else if (key === "e") setActiveTool("eraser");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, elements, historyIndex, history]);

  // -------------------------------------------------------------
  // 7. Actions: Undo, Redo, Clear, Export, Share
  // -------------------------------------------------------------
  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIdx = historyIndex - 1;
      const state = history[nextIdx];
      setHistoryIndex(nextIdx);
      setElements(state);
      socket?.emit("whiteboardSendSync", { roomId, snapshot: state });
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      const state = history[nextIdx];
      setHistoryIndex(nextIdx);
      setElements(state);
      socket?.emit("whiteboardSendSync", { roomId, snapshot: state });
    }
  };

  const handleClearCanvas = () => {
    setElements([]);
    setHistory([[]]);
    setHistoryIndex(0);
    setSelectedId(null);
    setShowClearModal(false);
    socket?.emit("whiteboardClear", { roomId });
  };

  // -------------------------------------------------------------
  // 8. AI Architect: Generate Architecture from LLM Prompt
  // -------------------------------------------------------------
  const handleGenerateAi = async (overridePrompt) => {
    const promptToUse = overridePrompt || aiPrompt;
    if (!promptToUse.trim()) return;

    setIsGeneratingAi(true);
    setAiStatusMsg("Designing architecture with Llama 3.3 / Gemini 2.0 Flash...");

    try {
      // Calculate offset so new diagram appears neatly in current canvas view
      const canvas = canvasRef.current;
      const viewW = canvas ? canvas.clientWidth : 1000;
      const viewH = canvas ? canvas.clientHeight : 700;
      const targetX = Math.round(-pan.x / zoom + (viewW / 2 / zoom) - 380);
      const targetY = Math.round(-pan.y / zoom + (viewH / 2 / zoom) - 160);

      const res = await axios.post(`${BASE_URL}/whiteboard/ai-generate`, {
        prompt: promptToUse,
        userApiKey: userApiKey.trim() || undefined,
        offsetX: Math.max(50, targetX),
        offsetY: Math.max(80, targetY),
      });

      if (res.data && res.data.success && Array.isArray(res.data.elements)) {
        const generated = res.data.elements;
        const nextElements = [...elements, ...generated];
        setElements(nextElements);
        commitToHistory(nextElements);

        // Sync with all peers in room
        socket?.emit("whiteboardSendSync", { roomId, snapshot: nextElements });

        setShowAiModal(false);
        setAiPrompt("");
        setAiStatusMsg("");
      } else {
        setAiStatusMsg(res.data?.message || "Could not parse architecture diagram.");
      }
    } catch (err) {
      console.error("AI Generation error:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to generate diagram. If OpenRouter is busy, use a template chip or provide your free key.";
      setAiStatusMsg(errorMsg);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSaveApiKey = (key) => {
    setUserApiKey(key);
    localStorage.setItem("openrouter_api_key", key);
  };

  const handleExportPNG = () => {
    if (elements.length === 0) return;

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    elements.forEach((el) => {
      if (el.type === "circle") {
        minX = Math.min(minX, el.x - el.radius);
        minY = Math.min(minY, el.y - el.radius);
        maxX = Math.max(maxX, el.x + el.radius);
        maxY = Math.max(maxY, el.y + el.radius);
      } else if (el.type === "arrow") {
        minX = Math.min(minX, el.startX, el.endX);
        minY = Math.min(minY, el.startY, el.endY);
        maxX = Math.max(maxX, el.startX, el.endX);
        maxY = Math.max(maxY, el.startY, el.endY);
      } else if (el.type === "stroke" && el.points) {
        el.points.forEach((p) => {
          minX = Math.min(minX, p.x);
          minY = Math.min(minY, p.y);
          maxX = Math.max(maxX, p.x);
          maxY = Math.max(maxY, p.y);
        });
      } else {
        minX = Math.min(minX, el.x);
        minY = Math.min(minY, el.y);
        maxX = Math.max(maxX, el.x + (el.w || 100));
        maxY = Math.max(maxY, el.y + (el.h || 50));
      }
    });

    const padding = 60;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;
    const w = Math.max(400, maxX - minX);
    const h = Math.max(300, maxY - minY);

    const offCanvas = document.createElement("canvas");
    const dpr = 2;
    offCanvas.width = w * dpr;
    offCanvas.height = h * dpr;
    const ctx = offCanvas.getContext("2d");
    ctx.scale(dpr, dpr);

    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    for (let gx = 0; gx < w; gx += 28) {
      for (let gy = 0; gy < h; gy += 28) {
        ctx.beginPath();
        ctx.arc(gx, gy, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.translate(-minX, -minY);

    elements.forEach((el) => {
      ctx.save();
      ctx.strokeStyle = el.color || "#06b6d4";
      ctx.lineWidth = el.width || 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (el.type === "stroke" && el.points?.length > 1) {
        ctx.beginPath();
        ctx.moveTo(el.points[0].x, el.points[0].y);
        for (let i = 1; i < el.points.length - 1; i++) {
          const xc = (el.points[i].x + el.points[i + 1].x) / 2;
          const yc = (el.points[i].y + el.points[i + 1].y) / 2;
          ctx.quadraticCurveTo(el.points[i].x, el.points[i].y, xc, yc);
        }
        ctx.stroke();
      } else if (el.type === "rect") {
        if (el.filled) {
          ctx.fillStyle = `${el.color}18`;
          ctx.beginPath();
          ctx.roundRect(el.x, el.y, el.w, el.h, 8);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.roundRect(el.x, el.y, el.w, el.h, 8);
        ctx.stroke();
        if (el.text) {
          ctx.font = "600 14px 'Outfit', Inter, sans-serif";
          ctx.fillStyle = el.color;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const lines = el.text.split("\n");
          if (lines.length > 1) {
            lines.forEach((line, idx) => {
              ctx.fillText(line, el.x + el.w / 2, el.y + el.h / 2 - 8 + idx * 16);
            });
          } else {
            ctx.fillText(el.text, el.x + el.w / 2, el.y + el.h / 2);
          }
        }
      } else if (el.type === "cylinder") {
        const rY = Math.min(18, el.h / 4);
        if (el.filled) {
          ctx.fillStyle = `${el.color}18`;
          ctx.beginPath();
          ctx.ellipse(el.x + el.w / 2, el.y + rY, el.w / 2, rY, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.rect(el.x, el.y + rY, el.w, el.h - rY * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(el.x + el.w / 2, el.y + el.h - rY, el.w / 2, rY, 0, 0, Math.PI);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.ellipse(el.x + el.w / 2, el.y + rY, el.w / 2, rY, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(el.x, el.y + rY);
        ctx.lineTo(el.x, el.y + el.h - rY);
        ctx.moveTo(el.x + el.w, el.y + rY);
        ctx.lineTo(el.x + el.w, el.y + el.h - rY);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(el.x + el.w / 2, el.y + el.h - rY, el.w / 2, rY, 0, 0, Math.PI);
        ctx.stroke();
        if (el.text) {
          ctx.font = "600 14px 'Outfit', Inter, sans-serif";
          ctx.fillStyle = el.color;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const lines = el.text.split("\n");
          if (lines.length > 1) {
            lines.forEach((line, idx) => {
              ctx.fillText(line, el.x + el.w / 2, el.y + el.h / 2 - 8 + idx * 16);
            });
          } else {
            ctx.fillText(el.text, el.x + el.w / 2, el.y + el.h / 2);
          }
        }
      } else if (el.type === "circle") {
        if (el.filled) {
          ctx.fillStyle = `${el.color}18`;
          ctx.beginPath();
          ctx.arc(el.x, el.y, el.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(el.x, el.y, el.radius, 0, Math.PI * 2);
        ctx.stroke();
        if (el.text) {
          ctx.font = "600 14px 'Outfit', Inter, sans-serif";
          ctx.fillStyle = el.color;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const lines = el.text.split("\n");
          if (lines.length > 1) {
            lines.forEach((line, idx) => {
              ctx.fillText(line, el.x, el.y - 7 + idx * 15);
            });
          } else {
            ctx.fillText(el.text, el.x, el.y);
          }
        }
      } else if (el.type === "arrow") {
        const angle = Math.atan2(el.endY - el.startY, el.endX - el.startX);
        ctx.beginPath();
        ctx.moveTo(el.startX, el.startY);
        ctx.lineTo(el.endX, el.endY);
        ctx.stroke();
        ctx.beginPath();
        ctx.fillStyle = el.color;
        ctx.moveTo(el.endX, el.endY);
        ctx.lineTo(el.endX - 14 * Math.cos(angle - Math.PI / 6), el.endY - 14 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(el.endX - 14 * Math.cos(angle + Math.PI / 6), el.endY - 14 * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      } else if (el.type === "sticky") {
        ctx.fillStyle = el.bgColor || "#fef3c7";
        ctx.beginPath();
        ctx.roundRect(el.x, el.y, el.w, el.h, 6);
        ctx.fill();
        ctx.fillStyle = el.textColor || "#78350f";
        ctx.font = "500 13px 'Outfit', Inter, sans-serif";
        const lines = (el.text || "").split("\n");
        lines.forEach((l, idx) => {
          ctx.fillText(l, el.x + 10, el.y + 16 + idx * 18, el.w - 20);
        });
      } else if (el.type === "text") {
        ctx.font = "600 16px 'Outfit', Inter, sans-serif";
        ctx.fillStyle = el.color || "#ffffff";
        ctx.fillText(el.text || "", el.x, el.y);
      }
      ctx.restore();
    });

    const link = document.createElement("a");
    link.download = `devnet_architecture_${roomId.slice(0, 8)}.png`;
    link.href = offCanvas.toDataURL("image/png");
    link.click();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full bg-[#0a0e17] text-white flex flex-col select-none overflow-hidden font-sans z-[9999]"
    >
      {/* -------------------------------------------------------------
          TOP BAR: Navigation, Room details, Collaborators, Actions
      -------------------------------------------------------------- */}
      <header className="h-14 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-4 flex items-center justify-between z-20 shrink-0 shadow-lg">
        {/* Left: Back & Room Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl gap-1.5"
            title="Back to previous page"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline font-medium">Back</span>
          </button>

          <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              DevNet Architecture Canvas
            </span>
            <span className="badge badge-neutral bg-slate-800 text-slate-400 border-slate-700 text-xs font-mono hidden md:inline truncate max-w-[120px]">
              {roomId.slice(0, 8)}...
            </span>
          </div>
        </div>

        {/* Center: Undo / Redo & Clear Canvas */}
        <div className="flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/50">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="btn btn-ghost btn-xs text-slate-300 hover:text-white disabled:opacity-30 rounded-lg p-1.5"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={15} />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="btn btn-ghost btn-xs text-slate-300 hover:text-white disabled:opacity-30 rounded-lg p-1.5"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={15} />
          </button>
          <div className="w-px h-3.5 bg-slate-700 mx-0.5"></div>
          <button
            onClick={() => setShowClearModal(true)}
            className="btn btn-ghost btn-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg p-1.5"
            title="Clear canvas"
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* Right: Collaborators & Export / Share */}
        <div className="flex items-center gap-2.5">
          {/* Active Devs Count */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/70 border border-slate-700 rounded-xl text-xs font-medium text-emerald-400 shadow-inner"
            title={`${collaboratorCount} developer${collaboratorCount > 1 ? "s" : ""} connected in this room`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <Users size={13} className="text-slate-400" />
            <span className="hidden sm:inline">
              {collaboratorCount} {collaboratorCount === 1 ? "Dev" : "Devs"} Live
            </span>
          </div>

          {/* Export PNG */}
          <button
            onClick={handleExportPNG}
            className="btn btn-xs sm:btn-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 rounded-xl gap-1.5 shadow-sm"
            title="Export high-resolution diagram PNG"
          >
            <Download size={14} />
            <span className="hidden md:inline">Export</span>
          </button>

          {/* Copy Share Link */}
          <button
            onClick={handleCopyLink}
            className="btn btn-xs sm:btn-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0 rounded-xl gap-1.5 shadow-lg shadow-cyan-500/20"
            title="Copy whiteboard room link"
          >
            {copied ? <Check size={14} className="text-white" /> : <Share2 size={14} />}
            <span className="font-semibold">{copied ? "Copied!" : "Invite Partner"}</span>
          </button>
        </div>
      </header>

      {/* -------------------------------------------------------------
          FLOATING TOOLBAR: Tools, AI Architect, Palette, Stroke Width
      -------------------------------------------------------------- */}
      <div className="absolute top-18 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-900/90 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/60 max-w-[94vw] overflow-x-auto">
        {/* AI Architect Action Button */}
        <button
          onClick={() => setShowAiModal(true)}
          className="p-2 rounded-xl transition-all relative group bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 text-black font-bold shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 flex items-center gap-1.5 px-3"
          title="AI Architect - Generate architecture diagrams via free LLM"
        >
          <Sparkles size={16} className="animate-pulse" />
          <span className="text-xs font-extrabold tracking-wide uppercase">AI Architect</span>
        </button>

        <div className="w-px h-5 bg-slate-700/80 mx-1"></div>

        {/* Standard Canvas Tools */}
        <div className="flex items-center gap-1">
          {[
            { id: "select", icon: MousePointer, label: "Select (V)" },
            { id: "hand", icon: Hand, label: "Pan Canvas (H / Space)" },
            { id: "pen", icon: Pencil, label: "Freehand Pen (P)" },
            { id: "rect", icon: Square, label: "Service Box (R)" },
            { id: "cylinder", icon: Database, label: "Database Cylinder (D)" },
            { id: "circle", icon: Circle, label: "Worker / Queue (C)" },
            { id: "arrow", icon: ArrowRight, label: "Data Flow Arrow (A)" },
            { id: "text", icon: Type, label: "Text Label (T)" },
            { id: "sticky", icon: StickyNote, label: "Sticky Note (S)" },
            { id: "eraser", icon: Eraser, label: "Eraser (E)" },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTool === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTool(item.id);
                  if (item.id !== "select") setSelectedId(null);
                }}
                className={`p-2 rounded-xl transition-all relative group ${
                  isActive
                    ? "bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-500/30 scale-105"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                }`}
                title={item.label}
              >
                <Icon size={17} />
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-950 text-slate-200 text-[10px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-800 shadow-md">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="w-px h-5 bg-slate-700/80 mx-1"></div>

        {/* Color Palette */}
        <div className="flex items-center gap-1">
          {PALETTE.map((c) => (
            <button
              key={c.name}
              onClick={() => setStrokeColor(c.value)}
              className={`w-6 h-6 rounded-full transition-transform ${
                strokeColor === c.value
                  ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110"
                  : "opacity-75 hover:opacity-100 hover:scale-105"
              }`}
              style={{ backgroundColor: c.value }}
              title={c.name}
            />
          ))}
        </div>

        <div className="w-px h-5 bg-slate-700/80 mx-1"></div>

        {/* Stroke Width Selector */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-xl">
          {STROKE_WIDTHS.map((sw) => (
            <button
              key={sw.label}
              onClick={() => setStrokeWidth(sw.value)}
              className={`px-2 py-1 text-xs rounded-lg font-mono transition-colors ${
                strokeWidth === sw.value
                  ? "bg-cyan-500 text-black font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title={`Stroke width: ${sw.value}px`}
            >
              {sw.label}
            </button>
          ))}
        </div>

        {/* Fill Toggle */}
        <button
          onClick={() => setIsFilled(!isFilled)}
          className={`px-2.5 py-1 text-xs rounded-xl font-medium border transition-colors ${
            isFilled
              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
              : "bg-slate-800/80 text-slate-400 border-slate-700"
          }`}
          title="Toggle semi-transparent shape fill"
        >
          {isFilled ? "Filled" : "Outline"}
        </button>
      </div>

      {/* -------------------------------------------------------------
          BOTTOM-LEFT: Pan & Zoom Controls
      -------------------------------------------------------------- */}
      <div className="absolute bottom-5 left-5 z-20 flex items-center gap-1.5 p-1 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl">
        <button
          onClick={() => setZoom((z) => Math.max(0.2, z / 1.2))}
          className="btn btn-ghost btn-xs text-slate-300 hover:text-white p-1.5 rounded-xl"
          title="Zoom Out"
        >
          <ZoomOut size={15} />
        </button>

        <button
          onClick={handleResetZoom}
          className="px-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
          title="Reset Zoom to 100%"
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          onClick={() => setZoom((z) => Math.min(3.5, z * 1.2))}
          className="btn btn-ghost btn-xs text-slate-300 hover:text-white p-1.5 rounded-xl"
          title="Zoom In"
        >
          <ZoomIn size={15} />
        </button>

        <div className="w-px h-3.5 bg-slate-700 mx-0.5"></div>

        <button
          onClick={handleResetZoom}
          className="btn btn-ghost btn-xs text-slate-400 hover:text-white p-1.5 rounded-xl"
          title="Reset canvas center"
        >
          <RotateCcw size={13} />
        </button>
      </div>

      {/* -------------------------------------------------------------
          CANVAS VIEWPORT & MULTIPLAYER CURSORS
      -------------------------------------------------------------- */}
      <div className="flex-1 relative w-full h-full overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          onWheel={handleWheel}
          className={`w-full h-full block ${
            activeTool === "hand" || isPanning
              ? "cursor-grab active:cursor-grabbing"
              : activeTool === "select"
              ? "cursor-default"
              : activeTool === "eraser"
              ? "cursor-pointer"
              : "cursor-crosshair"
          }`}
        />

        {/* Collaborators Live Cursors Overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Object.entries(collaborators).map(([peerId, cursor]) => {
            const screenPt = canvasToScreen(cursor.x, cursor.y);
            return (
              <div
                key={peerId}
                style={{
                  transform: `translate(${screenPt.x}px, ${screenPt.y}px)`,
                }}
                className="absolute top-0 left-0 transition-transform duration-75 ease-out pointer-events-none"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill={cursor.color || "#06b6d4"}
                  className="filter drop-shadow-md"
                >
                  <path
                    d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
                    stroke="#000000"
                    strokeWidth="1.2"
                  />
                </svg>
                <span
                  style={{ backgroundColor: cursor.color || "#06b6d4" }}
                  className="text-black font-bold text-[11px] px-2 py-0.5 rounded-full shadow-lg ml-3 -mt-2 inline-block whitespace-nowrap border border-black/20"
                >
                  {cursor.name || "Peer"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Inline Double-Click Text Input */}
        {editingText && (
          <div
            style={{
              left: `${canvasToScreen(editingText.x, editingText.y).x}px`,
              top: `${canvasToScreen(editingText.x, editingText.y).y}px`,
            }}
            className="absolute z-30 -translate-x-2 -translate-y-2"
          >
            <div className="bg-slate-900/95 border border-cyan-500 rounded-xl p-2 shadow-2xl backdrop-blur-md flex flex-col gap-2 min-w-[200px]">
              <span className="text-[11px] font-medium text-cyan-400 uppercase tracking-wider">
                {editingText.isNew ? "Enter Label" : "Edit Component Name"}
              </span>
              <textarea
                autoFocus
                rows={2}
                value={editingText.text}
                onChange={(e) =>
                  setEditingText((prev) => ({ ...prev, text: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleCommitText();
                  } else if (e.key === "Escape") {
                    setEditingText(null);
                  }
                }}
                placeholder="e.g. Auth Service, Postgres DB..."
                className="bg-slate-950 text-white text-sm p-2 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-400 resize-none font-sans"
              />
              <div className="flex items-center justify-end gap-1.5">
                <button
                  onClick={() => setEditingText(null)}
                  className="btn btn-ghost btn-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCommitText}
                  className="btn btn-primary btn-xs bg-cyan-500 hover:bg-cyan-400 text-black font-semibold border-0"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------
          AI ARCHITECT MODAL (100% Free OpenRouter Models)
      -------------------------------------------------------------- */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900/95 border border-slate-700/90 rounded-3xl p-6 max-w-xl w-full shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl flex flex-col gap-4">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    AI Architect
                    <span className="badge badge-sm bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] uppercase font-mono">
                      100% Free LLM
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Powered by OpenRouter Free Tier (Llama 3.3 70B & Gemini 2.0 Flash)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="btn btn-ghost btn-xs text-slate-400 hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Instant System Design Templates:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPT_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => {
                      setAiPrompt(chip.prompt);
                      handleGenerateAi(chip.prompt);
                    }}
                    disabled={isGeneratingAi}
                    className="btn btn-xs bg-slate-800/80 hover:bg-cyan-500/20 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 border-slate-700/80 rounded-xl transition-all font-medium disabled:opacity-50"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Prompt Textarea */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Or describe custom architecture:
              </label>
              <textarea
                rows={3}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleGenerateAi();
                  }
                }}
                disabled={isGeneratingAi}
                placeholder="e.g. Design a video streaming platform with S3 storage, transcoding worker, Cloudflare CDN, and MongoDB..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-sans resize-none"
              />
              <span className="text-[10px] text-slate-500 flex justify-between">
                <span>Tip: Press Ctrl+Enter to generate</span>
                <span>Auto-generates microservices, queues, DBs, and arrows</span>
              </span>
            </div>

            {/* Status Message / Loading Feedback */}
            {aiStatusMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  isGeneratingAi
                    ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30"
                    : "bg-rose-500/10 text-rose-300 border border-rose-500/30"
                }`}
              >
                {isGeneratingAi && <Loader2 size={15} className="animate-spin shrink-0" />}
                <span>{aiStatusMsg}</span>
              </div>
            )}

            {/* Optional Free OpenRouter Key Collapsible */}
            <div className="border-t border-slate-800/80 pt-3">
              <button
                type="button"
                onClick={() => setShowKeyConfig(!showKeyConfig)}
                className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors font-medium"
              >
                <Key size={13} />
                <span>{showKeyConfig ? "Hide OpenRouter API Key Settings" : "Use Custom OpenRouter Key (Optional)"}</span>
              </button>

              {showKeyConfig && (
                <div className="mt-2 p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Free OpenRouter API Key:</span>
                    <a
                      href="https://openrouter.ai/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline"
                    >
                      Get free key at openrouter.ai/keys ↗
                    </a>
                  </div>
                  <input
                    type="password"
                    value={userApiKey}
                    onChange={(e) => handleSaveApiKey(e.target.value)}
                    placeholder="sk-or-v1-..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">
                    Saved securely in your browser's localStorage. Free models cost $0 and require $0 credits.
                  </span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                disabled={isGeneratingAi}
                className="btn btn-sm btn-ghost text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleGenerateAi()}
                disabled={isGeneratingAi || !aiPrompt.trim()}
                className="btn btn-sm bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-black font-bold border-0 rounded-xl shadow-lg shadow-cyan-500/20 gap-2 disabled:opacity-50"
              >
                {isGeneratingAi ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Designing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    <span>Generate Architecture</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          CLEAR CANVAS CONFIRMATION MODAL
      -------------------------------------------------------------- */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Clear Architecture Canvas?</h3>
            <p className="text-sm text-slate-400 mb-6">
              This will remove all drawings and shapes for all active collaborators in this room. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowClearModal(false)}
                className="btn btn-sm btn-ghost text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleClearCanvas}
                className="btn btn-sm bg-rose-600 hover:bg-rose-500 text-white border-0 shadow-lg shadow-rose-600/20"
              >
                Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Whiteboard;