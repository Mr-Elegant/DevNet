import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { useDispatch } from "react-redux"; // ✅ You may have missed this import
import { addUser } from "../utils/userSlice";

// Toast Component
const Toast = ({ message, type = "success", duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useState(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="toast toast-top toast-end z-50">
      <div className={`alert alert-${type}`}>
        <span>{message}</span>
      </div>
    </div>
  );
};

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch(); // ✅ Needed for Redux
  const [showPassword, setShowPassword] = useState(false);
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [age, setAge] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const handleSignup = async () => {
    setError("");

    if (!firstName || !lastName || !emailId || !password || !confirmPassword || !age) {
      setError("Please fill out all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // ✅ FIX: store response from axios
      const res = await axios.post(BASE_URL + "/signup", {
        firstName,
        lastName,
        emailId,
        password,
        confirmPassword,
        age,
      }, { withCredentials: true });

      dispatch(addUser(res.data.data));

      setToast({ show: true, message: "Signup successful!", type: "success" });

      setTimeout(() => {
        navigate("/");
      }, 4000);
    } catch (err) {
      const msg = err?.response?.data?.message || "Signup failed.";
      console.error("Signup Error:", err); // ✅ Optional debug
      setError(msg);
      setToast({ show: true, message: msg, type: "error" });
    }
  };

  return (
    <>
      <NavBar />

      <div className="h-screen flex items-center justify-center px-4 my-[5%]">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg p-8 sm:p-10 rounded-2xl border backdrop-blur-md bg-white/10 shadow-xl"
          style={{
            borderColor: "#FD3FCA",
            boxShadow: `0 0 0 1px rgba(253, 63, 202, 0.5), 0 4px 20px rgba(253, 63, 202, 0.2)`,
          }}
        >
          {/* Toast Notification */}
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
          >
            <div className="text-center mb-6">
              <div className="flex flex-col items-center gap-2 group">
                <div className="w-17 h-14 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <img
                    src="/DevNet F1.png"
                    className="w-full h-full rounded-lg"
                    alt="logo"
                  />
                </div>
                <h1 className="text-2xl font-bold mt-2 text-white">Hii, Developer</h1>
                <p className="text-base-content/60">Create your account</p>
              </div>
            </div>

            {/* First Name */}
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-medium text-white">First Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full bg-white/20 text-white placeholder:text-gray-300"
                placeholder="Preet"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            {/* Last Name */}
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-medium text-white">Last Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full bg-white/20 text-white placeholder:text-gray-300"
                placeholder="Karwal"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-medium text-white">Email</span>
              </label>
              <input
                type="email"
                className="input input-bordered w-full bg-white/20 text-white placeholder:text-gray-300"
                placeholder="preet@example.com"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-medium text-white">Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="input input-bordered w-full bg-white/20 text-white placeholder:text-gray-300"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-medium text-white">Confirm Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full bg-white/20 text-white placeholder:text-gray-300"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Age */}
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-medium text-white">Age</span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full bg-white/20 text-white placeholder:text-gray-300"
                placeholder="18"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

            <button
              type="submit"
              className="btn btn-primary w-full mb-4"
              style={{ boxShadow: "0 0 10px rgba(253, 63, 202, 0.4)" }}
            >
              Signup
            </button>

            <div className="text-center text-sm text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary">
                Login with your account
              </Link>
            </div>
          </form>
        </motion.div>
      </div>

      <Footer />
    </>
  );
};

export default Signup;
