import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";

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
  const dispatch = useDispatch();
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
      setError(msg);
      setToast({ show: true, message: msg, type: "error" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg p-8 sm:p-10 rounded-2xl bg-base-200 shadow-xl border border-primary/20"
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
                <h1 className="text-2xl font-bold mt-2 text-base-content">Hii, Developer</h1>
                <p className="text-base-content/60">Create your account</p>
              </div>
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-medium">First Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-medium">Last Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <input
                type="email"
                className="input input-bordered w-full"
                placeholder="you@example.com"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
              />
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="input input-bordered w-full"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-base-content/60 hover:text-base-content"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-medium">Confirm Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-base-content/60 hover:text-base-content"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-medium">Age</span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                placeholder="18"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-error mb-4">{error}</p>}

            <button type="submit" className="btn btn-primary w-full mb-4">
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
    </div>
  );
};

export default Signup;