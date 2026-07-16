import { motion } from "framer-motion";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";

const Toast = ({ message, type = "success", duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div className="toast toast-top toast-end z-50 animate-fade-in-down">
      <div className={`alert ${type === "success" ? "alert-success" : "alert-error"} shadow-lg rounded-xl`}>
        <span>{message}</span>
      </div>
    </div>
  );
};

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [age, setAge] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const handleSignup = async () => {
    setError("");

    if (
      !firstName ||
      !lastName ||
      !emailId ||
      !password ||
      !confirmPassword ||
      !age
    ) {
      setError("Please fill out all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(
        BASE_URL + "/signup",
        {
          firstName,
          lastName,
          emailId,
          password,
          confirmPassword,
          age,
        },
        { withCredentials: true },
      );

      dispatch(addUser(res.data.data));
      setToast({ show: true, message: "Welcome to DevNet! Redirecting...", type: "success" });

      setTimeout(() => {
        navigate("/");
      }, 2000); // Redirect slightly faster for a snappy feel
    } catch (err) {
      const msg = err?.response?.data?.message || "Signup failed. Please try again.";
      setError(msg);
      setToast({ show: true, message: msg, type: "error" });
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
            x: [0, -60, 50, 0],
            y: [0, 80, -40, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 70, -50, 0],
            y: [0, -70, 60, 0],
            scale: [1, 0.95, 1.15, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-secondary/10 blur-3xl"
        />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12 z-10">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-lg p-8 sm:p-10 rounded-3xl bg-base-200/50 backdrop-blur-xl shadow-2xl border border-base-content/10"
        >
          {toast.show && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast({ ...toast, show: false })}
            />
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSignup();
            }}
            className="space-y-5"
          >
            {/* Header */}
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
                  Create Account
                </h1>
                <p className="text-sm text-base-content/60 font-medium">
                  Join the professional community for developers
                </p>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-base-content/70">First Name</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/40 group-focus-within:text-primary transition-colors">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      className="input input-bordered w-full pl-11 bg-base-100/50 focus:bg-base-100 border-base-content/10 focus:border-primary focus:outline-none transition-all rounded-xl"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-base-content/70">Last Name</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/40 group-focus-within:text-primary transition-colors">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      className="input input-bordered w-full pl-11 bg-base-100/50 focus:bg-base-100 border-base-content/10 focus:border-primary focus:outline-none transition-all rounded-xl"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="form-control sm:col-span-2">
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
                  <label className="label">
                    <span className="label-text font-semibold text-base-content/70">Age</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="18"
                    max="120"
                    className="input input-bordered w-full bg-base-100/50 focus:bg-base-100 border-base-content/10 focus:border-primary focus:outline-none transition-all rounded-xl"
                    placeholder="18"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-base-content/70">Password</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/40 group-focus-within:text-primary transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
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

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-base-content/70">Confirm Password</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/40 group-focus-within:text-primary transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      className="input input-bordered w-full pl-11 pr-11 bg-base-100/50 focus:bg-base-100 border-base-content/10 focus:border-primary focus:outline-none transition-all rounded-xl"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
              {isLoading ? "Creating account..." : "Signup"}
            </motion.button>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-base-content/10"></div>
              <span className="flex-shrink mx-4 text-xs font-semibold uppercase tracking-wider text-base-content/40">Or register with</span>
              <div className="flex-grow border-t border-base-content/10"></div>
            </div>

            {/* Social Redirections */}
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
                <img src="/github-icon.png" alt="GitHub" className="w-5 h-5 object-contain" />
                GitHub
              </motion.button>
            </div>

            {/* Footer Navigation */}
            <p className="text-center text-sm font-medium text-base-content/60 pt-2">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:text-primary-focus underline font-semibold transition-all">
                Login here
              </Link>
            </p>
          </form>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default Signup;
