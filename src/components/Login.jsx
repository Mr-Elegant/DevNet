import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
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
  const [emailId, setEmailId] = useState("preet@gmail.com");
  const [password, setPassword] = useState("12345");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        BASE_URL + "/login",
        { emailId, password },
        { withCredentials: true }
      );
      dispatch(addUser(res.data));
      navigate("/");
    } catch (err) {
      setError(err?.response?.data || "Something went wrong");
      console.error(err);
    }
  };

  return (
    <>
      <NavBar />
      <div className="h-screen flex items-center justify-center px-4 m-[-6%]">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-8 sm:p-10 rounded-2xl border backdrop-blur-md bg-white/10 shadow-xl"
          style={{
            borderColor: "#FD3FCA",
            boxShadow: `
            0 0 0 1px rgba(253, 63, 202, 0.5),
            0 4px 20px rgba(253, 63, 202, 0.2)
          `,
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
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
                <h1 className="text-2xl font-bold mt-2 text-white">
                  Welcome Back
                </h1>
                <p className="text-base-content/60">Sign in to your account</p>
              </div>
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-medium text-white">Email</span>
              </label>
              <input
                type="email"
                className="input input-bordered w-full bg-white/20 text-white placeholder:text-gray-300"
                placeholder="you@example.com"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
              />
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-medium text-white">
                  Password
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
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

            {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

            <button
              type="submit"
              className="btn btn-primary w-full mb-4"
              style={{
                boxShadow: "0 0 10px rgba(253, 63, 202, 0.4)",
              }}
            >
              Login
            </button>

            <div className="text-center text-sm text-base-content/60">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="link link-primary">
                Create account
              </Link>
            </div>
          </form>
        </motion.div>
      </div>

      <Footer />
    </>
  );
};

export default Login;
