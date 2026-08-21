import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { addUser } from "../store/userSlice";
import { motion } from "framer-motion";

import EditProfile from "./EditProfile";
import PortfolioManager from "../components/PortfolioManager";
import GithubFlex from "../components/GithubFlex";

const Profile = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();

  const [githubInput, setGithubInput] = useState(user?.githubUsername || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const handleSaveGithub = async () => {
    setIsSaving(true);
    setSaveMessage("");

    try {
      const res = await axios.patch(
        `${BASE_URL}/profile/github`,
        { githubUsername: githubInput },
        { withCredentials: true }
      );
      dispatch(addUser(res.data.data));
      setSaveMessage("✅ GitHub linked successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Failed to link GitHub:", error);
      setSaveMessage("❌ Failed to link account.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    user && (
      <div className="relative min-h-[90vh] w-full overflow-x-hidden">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="container mx-auto px-4 py-12 relative z-10 max-w-7xl flex flex-col gap-10">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-2"
          >
            <div className="h-10 w-2 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
            <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-base-content to-base-content/60">
              Command Center
            </h1>
          </motion.div>

          {/* Top Section: Form & Preview (Handled by EditProfile) */}
          <EditProfile user={user} />

          {/* Bottom Bento Grid: GitHub & Portfolio */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* GITHUB INTEGRATION BENTO */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-4 bg-base-200/40 backdrop-blur-3xl p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group"
            >
              {/* Neon border hover effect */}
              <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/30 transition-colors duration-500 rounded-3xl rounded-tl-3xl pointer-events-none"></div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-base-content/10 rounded-2xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current text-base-content">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight">GitHub Identity</h3>
                  <p className="text-xs font-semibold text-base-content/50 uppercase tracking-widest mt-1">Telemetry Sync</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-base-content/40 font-mono text-sm">github.com/</span>
                  </div>
                  <input
                    type="text"
                    value={githubInput}
                    onChange={(e) => setGithubInput(e.target.value)}
                    className="w-full bg-base-300/30 border border-white/10 rounded-2xl py-4 pl-[95px] pr-4 text-sm font-mono focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                    placeholder="username"
                  />
                </div>
                <button
                  onClick={handleSaveGithub}
                  disabled={isSaving || githubInput === user?.githubUsername}
                  className="w-full py-4 rounded-2xl bg-base-content text-base-100 font-bold uppercase tracking-wider text-sm hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-primary/30 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isSaving ? "Syncing..." : "Initialize Link"}
                </button>

                {saveMessage && (
                  <p className={`text-center text-sm font-bold mt-2 ${saveMessage.includes("✅") ? "text-success" : "text-error"}`}>
                    {saveMessage}
                  </p>
                )}
              </div>
            </motion.div>

            {/* PORTFOLIO MANAGER BENTO */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-8 bg-base-200/40 backdrop-blur-3xl p-8 rounded-3xl border border-white/5 shadow-2xl relative"
            >
               <PortfolioManager />
            </motion.div>
          </div>

          {/* GITHUB REPOSITORIES */}
          {user.githubUsername && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full bg-base-200/40 backdrop-blur-3xl p-8 rounded-3xl border border-white/5 shadow-2xl"
            >
              <GithubFlex username={user.githubUsername} />
            </motion.div>
          )}

        </div>
      </div>
    )
  );
};

export default Profile;