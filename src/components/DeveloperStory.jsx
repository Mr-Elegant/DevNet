import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { 
  Code2, 
  Terminal, 
  Cpu, 
  Sparkles, 
  Heart, 
  X, 
  MessageSquare, 
  Send, 
  CheckCheck, 
  Layers, 
  Zap, 
  GitBranch, 
  Play, 
  Flame, 
  Award, 
  ArrowRight, 
  Share2, 
  Users, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Sliders,
  Palette,
  Bot,
  Database
} from "lucide-react";
import { Link } from "react-router-dom";

const DeveloperStory = () => {
  const containerRef = useRef(null);

  // Framer Motion Scroll Progress Binding (offset against sticky navbar)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 64px", "end end"]
  });

  // Smooth Spring dampener for fluid trackpad and mouse wheel velocity
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 26,
    restDelta: 0.001
  });

  // Translate 4 panels horizontally (0% to -75%)
  const x = useTransform(smoothProgress, [0, 1], ["0%", "-75%"]);

  // Local state for interactive Act elements
  const [currentAct, setCurrentAct] = useState(0);
  
  // Act 1: Terminal simulation state
  const [testStatus, setTestStatus] = useState("idle"); // idle | running | passed
  
  // Act 2: Interactive Card State
  const [cardSwipe, setCardSwipe] = useState(null); // null | 'liked' | 'skipped'
  const [matchCelebration, setMatchCelebration] = useState(false);

  // Act 3: Architecture Canvas & AI Architect Interactive State
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPromptIndex, setAiPromptIndex] = useState(0);
  const [sharedToast, setSharedToast] = useState(false);

  const aiPrompts = [
    { title: "E-Commerce Microservices Pipeline", model: "Llama 3.3 70B (Free)" },
    { title: "Distributed Event-Driven Kafka Stream", model: "Gemini 2.0 Flash (Free)" },
    { title: "High-Concurrency WebSocket Gateway", model: "Llama 3.3 70B (Free)" }
  ];

  const triggerAiRegen = () => {
    setAiGenerating(true);
    setTimeout(() => {
      setAiPromptIndex((prev) => (prev + 1) % aiPrompts.length);
      setAiGenerating(false);
    }, 700);
  };

  const triggerShareToast = () => {
    setSharedToast(true);
    setTimeout(() => {
      setSharedToast(false);
    }, 2500);
  };

  // Act 4: Interactive Upvote count
  const [upvotes, setUpvotes] = useState(248);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  // Track active act index based on scroll position
  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (latest) => {
      if (latest < 0.22) setCurrentAct(0);
      else if (latest < 0.52) setCurrentAct(1);
      else if (latest < 0.82) setCurrentAct(2);
      else setCurrentAct(3);
    });
    return () => unsubscribe();
  }, [smoothProgress]);

  // Jump to specific act on click
  const scrollToAct = (actIndex) => {
    if (!containerRef.current) return;
    const containerTop = containerRef.current.offsetTop;
    const totalHeight = containerRef.current.offsetHeight - (window.innerHeight - 64);
    const targetScroll = containerTop - 64 + (actIndex / 3) * totalHeight;
    window.scrollTo({
      top: Math.max(0, targetScroll),
      behavior: "smooth"
    });
  };

  const runCodeTest = () => {
    setTestStatus("running");
    setTimeout(() => {
      setTestStatus("passed");
    }, 1200);
  };

  const handleCardAction = (direction) => {
    setCardSwipe(direction);
    if (direction === "liked") {
      setMatchCelebration(true);
    }
    setTimeout(() => {
      setCardSwipe(null);
    }, 2400);
  };

  const toggleUpvote = () => {
    if (hasUpvoted) {
      setUpvotes((prev) => prev - 1);
      setHasUpvoted(false);
    } else {
      setUpvotes((prev) => prev + 1);
      setHasUpvoted(true);
    }
  };

  const acts = [
    { id: 0, title: "01 // The Grind", label: "Solo Coder" },
    { id: 1, title: "02 // The Match", label: "MatchMaker" },
    { id: 2, title: "03 // War Room", label: "Canvas & AI Architect" },
    { id: 3, title: "04 // The Ship", label: "Community Launch" }
  ];

  return (
    <section ref={containerRef} className="relative h-[260vh] bg-base-300/40 text-base-content selection:bg-primary selection:text-primary-content">
      {/* ============================================================== */}
      {/* PINNED STICKY VIEWPORT CONTAINER                               */}
      {/* ============================================================== */}
      <div className="sticky top-16 h-[calc(100vh-4rem)] w-full overflow-hidden flex flex-col justify-between z-30">
        
        {/* TOP STORY HUD (Progress Bar & Act Navigator) */}
        <div className="w-full z-40 bg-base-100/80 backdrop-blur-xl border-b border-base-content/10 px-4 md:px-8 py-3.5 transition-all">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            
            {/* Story Identity */}
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-wider bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                The 0 to 1 Developer Journey
              </span>
              <span className="hidden sm:inline text-xs text-base-content/40 font-mono">
                • Scroll-Driven Storytelling
              </span>
            </div>

            {/* Interactive Act Navigation Pills */}
            <div className="flex items-center gap-1 sm:gap-2">
              {acts.map((act) => (
                <button
                  key={act.id}
                  onClick={() => scrollToAct(act.id)}
                  className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] font-bold transition-all duration-300 flex items-center gap-1.5 ${
                    currentAct === act.id
                      ? "bg-primary text-primary-content shadow-lg shadow-primary/20 scale-105"
                      : "bg-base-200/60 text-base-content/60 hover:text-base-content hover:bg-base-200"
                  }`}
                >
                  <span className="font-mono">{act.id + 1}</span>
                  <span className="hidden md:inline">{act.label}</span>
                </button>
              ))}
            </div>

            {/* Scroll Hint */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-base-content/50 font-mono">
              <span>Scroll Down</span>
              <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
            </div>
          </div>

          {/* Glowing Animated Progress Bar */}
          <div className="h-1 w-full bg-base-200 mt-2.5 rounded-full overflow-hidden">
            <motion.div
              style={{ scaleX: smoothProgress }}
              className="h-full bg-gradient-to-r from-primary via-secondary to-accent origin-left"
            />
          </div>
        </div>

        {/* ============================================================== */}
        {/* HORIZONTAL PANELS TRACK                                        */}
        {/* ============================================================== */}
        <motion.div 
          style={{ x }} 
          className="flex flex-1 w-[400vw] will-change-transform min-h-0"
        >

          {/* ============================================================ */}
          {/* ACT 1: THE SOLITARY 2 AM GRIND                               */}
          {/* ============================================================ */}
          <div className="w-screen flex-shrink-0 h-full flex items-center justify-center px-4 py-3 sm:px-8 md:px-12 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center z-10">
              
              {/* Left Column: Narrative */}
              <div className="lg:col-span-5 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-mono font-bold tracking-wider uppercase">
                  <Terminal className="w-3.5 h-3.5" />
                  Act 01 // Midnight Isolation
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                  A Single Engineer. <br />
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    An Impossible Stack.
                  </span>
                </h2>

                <p className="text-base-content/75 text-sm sm:text-base leading-relaxed">
                  It's 02:14 AM. You’re wrestling with distributed WebSocket locks, 
                  memory leaks, and an empty staging environment. Building breakthrough 
                  software alone is exhausting, slow, and lonely.
                </p>

                <div className="p-4 rounded-2xl bg-base-100/60 border border-base-content/10 backdrop-blur-md space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-base-content/60">
                    <span>Developer Energy</span>
                    <span className="text-error font-bold">14% (Depleted)</span>
                  </div>
                  <div className="w-full bg-base-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-error h-full w-[14%] rounded-full animate-pulse" />
                  </div>
                  <p className="text-xs text-base-content/50 italic">
                    "Every great product was built by a pair. But finding the right technical co-creator is broken."
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-base-content/60 font-mono">
                    <Zap className="w-4 h-4 text-warning" />
                    <span>Scroll to find your counterpart &rarr;</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Code Studio */}
              <div className="lg:col-span-7">
                <div className="rounded-2xl bg-base-100/90 border border-base-content/15 shadow-2xl overflow-hidden backdrop-blur-xl transition-all duration-300 hover:border-primary/40">
                  {/* IDE Header Bar */}
                  <div className="flex items-center justify-between px-4 py-3 bg-base-200/70 border-b border-base-content/10">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-error/80 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-warning/80 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-success/80 inline-block" />
                      <span className="ml-2 text-xs font-mono font-medium text-base-content/60 flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-primary" />
                        distributedEngine.ts
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={runCodeTest}
                        disabled={testStatus === "running"}
                        className="btn btn-primary btn-xs font-mono flex items-center gap-1 shadow-md shadow-primary/20"
                      >
                        {testStatus === "running" ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Play className="w-3 h-3 fill-current" />
                        )}
                        <span>{testStatus === "running" ? "Compiling..." : "Run Test"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Code Editor Body */}
                  <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto bg-base-300/30">
                    <div className="text-base-content/40">// [02:14:12 AM] Attempting distributed consensus without peers...</div>
                    <div className="text-primary font-semibold">import <span className="text-base-content">{"{ PeerSync, Cluster }"}</span> from <span className="text-secondary">'@devnet/core'</span>;</div>
                    <br />
                    <div><span className="text-secondary font-bold">export async function</span> <span className="text-warning">bootstrapProject</span>() {"{"}</div>
                    <div className="pl-4 text-base-content/80">
                      <span className="text-primary font-semibold">const</span> engine = <span className="text-secondary font-bold">new</span> Cluster({"{"} debug: <span className="text-accent">true</span> {"}"});
                    </div>
                    <div className="pl-4 text-base-content/80">
                      <span className="text-primary font-semibold">const</span> activePeers = <span className="text-secondary font-bold">await</span> engine.discoverPeers();
                    </div>
                    <br />
                    <div className="pl-4">
                      <span className="text-secondary font-bold">if</span> (activePeers.length === <span className="text-accent">0</span>) {"{"}
                    </div>
                    <div className="pl-8 text-error font-semibold flex items-center gap-1.5">
                      <span>throw new Error("Solo Developer Bottleneck: Need Co-Builder!");</span>
                      <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
                    </div>
                    <div className="pl-4">{"}"}</div>
                    <div>{"}"}</div>
                  </div>

                  {/* Interactive Terminal Output Console */}
                  <div className="p-4 bg-base-200/90 border-t border-base-content/10 font-mono text-xs space-y-1.5">
                    <div className="flex items-center gap-2 text-base-content/50">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Execution Console</span>
                    </div>

                    {testStatus === "idle" && (
                      <p className="text-base-content/60">
                        &gt; Press <span className="text-primary font-bold">"Run Test"</span> above to compile the lone developer routine.
                      </p>
                    )}

                    {testStatus === "running" && (
                      <p className="text-warning flex items-center gap-2">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        &gt; Connecting to Node.js v20 runtime... resolving dependencies...
                      </p>
                    )}

                    {testStatus === "passed" && (
                      <div className="space-y-1 animate-fade-in">
                        <p className="text-error font-semibold">
                          &gt; ❌ FATAL: Solo Developer Stalling. Zero peer architects detected.
                        </p>
                        <p className="text-success font-semibold">
                          &gt; 💡 Solution: DevNet algorithmic matchmaker initialized. Scroll right &rarr;
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* ============================================================ */}
          {/* ACT 2: THE MATCHMAKER SPARK                                   */}
          {/* ============================================================ */}
          <div className="w-screen flex-shrink-0 h-full flex items-center justify-center px-4 py-3 sm:px-8 md:px-12 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center z-10">
              
              {/* Left Column: Narrative */}
              <div className="lg:col-span-5 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 text-xs font-mono font-bold tracking-wider uppercase">
                  <Flame className="w-3.5 h-3.5" />
                  Act 02 // Algorithmic Discovery
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                  Tinder For Coders. <br />
                  <span className="bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">
                    Engineered For Synergy.
                  </span>
                </h2>

                <p className="text-base-content/75 text-sm sm:text-base leading-relaxed">
                  DevNet analyzes verified tech stacks, GitHub commits, and architectural styles. 
                  Swipe right on engineers who complement your weaknesses and amplify your strengths.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-base-100/70 border border-base-content/10">
                    <div className="text-2xl font-black text-primary">98%</div>
                    <div className="text-xs text-base-content/60 font-medium">Stack Heuristic Match</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-base-100/70 border border-base-content/10">
                    <div className="text-2xl font-black text-secondary">&lt; 50ms</div>
                    <div className="text-xs text-base-content/60 font-medium">Instant Socket Handshake</div>
                  </div>
                </div>

                <p className="text-xs text-base-content/50 font-mono">
                  💡 <b>Try it:</b> Drag the developer card horizontally or use the action buttons below.
                </p>
              </div>

              {/* Right Column: Interactive 3D Match Card */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
                
                {/* Match Celebration Overlay */}
                <AnimatePresence>
                  {matchCelebration && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="absolute -top-12 z-30 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent text-primary-content font-black shadow-2xl flex items-center gap-2.5"
                    >
                      <Sparkles className="w-5 h-5 animate-bounce" />
                      <span>🎉 IT'S A MATCH! Connection Request Sent!</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Draggable Card Container */}
                <motion.div
                  drag="x"
                  dragConstraints={{ left: -120, right: 120 }}
                  dragElastic={0.2}
                  whileDrag={{ scale: 1.03, rotate: 3 }}
                  animate={
                    cardSwipe === "liked" 
                      ? { x: 300, opacity: 0, rotate: 15 } 
                      : cardSwipe === "skipped" 
                      ? { x: -300, opacity: 0, rotate: -15 } 
                      : { x: 0, opacity: 1, rotate: 0 }
                  }
                  transition={{ duration: 0.4 }}
                  className="w-full max-w-sm rounded-3xl bg-base-100/90 border border-base-content/15 p-6 shadow-2xl backdrop-blur-2xl cursor-grab active:cursor-grabbing relative overflow-hidden transition-colors"
                >
                  {/* Subtle Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="badge badge-primary badge-outline text-[11px] font-bold">
                      DevNet MatchMaker
                    </span>
                    <span className="text-[11px] font-mono font-bold text-success flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-success inline-block animate-ping" />
                      98% Fit
                    </span>
                  </div>

                  {/* Profile Avatar & Details */}
                  <div className="flex items-center gap-4 mb-4">
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
                      <h3 className="text-xl font-black text-base-content flex items-center gap-1.5">
                        Sarah Chen
                        <ShieldCheck className="w-4 h-4 text-warning fill-warning/20" />
                      </h3>
                      <p className="text-xs text-base-content/60 font-medium">
                        Staff Distributed Systems Architect
                      </p>
                      <p className="text-[11px] text-primary font-mono font-semibold">
                        @sarah_systems • 4 yrs exp
                      </p>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-base-content/80 leading-relaxed mb-4">
                    "Specializing in high-throughput event streaming, Express clusters & WebSockets. 
                    Looking for a frontend visionary to build a real-time collaborative dev ecosystem."
                  </p>

                  {/* Tech Stack Pills */}
                  <div className="space-y-1.5 mb-6">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-base-content/50">
                      Verified Competencies
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {["React 19", "Node.js", "Express 5", "Socket.IO", "Redis", "MongoDB", "Kafka"].map((skill) => (
                        <span key={skill} className="px-2.5 py-1 rounded-lg bg-base-200/80 text-[11px] font-semibold text-base-content/80 border border-base-content/5">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Action Buttons */}
                  <div className="flex items-center justify-center gap-4 pt-2 border-t border-base-content/10">
                    <button
                      onClick={() => handleCardAction("skipped")}
                      className="btn btn-circle btn-error btn-outline hover:scale-110 transition-transform shadow-md"
                      title="Pass"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => handleCardAction("liked")}
                      className="btn btn-circle btn-success hover:scale-110 transition-transform shadow-lg shadow-success/30"
                      title="Connect / Interested"
                    >
                      <Heart className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                </motion.div>

                {/* Reset button if card was swiped */}
                {cardSwipe && (
                  <button 
                    onClick={() => { setCardSwipe(null); setMatchCelebration(false); }}
                    className="mt-4 text-xs font-mono text-primary hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset Card Position
                  </button>
                )}
              </div>
            </div>
          </div>


          {/* ============================================================ */}
          {/* ACT 3: THE REAL-TIME WAR ROOM                                 */}
          {/* ============================================================ */}
          <div className="w-screen flex-shrink-0 h-full flex items-center justify-center px-4 py-3 sm:px-8 md:px-12 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-10 right-1/3 w-96 h-96 bg-accent/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center z-10">
              
              {/* Left Column: Narrative */}
              <div className="lg:col-span-5 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 text-xs font-mono font-bold tracking-wider uppercase">
                  <Zap className="w-3.5 h-3.5" />
                  Act 03 // Real-Time Canvas & AI Architect
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                  The War Room. <br />
                  <span className="bg-gradient-to-r from-accent via-secondary to-primary bg-clip-text text-transparent">
                    Vector Canvas & AI Architect.
                  </span>
                </h2>

                <p className="text-base-content/75 text-sm sm:text-base leading-relaxed">
                  The instant connection is accepted, DevNet spins up private Socket.IO 
                  duplex channels and custom collaborative vector whiteboard rooms. 
                  Prompt the built-in AI Architect powered by free LLMs (Llama 3.3 70B & Gemini) 
                  to scaffold distributed systems in seconds, sketch schemas, and iterate with sub-50ms multi-cursor sync.
                </p>

                <div className="space-y-2.5 font-mono text-xs text-base-content/70">
                  <div className="flex items-center gap-2">
                    <CheckCheck className="w-4 h-4 text-primary" />
                    <span>Socket.IO bi-directional packet delivery (&lt; 50ms)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCheck className="w-4 h-4 text-secondary" />
                    <span>Dedicated vector canvas: services, DB cylinders & arrows</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCheck className="w-4 h-4 text-accent" />
                    <span>AI Architect: 100% Free OpenRouter LLMs (Llama 3.3 & Gemini)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCheck className="w-4 h-4 text-success" />
                    <span>1-Click snapshot share to Community Feed with live room launch</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Split Screen (Chat + Animated Architecture Canvas) */}
              <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Screen 1: Simulated Real-Time Chat */}
                <div className="rounded-2xl bg-base-100/90 border border-base-content/15 p-4 shadow-xl backdrop-blur-xl flex flex-col justify-between h-80">
                  {/* Chat Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-base-content/10">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center font-bold text-xs text-secondary ring-1 ring-secondary">
                        SC
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-tight">Sarah Chen</div>
                        <div className="text-[10px] text-success flex items-center gap-1 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                          online • socket active
                        </div>
                      </div>
                    </div>
                    <span className="badge badge-xs badge-ghost font-mono text-[9px]">ROOM #829</span>
                  </div>

                  {/* Messages Scroll Area */}
                  <div className="flex-1 py-3 space-y-2.5 overflow-y-auto font-sans text-xs">
                    <div className="flex items-start gap-2">
                      <div className="bg-base-200 p-2.5 rounded-2xl rounded-tl-none max-w-[85%] text-base-content/90">
                        Hey! Loved your distributed locking proposal. Shall we map the microservices flow?
                      </div>
                    </div>

                    <div className="flex items-end justify-end gap-1.5">
                      <div className="bg-primary text-primary-content p-2.5 rounded-2xl rounded-tr-none max-w-[85%] shadow-md">
                        100%! Opening whiteboard now. Let's ask AI Architect to scaffold the pipeline.
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="bg-base-200 p-2.5 rounded-2xl rounded-tl-none max-w-[85%] text-base-content/90 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span>Boom! AI Architect generated API Gateway, Kafka queue, and Postgres DB in 1.2s!</span>
                      </div>
                    </div>

                    {/* Delivery checkmark */}
                    <div className="flex justify-end text-[10px] text-primary items-center gap-1 font-mono">
                      <span>Delivered & Seen</span>
                      <CheckCheck className="w-3.5 h-3.5 text-primary" />
                    </div>

                    {/* Simulated typing bubble */}
                    <div className="flex items-center gap-1 bg-base-200/70 p-2 rounded-xl w-14">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>

                  {/* Chat Input mock */}
                  <div className="pt-2 border-t border-base-content/10 flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      placeholder="Socket duplex connected..."
                      className="input input-xs input-bordered flex-1 font-mono text-[11px] bg-base-200/50"
                    />
                    <button className="btn btn-xs btn-circle btn-primary">
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Screen 2: Animated Architecture Canvas */}
                <div className="rounded-2xl bg-base-100/90 border border-base-content/15 p-4 shadow-xl backdrop-blur-xl flex flex-col justify-between h-80 relative overflow-hidden">
                  {/* Toast Alert when Snapshot Shared */}
                  <AnimatePresence>
                    {sharedToast && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-12 left-3 right-3 z-30 bg-success text-success-content px-3 py-2 rounded-xl text-xs font-mono font-bold shadow-xl flex items-center justify-between"
                      >
                        <div className="flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5" />
                          <span>Snapshot Shared to Feed!</span>
                        </div>
                        <span className="text-[10px] opacity-80 font-mono">#Community</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center justify-between pb-2 border-b border-base-content/10 z-10">
                    <span className="text-xs font-bold flex items-center gap-1.5 text-accent">
                      <Layers className="w-3.5 h-3.5" />
                      Architecture Canvas
                    </span>
                    <span className="badge badge-xs badge-accent font-mono text-[9px]">AI Architect Free</span>
                  </div>

                  {/* AI Prompt Ribbon with Interactive Prompt Button */}
                  <div className="mt-1.5 px-2.5 py-1 rounded-lg bg-base-200/90 border border-accent/20 flex items-center justify-between gap-1.5 z-10 text-[10px] font-mono">
                    <div className="flex items-center gap-1.5 truncate">
                      <Bot className={`w-3 h-3 text-accent ${aiGenerating ? "animate-spin" : ""}`} />
                      <span className="text-base-content/90 font-semibold truncate">
                        {aiPrompts[aiPromptIndex].title}
                      </span>
                    </div>
                    <button
                      onClick={triggerAiRegen}
                      disabled={aiGenerating}
                      className="btn btn-xs btn-ghost text-accent hover:bg-accent/15 px-1.5 font-mono h-5 min-h-0 text-[9px] shrink-0 flex items-center gap-1"
                      title="Simulate prompt to free LLM"
                    >
                      <RefreshCw className={`w-2.5 h-2.5 ${aiGenerating ? "animate-spin" : ""}`} />
                      <span>{aiGenerating ? "Generating..." : "Prompt AI"}</span>
                    </button>
                  </div>

                  {/* Animated SVG Diagram Canvas */}
                  <div className="relative flex-1 flex items-center justify-center overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 260 170">
                      {/* Grid background dots */}
                      <pattern id="archgrid" width="16" height="16" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1" fill="currentColor" opacity="0.1" />
                      </pattern>
                      <rect width="260" height="170" fill="url(#archgrid)" />

                      {/* Connecting animated path lines */}
                      <path 
                        d="M 45 35 L 105 35 L 105 85 L 175 85" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeDasharray="4 4"
                        className="text-primary/70 animate-pulse" 
                      />
                      <path 
                        d="M 105 85 L 105 135 L 175 135" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeDasharray="4 4"
                        className="text-secondary/70 animate-pulse" 
                      />
                      <path 
                        d="M 105 35 L 175 35" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeDasharray="4 4"
                        className="text-accent/70 animate-pulse" 
                      />

                      {/* Node 1: API Gateway */}
                      <g transform="translate(10, 18)">
                        <rect width="62" height="34" rx="7" fill="oklch(var(--b2))" stroke="oklch(var(--p))" strokeWidth="1.5" />
                        <text x="31" y="16" textAnchor="middle" fill="currentColor" fontSize="7.5" fontWeight="bold" fontFamily="monospace">API Gateway</text>
                        <text x="31" y="26" textAnchor="middle" fill="currentColor" opacity="0.6" fontSize="6.5" fontFamily="monospace">:8080 RateLimit</text>
                      </g>

                      {/* Node 2: Service Box (Order Service) */}
                      <g transform="translate(85, 68)">
                        <rect width="65" height="34" rx="7" fill="oklch(var(--b2))" stroke="oklch(var(--s))" strokeWidth="1.5" />
                        <text x="32" y="16" textAnchor="middle" fill="currentColor" fontSize="7.5" fontWeight="bold" fontFamily="monospace">Order Service</text>
                        <text x="32" y="26" textAnchor="middle" fill="currentColor" opacity="0.6" fontSize="6.5" fontFamily="monospace">Express 5 API</text>
                      </g>

                      {/* Node 3: Kafka Message Queue */}
                      <g transform="translate(175, 18)">
                        <rect width="68" height="32" rx="16" fill="oklch(var(--b2))" stroke="oklch(var(--wa))" strokeWidth="1.5" />
                        <text x="34" y="15" textAnchor="middle" fill="currentColor" fontSize="7.5" fontWeight="bold" fontFamily="monospace">Kafka Queue</text>
                        <text x="34" y="25" textAnchor="middle" fill="currentColor" opacity="0.6" fontSize="6.5" fontFamily="monospace">orders.stream</text>
                      </g>

                      {/* Node 4: Database Cylinder (Custom Whiteboard DB Shape) */}
                      <g transform="translate(175, 68)">
                        {/* Cylinder Body */}
                        <path d="M 5 9 L 5 26 C 5 33 63 33 63 26 L 63 9 Z" fill="oklch(var(--b2))" stroke="oklch(var(--su))" strokeWidth="1.5" />
                        {/* Cylinder Top Ellipse */}
                        <ellipse cx="34" cy="9" rx="29" ry="6.5" fill="oklch(var(--b2))" stroke="oklch(var(--su))" strokeWidth="1.5" />
                        <text x="34" y="18" textAnchor="middle" fill="currentColor" fontSize="7" fontWeight="bold" fontFamily="monospace">PostgreSQL</text>
                        <text x="34" y="26" textAnchor="middle" fill="currentColor" opacity="0.6" fontSize="6" fontFamily="monospace">Primary DB</text>
                      </g>

                      {/* Node 5: Redis Cache */}
                      <g transform="translate(175, 120)">
                        <rect width="68" height="30" rx="7" fill="oklch(var(--b2))" stroke="oklch(var(--a))" strokeWidth="1.5" />
                        <text x="34" y="14" textAnchor="middle" fill="currentColor" fontSize="7.5" fontWeight="bold" fontFamily="monospace">Redis Cache</text>
                        <text x="34" y="23" textAnchor="middle" fill="currentColor" opacity="0.6" fontSize="6.5" fontFamily="monospace">Sub-1ms State</text>
                      </g>

                      {/* Active Cursor 1 (Sarah) */}
                      <g transform="translate(68, 105)">
                        <polygon points="0,0 8,14 4,11 0,16" fill="oklch(var(--s))" />
                        <rect x="8" y="8" width="54" height="13" rx="3" fill="oklch(var(--s))" />
                        <text x="35" y="17" textAnchor="middle" fill="#000" fontSize="6.5" fontWeight="bold">Sarah [Arrow]</text>
                      </g>

                      {/* Active Cursor 2 (You) */}
                      <g transform="translate(140, 24)">
                        <polygon points="0,0 8,14 4,11 0,16" fill="oklch(var(--p))" />
                        <rect x="8" y="8" width="46" height="13" rx="3" fill="oklch(var(--p))" />
                        <text x="31" y="17" textAnchor="middle" fill="#fff" fontSize="6.5" fontWeight="bold">You [AI]</text>
                      </g>
                    </svg>
                  </div>

                  {/* Canvas Footer */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-base-content/70 pt-1.5 border-t border-base-content/10">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-success inline-block animate-ping" />
                      <span>2 Peers • 0ms drop</span>
                    </div>

                    <button
                      onClick={triggerShareToast}
                      className="btn btn-xs btn-outline btn-success font-mono h-5 min-h-0 text-[9px] px-2 flex items-center gap-1"
                      title="Share architecture snapshot to community feed"
                    >
                      <Share2 className="w-2.5 h-2.5" />
                      <span>Share to Feed</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* ============================================================ */}
          {/* ACT 4: SHIPPED TO PRODUCTION & COMMUNITY LAUNCH               */}
          {/* ============================================================ */}
          <div className="w-screen flex-shrink-0 h-full flex items-center justify-center px-4 py-3 sm:px-8 md:px-12 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/4 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-warning/15 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center z-10">
              
              {/* Left Column: Narrative & Final CTA */}
              <div className="lg:col-span-5 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success border border-success/20 text-xs font-mono font-bold tracking-wider uppercase">
                  <Award className="w-3.5 h-3.5" />
                  Act 04 // Shipped & Community Recognized
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                  From Midnight Idea. <br />
                  <span className="bg-gradient-to-r from-success via-warning to-primary bg-clip-text text-transparent">
                    To Shipped Product.
                  </span>
                </h2>

                <p className="text-base-content/75 text-sm sm:text-base leading-relaxed">
                  Together, you and your matched counterpart transformed an isolated 
                  prototype into a globally deployed application on 100% free cloud 
                  infrastructure. Shared your live architecture snapshot directly to the DevNet Global Feed, verified with gold status.
                </p>

                {/* Live Stats Ribbon */}
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <div className="p-3 rounded-xl bg-base-100/70 border border-base-content/10 text-center">
                    <div className="text-xl font-black text-primary">$0.00</div>
                    <div className="text-[10px] text-base-content/60 font-mono">Infra Cost</div>
                  </div>
                  <div className="p-3 rounded-xl bg-base-100/70 border border-base-content/10 text-center">
                    <div className="text-xl font-black text-secondary">24/7</div>
                    <div className="text-[10px] text-base-content/60 font-mono">Keep-Alive</div>
                  </div>
                  <div className="p-3 rounded-xl bg-base-100/70 border border-base-content/10 text-center">
                    <div className="text-xl font-black text-accent">Free AI</div>
                    <div className="text-[10px] text-base-content/60 font-mono">Architect LLM</div>
                  </div>
                </div>

                {/* Final Interactive Action Links */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
                  <Link
                    to="/signup"
                    className="btn btn-primary w-full sm:w-auto font-black shadow-xl shadow-primary/25 px-6 group"
                  >
                    <span>Start Your Journey</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/login"
                    className="btn btn-outline btn-ghost w-full sm:w-auto font-bold"
                  >
                    Log In To App
                  </Link>
                </div>
              </div>

              {/* Right Column: Community Feed Card Simulation & Gold Badge */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Simulated Community Feed Post */}
                <div className="rounded-3xl bg-base-100/90 border border-base-content/15 p-6 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
                  
                  {/* Glowing Top Pill */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="avatar">
                        <div className="w-10 h-10 rounded-full ring-2 ring-warning">
                          <img 
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" 
                            alt="Makers" 
                          />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-bold flex items-center gap-1.5">
                          Alex & Sarah (DevNet Duo)
                          <span className="badge badge-warning badge-xs font-bold text-[9px]">
                            GOLD VERIFIED
                          </span>
                        </div>
                        <div className="text-[11px] text-base-content/50 font-mono">
                          Shipped 2 hours ago • #FullStack #SystemDesign
                        </div>
                      </div>
                    </div>

                    <span className="badge badge-accent/20 text-accent text-xs font-mono font-bold flex items-center gap-1">
                      <Palette className="w-3 h-3" />
                      Architecture
                    </span>
                  </div>

                  {/* Post Content */}
                  <h4 className="text-base sm:text-lg font-black text-base-content mb-2">
                    "We matched on DevNet 3 weeks ago. Today we launched a zero-cost real-time collaborative IDE!"
                  </h4>

                  <p className="text-xs sm:text-sm text-base-content/70 leading-relaxed mb-3">
                    Designed our entire distributed pipeline live on DevNet Whiteboard using the AI Architect (Llama 3.3 70B), 
                    then shipped to Vercel & Render. Check out our live architecture canvas below!
                  </p>

                  {/* Embedded Architecture Preview Card with 1-Click Launch Button */}
                  <div className="my-3 p-3.5 rounded-2xl bg-base-200/70 border border-base-content/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shrink-0">
                        <Palette className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-base-content flex items-center gap-1.5 flex-wrap">
                          <span>E-Commerce Microservices Pipeline</span>
                          <span className="badge badge-accent badge-xs text-[9px] font-mono">LIVE WHITEBOARD</span>
                        </div>
                        <div className="text-[10px] text-base-content/60 font-mono">
                          AI Architect scaffolded • 6 nodes • Shared from Room #829
                        </div>
                      </div>
                    </div>

                    <Link
                      to="/whiteboard/prod_share_room_303"
                      className="btn btn-xs btn-outline btn-accent font-mono gap-1.5 shadow-sm hover:scale-105 transition-transform shrink-0"
                    >
                      <Palette className="w-3 h-3" />
                      <span>Open Interactive Whiteboard</span>
                    </Link>
                  </div>

                  {/* Embedded Architecture Pill Stack */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="px-2.5 py-1 rounded-md bg-base-200 text-[11px] font-mono font-semibold text-primary">
                      ✓ React 19 + Vite
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-base-200 text-[11px] font-mono font-semibold text-secondary">
                      ✓ Vector Whiteboard
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-base-200 text-[11px] font-mono font-semibold text-accent">
                      ✓ AI Architect (Free LLM)
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-base-200 text-[11px] font-mono font-semibold text-success">
                      ✓ 100% Free Cloud
                    </span>
                  </div>

                  {/* Interactive Post Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-base-content/10">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={toggleUpvote}
                        className={`btn btn-sm rounded-full font-mono flex items-center gap-1.5 transition-all ${
                          hasUpvoted 
                            ? "btn-primary shadow-lg shadow-primary/20 scale-105" 
                            : "btn-ghost bg-base-200/50 hover:bg-base-200"
                        }`}
                      >
                        <Flame className={`w-4 h-4 ${hasUpvoted ? "fill-current" : "text-warning"}`} />
                        <span>{upvotes}</span>
                        <span className="text-[10px] hidden sm:inline">Upvotes</span>
                      </button>

                      <div className="flex items-center gap-1 text-xs text-base-content/60 font-mono">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>34 Comments</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-primary font-bold font-mono">
                      <span>Live in Production</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Recruiter Callout Capsule */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/10 to-transparent border border-primary/20 backdrop-blur-md flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-base-content">
                        Recruiter / Engineering Manager?
                      </div>
                      <div className="text-[11px] text-base-content/60">
                        Inspect production code, Socket.IO architecture, or test live swiping.
                      </div>
                    </div>
                  </div>

                  <Link 
                    to="/signup" 
                    className="btn btn-xs btn-primary font-bold"
                  >
                    Test Live
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </motion.div>

        {/* BOTTOM FLOATING CONTROLS */}
        <div className="w-full z-40 bg-base-100/80 backdrop-blur-xl border-t border-base-content/10 px-4 md:px-8 py-2.5 flex items-center justify-between text-xs text-base-content/60 font-mono">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Use mouse wheel or touch gesture to progress horizontal timeline</span>
            <span className="sm:hidden">Swipe or scroll to progress timeline</span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => scrollToAct(Math.max(0, currentAct - 1))}
              disabled={currentAct === 0}
              className="hover:text-primary disabled:opacity-30 flex items-center gap-1"
            >
              &larr; Prev Act
            </button>
            <span className="text-primary font-bold">Act 0{currentAct + 1} of 04</span>
            <button 
              onClick={() => scrollToAct(Math.min(3, currentAct + 1))}
              disabled={currentAct === 3}
              className="hover:text-primary disabled:opacity-30 flex items-center gap-1"
            >
              Next Act &rarr;
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default DeveloperStory;
