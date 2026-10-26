import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  MessageSquare,
  Layers,
  Globe,
  ArrowRight,
  Zap,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Terminal,
  Share2,
  RefreshCw,
  Send,
  CheckCheck,
  ExternalLink,
  Heart,
  X,
  Bot,
  Activity,
  Code2,
  ChevronRight,
  Database
} from "lucide-react";

const Landing = () => {
  const sandboxRef = useRef(null);

  // Active Sandbox Tab: 'match' | 'canvas' | 'chat'
  const [activeTab, setActiveTab] = useState("match");

  // Interactive Sandbox State: MatchMaker
  const [cardSwiped, setCardSwiped] = useState(null); // 'liked' | 'passed' | null
  const [matchSuccess, setMatchSuccess] = useState(false);

  // Interactive Sandbox State: AI Canvas
  const [aiTopologyIndex, setAiTopologyIndex] = useState(0);
  const [aiGenerating, setAiGenerating] = useState(false);

  const topologies = [
    {
      title: "E-Commerce Event-Driven Pipeline",
      model: "Llama 3.3 70B (OpenRouter Free)",
      nodes: [
        { name: "API Gateway", sub: ":8080 RateLimit", color: "text-primary", border: "border-primary" },
        { name: "Order Service", sub: "Express 5 API", color: "text-secondary", border: "border-secondary" },
        { name: "Kafka Stream", sub: "orders.topic", color: "text-warning", border: "border-warning" },
        { name: "PostgreSQL", sub: "Primary ACID", color: "text-success", border: "border-success" },
        { name: "Redis Cache", sub: "Sub-1ms State", color: "text-accent", border: "border-accent" }
      ]
    },
    {
      title: "Real-Time WebSocket Gateway",
      model: "Gemini 2.0 Flash (OpenRouter Free)",
      nodes: [
        { name: "Cloudflare Edge", sub: "SSL Termination", color: "text-primary", border: "border-primary" },
        { name: "Socket.IO Cluster", sub: "Duplex Engine", color: "text-secondary", border: "border-secondary" },
        { name: "Redis Pub/Sub", sub: "Room Sync Bus", color: "text-warning", border: "border-warning" },
        { name: "MongoDB Atlas", sub: "Chat History", color: "text-success", border: "border-success" },
        { name: "Keep-Alive Cron", sub: "24/7 Heartbeat", color: "text-accent", border: "border-accent" }
      ]
    },
    {
      title: "Distributed Microservices Architecture",
      model: "Llama 3.3 70B (OpenRouter Free)",
      nodes: [
        { name: "Reverse Proxy", sub: "Nginx Ingress", color: "text-primary", border: "border-primary" },
        { name: "Auth Service", sub: "JWT Validation", color: "text-secondary", border: "border-secondary" },
        { name: "RabbitMQ Queue", sub: "Async Tasks", color: "text-warning", border: "border-warning" },
        { name: "Vector Canvas", sub: "SVG Co-Draw", color: "text-success", border: "border-success" },
        { name: "Resend Mailer", sub: "Non-blocking API", color: "text-accent", border: "border-accent" }
      ]
    }
  ];

  const handleNextTopology = () => {
    setAiGenerating(true);
    setTimeout(() => {
      setAiTopologyIndex((prev) => (prev + 1) % topologies.length);
      setAiGenerating(false);
    }, 600);
  };

  const handleCardSwipe = (type) => {
    setCardSwiped(type);
    if (type === "liked") {
      setMatchSuccess(true);
    }
    setTimeout(() => {
      setCardSwiped(null);
    }, 2800);
  };

  const scrollToSandbox = () => {
    if (sandboxRef.current) {
      sandboxRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const techStackPills = [
    "React 19",
    "Node.js",
    "Express 5",
    "Socket.IO",
    "MongoDB Atlas",
    "OpenRouter AI",
    "Framer Motion",
    "Vercel Edge",
    "Render",
    "Cloudflare",
    "Resend API",
    "Redux Toolkit"
  ];

  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-primary-content font-sans">

      {/* ============================================================== */}
      {/* 1. HERO SECTION (Mobbin-style Minimalist Authority)            */}
      {/* ============================================================== */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        
        {/* Ambient GPU Gradient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[440px] bg-gradient-to-tr from-primary/15 via-secondary/10 to-accent/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          {/* Top Live Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-base-200/80 border border-base-content/10 shadow-sm text-xs font-mono font-medium text-base-content/80 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="font-semibold text-base-content">DEVNET 2.0</span>
            <span className="text-base-content/40">•</span>
            <span>Real-Time Developer Network</span>
            <span className="badge badge-xs badge-primary font-mono text-[9px] uppercase px-1.5 py-0.5">Live</span>
          </div>

          {/* Core Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08]">
            Where Elite Developers <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Match, Collaborate & Ship.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base-content/70 text-base sm:text-lg leading-relaxed font-normal">
            Stop building in isolation. DevNet pairs you with engineers based on verified tech stack heuristics. 
            Brainstorm on collaborative vector whiteboards, scaffold architectures with free AI, and ship together.
          </p>

          {/* High-Impact Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              to="/signup"
              className="btn btn-primary btn-md sm:btn-lg w-full sm:w-auto font-black shadow-xl shadow-primary/25 px-8 group rounded-full"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={scrollToSandbox}
              className="btn btn-ghost btn-md sm:btn-lg w-full sm:w-auto font-bold border border-base-content/15 hover:bg-base-200/60 rounded-full flex items-center gap-2 text-base-content/85"
            >
              <Cpu className="w-4 h-4 text-primary" />
              <span>Explore Live Sandbox</span>
            </button>
          </div>

          {/* Recruiter Metrics Strip */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-6 text-xs font-mono text-base-content/60">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span>&lt; 50ms Socket.IO Sync</span>
            </div>
            <span className="hidden sm:inline text-base-content/20">•</span>
            <div className="flex items-center gap-2">
              <Bot className="w-3.5 h-3.5 text-accent" />
              <span>Free AI System Architect</span>
            </div>
            <span className="hidden sm:inline text-base-content/20">•</span>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-success" />
              <span>24/7 Zero Cold Starts</span>
            </div>
            <span className="hidden sm:inline text-base-content/20">•</span>
            <div className="flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-secondary" />
              <span>React 19 + Express 5</span>
            </div>
          </div>
        </motion.div>
      </section>


      {/* ============================================================== */}
      {/* 2. THE MOBBIN INTERACTIVE PRODUCT SANDBOX                      */}
      {/* ============================================================== */}
      <section ref={sandboxRef} className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="rounded-3xl bg-base-200/40 border border-base-content/15 shadow-2xl backdrop-blur-2xl overflow-hidden">
          
          {/* macOS-style Window Topbar */}
          <div className="px-5 py-3.5 bg-base-200/80 border-b border-base-content/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-error/80 inline-block" />
              <div className="w-3 h-3 rounded-full bg-warning/80 inline-block" />
              <div className="w-3 h-3 rounded-full bg-success/80 inline-block" />
              <span className="ml-2 font-mono text-xs text-base-content/50 font-medium hidden sm:inline">
                devnet-preview-v2.0 // live-sandbox
              </span>
            </div>

            {/* Interactive Tab Selectors */}
            <div className="flex items-center gap-1.5 p-1 bg-base-100/90 rounded-2xl border border-base-content/10 text-xs font-mono">
              <button
                onClick={() => setActiveTab("match")}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 font-bold ${
                  activeTab === "match"
                    ? "bg-primary text-primary-content shadow-sm"
                    : "text-base-content/60 hover:text-base-content"
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>MatchMaker</span>
              </button>

              <button
                onClick={() => setActiveTab("canvas")}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 font-bold ${
                  activeTab === "canvas"
                    ? "bg-accent text-accent-content shadow-sm"
                    : "text-base-content/60 hover:text-base-content"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>AI Architecture</span>
              </button>

              <button
                onClick={() => setActiveTab("chat")}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 font-bold ${
                  activeTab === "chat"
                    ? "bg-secondary text-secondary-content shadow-sm"
                    : "text-base-content/60 hover:text-base-content"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Socket Chat</span>
              </button>
            </div>
          </div>

          {/* Sandbox Content Viewport */}
          <div className="p-6 sm:p-10 min-h-[440px] flex items-center justify-center bg-base-100/60 relative overflow-hidden">
            
            {/* -------------------------------------------------------- */}
            {/* TAB 1: INTERACTIVE MATCHMAKER CARD                       */}
            {/* -------------------------------------------------------- */}
            {activeTab === "match" && (
              <div className="w-full max-w-md relative flex flex-col items-center">
                
                {/* Match Celebration Badge */}
                <AnimatePresence>
                  {matchSuccess && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0, y: -20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="absolute -top-12 z-20 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-success via-primary to-accent text-primary-content font-bold shadow-xl flex items-center gap-2 text-xs"
                    >
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>🎉 IT'S A MATCH! Socket Room #829 Provisioned!</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  animate={
                    cardSwiped === "liked"
                      ? { x: 260, opacity: 0, rotate: 12 }
                      : cardSwiped === "passed"
                      ? { x: -260, opacity: 0, rotate: -12 }
                      : { x: 0, opacity: 1, rotate: 0 }
                  }
                  transition={{ duration: 0.35 }}
                  className="w-full rounded-3xl bg-base-200/90 border border-base-content/15 p-6 shadow-2xl backdrop-blur-xl space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="badge badge-primary badge-outline text-[11px] font-bold font-mono">
                      Algorithmic Match
                    </span>
                    <span className="text-xs font-mono font-bold text-success flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-success inline-block animate-ping" />
                      98% Fit Score
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="avatar">
                      <div className="w-16 h-16 rounded-2xl ring-2 ring-primary/40 ring-offset-base-100 ring-offset-2">
                        <img 
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
                          alt="Sarah Chen" 
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-base-content flex items-center gap-1.5">
                        Sarah Chen
                        <ShieldCheck className="w-4 h-4 text-warning fill-warning/20" />
                      </h3>
                      <p className="text-xs text-base-content/70 font-medium">
                        Staff Distributed Systems Architect
                      </p>
                      <p className="text-[11px] text-primary font-mono font-semibold">
                        @sarah_systems • 4 yrs exp
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-base-content/80 leading-relaxed">
                    "Specializing in high-throughput Kafka streaming, Redis state & Express 5 clusters. 
                    Looking for a React frontend visionary to co-create a live collaborative dev ecosystem."
                  </p>

                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-base-content/50">
                      Verified Competencies
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {["React 19", "Node.js", "Express 5", "Socket.IO", "Redis", "Kafka", "MongoDB"].map((tech) => (
                        <span key={tech} className="px-2.5 py-0.5 rounded-lg bg-base-100 text-[11px] font-medium text-base-content/80 border border-base-content/10">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-center gap-5 pt-2 border-t border-base-content/10">
                    <button
                      onClick={() => handleCardSwipe("passed")}
                      className="btn btn-circle btn-error btn-outline hover:scale-110 transition-transform shadow-md"
                      title="Pass"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => handleCardSwipe("liked")}
                      className="btn btn-circle btn-success hover:scale-110 transition-transform shadow-lg shadow-success/30"
                      title="Connect / Interested"
                    >
                      <Heart className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                </motion.div>

                {cardSwiped && (
                  <button
                    onClick={() => { setCardSwiped(null); setMatchSuccess(false); }}
                    className="mt-3 text-xs font-mono text-primary hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset Mockup Card
                  </button>
                )}
              </div>
            )}


            {/* -------------------------------------------------------- */}
            {/* TAB 2: INTERACTIVE AI ARCHITECTURE CANVAS               */}
            {/* -------------------------------------------------------- */}
            {activeTab === "canvas" && (
              <div className="w-full max-w-2xl space-y-4">
                
                {/* AI Prompt Ribbon */}
                <div className="px-4 py-2.5 rounded-2xl bg-base-200/90 border border-accent/20 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Bot className={`w-4 h-4 text-accent ${aiGenerating ? "animate-spin" : ""}`} />
                    <span className="font-bold text-base-content truncate">
                      {topologies[aiTopologyIndex].title}
                    </span>
                    <span className="badge badge-accent badge-xs text-[9px]">
                      {topologies[aiTopologyIndex].model}
                    </span>
                  </div>

                  <button
                    onClick={handleNextTopology}
                    disabled={aiGenerating}
                    className="btn btn-xs btn-outline btn-accent font-mono gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${aiGenerating ? "animate-spin" : ""}`} />
                    <span>{aiGenerating ? "Generating..." : "Regenerate AI"}</span>
                  </button>
                </div>

                {/* Vector Canvas Preview Box */}
                <div className="p-6 rounded-3xl bg-base-200/70 border border-base-content/15 shadow-inner relative overflow-hidden">
                  
                  {/* Subtle Canvas Dot Grid */}
                  <div className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                      backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
                      backgroundSize: "16px 16px"
                    }}
                  />

                  {/* Dynamic Nodes Grid */}
                  <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {topologies[aiTopologyIndex].nodes.map((node, i) => (
                      <div
                        key={i}
                        className={`p-3.5 rounded-2xl bg-base-100/90 border ${node.border} shadow-lg space-y-1 transition-all hover:scale-105`}
                      >
                        <div className={`text-xs font-bold font-mono ${node.color}`}>
                          {node.name}
                        </div>
                        <div className="text-[10px] text-base-content/60 font-mono">
                          {node.sub}
                        </div>
                      </div>
                    ))}

                    <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/30 flex flex-col justify-center items-center text-center">
                      <div className="text-xs font-bold text-primary font-mono">2 Active Cursors</div>
                      <div className="text-[10px] text-base-content/60 font-mono">Sub-50ms sync</div>
                    </div>
                  </div>

                  {/* SVG Connector Flow Simulation */}
                  <div className="mt-4 pt-3 border-t border-base-content/10 flex items-center justify-between text-[11px] font-mono text-base-content/60">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-success inline-block animate-ping" />
                      Duplex WebSocket Packet Pipe Active
                    </span>

                    <Link
                      to="/whiteboard/demo_room"
                      className="btn btn-xs btn-primary font-mono gap-1"
                    >
                      <span>Open Live Whiteboard</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            )}


            {/* -------------------------------------------------------- */}
            {/* TAB 3: SUB-50MS SOCKET CHAT PREVIEW                      */}
            {/* -------------------------------------------------------- */}
            {activeTab === "chat" && (
              <div className="w-full max-w-md rounded-3xl bg-base-200/90 border border-base-content/15 p-5 shadow-2xl backdrop-blur-xl flex flex-col justify-between h-[360px]">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-base-content/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center font-bold text-xs text-secondary ring-1 ring-secondary">
                      SC
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">Sarah Chen</div>
                      <div className="text-[10px] text-success flex items-center gap-1 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                        online • duplex socket connected
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-xs badge-ghost font-mono text-[9px]">ROOM #829</span>
                </div>

                {/* Messages */}
                <div className="flex-1 py-3 space-y-2.5 overflow-y-auto text-xs">
                  <div className="bg-base-100 p-3 rounded-2xl rounded-tl-none max-w-[85%] text-base-content/90 border border-base-content/5">
                    Hey! Loved your distributed locking proposal. Shall we scaffold the microservices flow on the canvas?
                  </div>

                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-content p-3 rounded-2xl rounded-tr-none max-w-[85%] shadow-md">
                      100%! Opening whiteboard now. Let's ask AI Architect to scaffold Kafka + PostgreSQL in 1 click.
                    </div>
                  </div>

                  <div className="flex justify-end text-[10px] text-primary items-center gap-1 font-mono">
                    <span>Delivered & Seen (18ms)</span>
                    <CheckCheck className="w-3.5 h-3.5 text-primary" />
                  </div>

                  {/* Typing Simulator */}
                  <div className="flex items-center gap-1 bg-base-100 p-2 rounded-xl w-14 border border-base-content/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>

                {/* Input Bar */}
                <div className="pt-2 border-t border-base-content/10 flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    placeholder="Socket duplex active (sub-50ms)..."
                    className="input input-sm input-bordered flex-1 font-mono text-xs bg-base-100"
                  />
                  <button className="btn btn-sm btn-circle btn-primary">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Sandbox Footer Info Strip */}
          <div className="px-5 py-3 bg-base-200/90 border-t border-base-content/10 flex flex-wrap items-center justify-between text-xs text-base-content/60 font-mono gap-2">
            <span>✨ Live interactive components embedded directly in the production client</span>
            <div className="flex items-center gap-4">
              <span className="text-success font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Zero Cold Starts
              </span>
              <span className="text-primary font-bold">100% Free Cloud Tier</span>
            </div>
          </div>
        </div>
      </section>


      {/* ============================================================== */}
      {/* 3. MOBBIN BENTO GRID (4 CORE ENGINEERING PILLARS)              */}
      {/* ============================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
            <Cpu className="w-3.5 h-3.5" />
            Core Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Engineered For The Modern Software Craftsperson
          </h2>
          <p className="text-base-content/70 text-sm">
            Every feature in DevNet is built from first principles to remove friction between meeting an engineer and shipping production code.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1: MatchMaker Heuristics (Spans 2 cols) */}
          <motion.div
            whileHover={{ y: -4 }}
            className="md:col-span-2 p-7 rounded-3xl bg-base-200/50 border border-base-content/10 hover:border-primary/40 transition-all shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-md">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black">
                Algorithmic Stack MatchMaker
              </h3>
              <p className="text-sm text-base-content/70 leading-relaxed max-w-xl">
                Unlike generic social networks, DevNet calculates engineering compatibility scores based on verified GitHub stacks, architectural styles, and complementary skill gaps.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                <span className="badge badge-sm badge-outline font-mono">Frontend ➔ Backend Affinity</span>
                <span className="badge badge-sm badge-outline font-mono">Microservice Experience</span>
                <span className="badge badge-sm badge-outline font-mono">Swipe Gesture Controls</span>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-base-content/5 flex items-center justify-between text-xs font-mono text-primary font-bold">
              <span>Heuristic Discovery Engine</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </motion.div>

          {/* Card 2: Zero-Latency Sockets (Spans 1 col) */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-7 rounded-3xl bg-base-200/50 border border-base-content/10 hover:border-secondary/40 transition-all shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary border border-secondary/20 flex items-center justify-center shadow-md">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black">
                Zero-Latency Sockets
              </h3>
              <p className="text-sm text-base-content/70 leading-relaxed">
                Bi-directional Socket.IO pipe delivers live typing indicators, delivery confirmations, and sub-50ms message sync.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-base-content/5 flex items-center justify-between text-xs font-mono text-secondary font-bold">
              <span>Duplex Packet Bus</span>
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
          </motion.div>

          {/* Card 3: Free AI Architect (Spans 1 col) */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-7 rounded-3xl bg-base-200/50 border border-base-content/10 hover:border-accent/40 transition-all shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent border border-accent/20 flex items-center justify-center shadow-md">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black">
                AI Architecture Co-Pilot
              </h3>
              <p className="text-sm text-base-content/70 leading-relaxed">
                Integrated OpenRouter API with free Llama 3.3 70B & Gemini 2.0 Flash transforms user prompts into live SVG whiteboard topologies in seconds.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-base-content/5 flex items-center justify-between text-xs font-mono text-accent font-bold">
              <span>OpenRouter Free Tier</span>
              <Sparkles className="w-4 h-4" />
            </div>
          </motion.div>

          {/* Card 4: Zero Cold-Start Cloud (Spans 2 cols) */}
          <motion.div
            whileHover={{ y: -4 }}
            className="md:col-span-2 p-7 rounded-3xl bg-base-200/50 border border-base-content/10 hover:border-success/40 transition-all shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-success/10 text-success border border-success/20 flex items-center justify-center shadow-md">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black">
                24/7 Zero Cold-Start Cloud Topology
              </h3>
              <p className="text-sm text-base-content/70 leading-relaxed max-w-xl">
                DevNet runs entirely on 100% free cloud infrastructure without cold starts. An automated 12-minute heartbeat self-pings the Render container, while Vercel handles edge distribution globally.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono">
                <div className="p-2 rounded-xl bg-base-100/80 border border-base-content/5 text-center">
                  <div className="font-bold text-success">$0.00</div>
                  <div className="text-[10px] text-base-content/60">Cloud Bill</div>
                </div>
                <div className="p-2 rounded-xl bg-base-100/80 border border-base-content/5 text-center">
                  <div className="font-bold text-primary">99.9%</div>
                  <div className="text-[10px] text-base-content/60">Keep-Alive</div>
                </div>
                <div className="p-2 rounded-xl bg-base-100/80 border border-base-content/5 text-center">
                  <div className="font-bold text-secondary">&lt; 100ms</div>
                  <div className="text-[10px] text-base-content/60">Edge TTFB</div>
                </div>
                <div className="p-2 rounded-xl bg-base-100/80 border border-base-content/5 text-center">
                  <div className="font-bold text-accent">Resend</div>
                  <div className="text-[10px] text-base-content/60">Async Mail</div>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-base-content/5 flex items-center justify-between text-xs font-mono text-success font-bold">
              <span>Production Infrastructure</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </motion.div>

        </div>
      </section>


      {/* ============================================================== */}
      {/* 4. RECRUITER & ENGINEERING MANAGER DEEP-DIVE                   */}
      {/* ============================================================== */}
      <section className="py-16 bg-base-200/40 border-y border-base-content/10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="p-8 sm:p-10 rounded-3xl bg-base-100/90 border border-base-content/15 shadow-2xl backdrop-blur-2xl">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-base-content/10">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono font-bold">
                  <Terminal className="w-3.5 h-3.5" />
                  Engineering Manager & Recruiter Review
                </div>
                <h3 className="text-2xl font-black">
                  Production Engineering Contract
                </h3>
              </div>

              <Link
                to="/signup"
                className="btn btn-sm btn-primary font-bold shadow-md shadow-primary/20"
              >
                Test Live Application
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-base-content/80 leading-relaxed">
              <div className="space-y-2">
                <div className="font-bold text-base-content flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Free-Tier High Availability
                </div>
                <p className="text-xs text-base-content/70">
                  Container sleep is prevented through a decoupled Node.js cron routine that hits self-health check endpoints every 12 minutes, delivering instant first-byte response times.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-base-content flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                  Decoupled Real-Time State
                </div>
                <p className="text-xs text-base-content/70">
                  Redux store notification slices listen globally to Socket.IO events, rendering instant push notifications and unread badges across route transitions without socket leaks.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-base-content flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  Collaborative Vector Whiteboard
                </div>
                <p className="text-xs text-base-content/70">
                  Custom whiteboard canvas coordinates live SVG shapes, multi-peer cursors, and AI-generated topologies with 1-click snapshot publishing directly to the community feed.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-base-content flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Non-Blocking Transactional Mail
                </div>
                <p className="text-xs text-base-content/70">
                  Asynchronous email dispatch via Resend API guarantees that user connection requests and notifications complete instantaneously even under network spikes.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ============================================================== */}
      {/* 5. TECH STACK STRIP                                            */}
      {/* ============================================================== */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-base-content/40 mb-4">
          Engineered With Modern Production Technologies
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {techStackPills.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1.5 rounded-xl bg-base-200/60 text-xs font-mono font-semibold text-base-content/70 border border-base-content/10 hover:border-primary/40 transition-colors"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>


      {/* ============================================================== */}
      {/* 6. FINAL HIGH-CONVERSION CTA                                   */}
      {/* ============================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Ready To Meet Your <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Technical Co-Creator?
            </span>
          </h2>

          <p className="text-base-content/70 text-sm sm:text-base max-w-lg mx-auto">
            Create your profile in 60 seconds, configure your verified tech stack, and begin discovering engineering peers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              to="/signup"
              className="btn btn-primary btn-md sm:btn-lg w-full sm:w-auto font-black shadow-2xl shadow-primary/30 px-8 group rounded-full"
            >
              <span>Join DevNet Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/login"
              className="btn btn-ghost btn-md sm:btn-lg w-full sm:w-auto font-bold border border-base-content/15 rounded-full"
            >
              Sign In To Account
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Landing;
