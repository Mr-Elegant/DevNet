import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Code2, 
  Sparkles, 
  Layers, 
  Zap, 
  Users, 
  MessageSquare, 
  ShieldCheck, 
  ArrowRight, 
  ChevronDown, 
  Terminal, 
  Globe, 
  Cpu, 
  Flame, 
  CheckCircle2, 
  ExternalLink,
  Laptop
} from "lucide-react";
import DeveloperStory from "../components/DeveloperStory";

const Landing = () => {
  const storyRef = useRef(null);

  const scrollToStory = () => {
    if (storyRef.current) {
      storyRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const featureCards = [
    {
      icon: <Flame className="w-6 h-6 text-primary" />,
      title: "Tinder For Developers",
      description: "Discover peers based on verified tech stack heuristics, architectural styles, and project ambitions. Swipe right to connect.",
      tag: "MatchMaker Heuristics"
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-secondary" />,
      title: "Zero-Latency Sockets",
      description: "Duplex instant messaging powered by Socket.IO with delivery confirmations, live typing indicators, and image attachments.",
      tag: "Sub-50ms Sync"
    },
    {
      icon: <Layers className="w-6 h-6 text-accent" />,
      title: "Architecture Canvas & AI Architect",
      description: "Custom collaborative vector canvas with microservice shapes, free OpenRouter AI architecture generation, and 1-click community feed sharing.",
      tag: "Vector Canvas + Free LLM"
    },
    {
      icon: <Globe className="w-6 h-6 text-success" />,
      title: "Global Tech Community",
      description: "Publish releases, discuss RFCs, and gather feedback on your side projects with an active community of elite builders.",
      tag: "Interactive Feed"
    }
  ];

  const cloudHighlights = [
    {
      provider: "Vercel Edge",
      role: "Frontend CDN & SSR",
      detail: "React 19 + Vite deployed to global edge locations for instant first-byte times."
    },
    {
      provider: "Render Web Service",
      role: "Backend & Sockets",
      detail: "Express 5 runtime with built-in keep-alive self-ping heartbeat for 24/7 uptime."
    },
    {
      provider: "OpenRouter AI",
      role: "Free LLM Engine",
      detail: "Zero-cost Llama 3.3 70B & Gemini 2.0 Flash models generating live system design architecture topologies."
    },
    {
      provider: "Cloudflare Anycast",
      role: "DNS & SSL Edge",
      detail: "Zero-latency SSL termination and DDoS mitigation on custom domain devnet.co.in."
    },
    {
      provider: "Resend API",
      role: "Transactional Email",
      detail: "Instant asynchronous email notifications on incoming connection requests."
    }
  ];

  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-primary-content">
      
      {/* ============================================================== */}
      {/* 1. HERO SECTION                                                */}
      {/* ============================================================== */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-12 pb-20 text-center overflow-hidden">
        
        {/* Ambient Gradient Background Glows */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-primary/20 via-secondary/15 to-accent/15 rounded-full blur-3xl pointer-events-none -z-10" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-base-200/80 border border-base-content/10 shadow-lg text-xs font-mono font-bold text-base-content/80 backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span>DEVNET V2.0 // DEPLOYED ON 100% FREE CLOUD INFRASTRUCTURE</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
            Stop Coding In Isolation. <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Connect. Collaborate. Ship.
            </span>
          </h1>

          {/* Subheading */}
          <p className="max-w-2xl mx-auto text-base-content/70 text-base sm:text-lg lg:text-xl font-normal leading-relaxed">
            The developer collaboration network that pairs you with engineers who complement your stack. 
            Swipe to match, jump into real-time Socket.IO chat, sketch architectures on shared whiteboards, and ship together.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/signup"
              className="btn btn-primary btn-lg w-full sm:w-auto font-black shadow-2xl shadow-primary/30 px-8 group"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </Link>

            <button
              onClick={scrollToStory}
              className="btn btn-ghost btn-lg w-full sm:w-auto font-bold border border-base-content/10 hover:bg-base-200/60 flex items-center gap-2"
            >
              <span>Experience The Story</span>
              <ChevronDown className="w-4 h-4 animate-bounce" />
            </button>
          </div>

          {/* Live Platform Proof Ribbons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-8 max-w-3xl mx-auto">
            <div className="p-3 rounded-2xl bg-base-200/50 border border-base-content/5 backdrop-blur-sm">
              <div className="text-lg font-black text-primary">&lt; 50ms</div>
              <div className="text-[11px] text-base-content/60 font-medium">Socket.IO Sync</div>
            </div>
            <div className="p-3 rounded-2xl bg-base-200/50 border border-base-content/5 backdrop-blur-sm">
              <div className="text-lg font-black text-secondary">100% Free</div>
              <div className="text-[11px] text-base-content/60 font-medium">Cloud Hosting</div>
            </div>
            <div className="p-3 rounded-2xl bg-base-200/50 border border-base-content/5 backdrop-blur-sm">
              <div className="text-lg font-black text-accent">AI Architect</div>
              <div className="text-[11px] text-base-content/60 font-medium">Free LLM Engine</div>
            </div>
            <div className="p-3 rounded-2xl bg-base-200/50 border border-base-content/5 backdrop-blur-sm">
              <div className="text-lg font-black text-success">Resend</div>
              <div className="text-[11px] text-base-content/60 font-medium">Email Delivery</div>
            </div>
          </div>

        </motion.div>
      </section>

      {/* ============================================================== */}
      {/* 2. HORIZONTAL SCROLL-DRIVEN STORYTELLING ENGINE                 */}
      {/* ============================================================== */}
      <div ref={storyRef}>
        <DeveloperStory />
      </div>

      {/* ============================================================== */}
      {/* 3. PLATFORM PILLARS (DEEP DIVE FEATURE GRID)                    */}
      {/* ============================================================== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
            <Cpu className="w-3.5 h-3.5" />
            Platform Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Engineered For The Modern Software Craftsperson
          </h2>
          <p className="text-base-content/70 text-sm sm:text-base">
            Every feature in DevNet is built from first principles to remove friction between meeting an engineer and shipping production software.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureCards.map((feat, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -6 }}
              className="p-6 rounded-3xl bg-base-200/40 border border-base-content/10 hover:border-primary/40 transition-all duration-300 backdrop-blur-xl flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-base-100 flex items-center justify-center shadow-lg border border-base-content/5">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-base-content">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-sm text-base-content/70 leading-relaxed">
                  {feat.description}
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-base-content/5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
                  {feat.tag}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. CLOUD ARCHITECTURE SHOWCASE (RECRUITER & ENGINEER APPEAL)   */}
      {/* ============================================================== */}
      <section className="py-20 bg-base-200/30 border-y border-base-content/10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 text-xs font-mono font-bold tracking-wider uppercase">
                <Terminal className="w-3.5 h-3.5" />
                Zero-Cost Cloud Topology
              </div>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Architected For $0/Month. <br />
                <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                  Zero Cold Starts. 24/7 Live.
                </span>
              </h2>

              <p className="text-base-content/75 text-sm sm:text-base leading-relaxed">
                DevNet runs entirely on modern free tier cloud providers with custom keep-alive heartbeats, 
                eliminating AWS costs while delivering sub-100ms response times globally.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm">
                    <span className="font-bold text-base-content">Automated Heartbeat Keep-Alive:</span>{" "}
                    <span className="text-base-content/70">A built-in 12-minute cron service self-pings the Render instance to prevent container sleep.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm">
                    <span className="font-bold text-base-content">Asynchronous Resend Dispatch:</span>{" "}
                    <span className="text-base-content/70">Decoupled non-blocking email delivery guarantees user actions complete instantly even during network spikes.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cloudHighlights.map((node, i) => (
                <div key={i} className="p-5 rounded-2xl bg-base-100/80 border border-base-content/10 shadow-lg backdrop-blur-md space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-base-content">{node.provider}</span>
                    <span className="badge badge-xs badge-primary font-mono">{node.role}</span>
                  </div>
                  <p className="text-xs text-base-content/70 leading-relaxed">
                    {node.detail}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. FINAL CALL TO ACTION                                        */}
      {/* ============================================================== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Ready To Meet Your Technical Co-Creator?
          </h2>
          <p className="text-base-content/70 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Create your profile in 60 seconds, configure your verified tech stack, and begin swiping immediately.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/signup"
              className="btn btn-primary btn-lg w-full sm:w-auto font-black shadow-2xl shadow-primary/30 px-8"
            >
              Sign Up For DevNet Free
            </Link>

            <Link
              to="/login"
              className="btn btn-ghost btn-lg w-full sm:w-auto font-bold border border-base-content/10"
            >
              Already Have An Account? Sign In
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Landing;
