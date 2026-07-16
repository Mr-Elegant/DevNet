import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { BASE_URL } from "../utils/constants";
import NavBar from "./NavBar";
import Footer from "./Footer";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setIsLoading(true);
    try {
      const res = await axios.post(
        BASE_URL + "/login",
        { emailId, password },
        { withCredentials: true }
      );
      dispatch(addUser(res.data));
      navigate("/");
    } catch (err) {
      setError(err?.response?.data || "Something went wrong. Please check your credentials.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-base-100">
      <NavBar />
      
      {/* 🌌 Animated Ambient Background Glowing Orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -60, 40, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 50, 0],
            y: [0, 70, -50, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-secondary/10 blur-3xl"
        />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12 z-10">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-base-200/50 backdrop-blur-xl shadow-2xl border border-base-content/10"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-6"
          >
            {/* Logo and Headings */}
            <div className="text-center">
              <div className="flex flex-col items-center gap-3 group">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center p-2 border border-primary/20 shadow-inner"
                >
                  <img
                    src="/DevNet F1.png"
                    className="w-full h-full object-contain rounded-xl"
                    alt="logo"
                  />
                </motion.div>
                <h1 className="text-3xl font-extrabold tracking-tight mt-2 text-base-content bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Welcome Back
                </h1>
                <p className="text-sm text-base-content/60 font-medium">
                  Connect, share, and build with developers worldwide
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-base-content/70">Email Address</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/40 group-focus-within:text-primary transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    className="input input-bordered w-full pl-11 bg-base-100/50 focus:bg-base-100 border-base-content/10 focus:border-primary focus:outline-none transition-all rounded-xl"
                    placeholder="you@example.com"
                    value={emailId}
                    onChange={(e) => setEmailId(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-control">
                <div className="flex justify-between items-center">
                  <label className="label">
                    <span className="label-text font-semibold text-base-content/70">Password</span>
                  </label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/40 group-focus-within:text-primary transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="input input-bordered w-full pl-11 pr-11 bg-base-100/50 focus:bg-base-100 border-base-content/10 focus:border-primary focus:outline-none transition-all rounded-xl"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-base-content/40 hover:text-base-content transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="alert alert-error/15 text-error text-sm py-3 px-4 rounded-xl border border-error/25 flex gap-2 font-medium"
              >
                <span>⚠️ {error}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className={`btn btn-primary w-full rounded-xl font-bold tracking-wide shadow-lg shadow-primary/20 h-12 flex items-center justify-center transition-all ${
                isLoading ? "loading" : ""
              }`}
            >
              {isLoading ? "Signing in..." : "Login"}
            </motion.button>

            {/* Divider */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-base-content/10"></div>
              <span className="flex-shrink mx-4 text-xs font-semibold uppercase tracking-wider text-base-content/40">Or continue with</span>
              <div className="flex-grow border-t border-base-content/10"></div>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`}
                className="btn btn-outline border-base-content/10 hover:border-primary hover:bg-primary/5 text-base-content hover:text-primary rounded-xl flex items-center gap-2.5 font-semibold text-sm transition-all h-11"
              >
                <img src="/google-icon.png" alt="Google" className="w-5 h-5 object-contain" />
                Google
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/github`}
                className="btn btn-outline border-base-content/10 hover:border-neutral-content hover:bg-neutral/5 text-base-content hover:text-neutral-content rounded-xl flex items-center gap-2.5 font-semibold text-sm transition-all h-11"
              >
                <img src="/github-icon.png" alt="GitHub" className="w-5 h-5 object-contain filter dark:invert-0" />
                GitHub
              </motion.button>
            </div>

            {/* Footer Navigation */}
            <p className="text-center text-sm font-medium text-base-content/60 pt-2">
              New to DevNet?{" "}
              <Link to="/signup" className="text-primary hover:text-primary-focus underline font-semibold transition-all">
                Create an account
              </Link>
            </p>
          </form>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;