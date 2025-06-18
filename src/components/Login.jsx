import { motion } from "motion/react";
import { Eye, EyeOff} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { BASE_URL } from "../utils/constants";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [emailId, setEmailId] = useState("preet@gmail.com");
  const [password, setPassword] = useState("12345");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(BASE_URL +"/login", {
        emailId, password
      }, {withCredentials: true});
      // console.log(res.data);
      dispatch(addUser(res.data));
      return navigate("/")
    } catch (error) {
        setError(error?.response?.data || "Something went wrong")
        console.log(error)
    }
    
  };

  return (
    <div className="h-screen grid">
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
      <div  className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="w-17 h-14 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20
              transition-colors"
              >
              <img src="/DevNet F1.png" className="w-[100%] h-[100%] rounded-lg text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Welcome Back</h1>
              <p className="text-base-content/60">Sign in to your account</p>
            </div>
          </div>

          {/* Form */}
         

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  className={`input input-bordered w-full pl-2`}
                  placeholder="you@example.com"
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input input-bordered w-full pl-2`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-base-content/40" />
                  ) : (
                    <Eye className="h-5 w-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>
            <p className="text-red-500">{error}</p>  
                
            <button onClick={handleLogin} className="btn btn-primary w-full"> Login  </button>

      

          <div className="text-center">
            <p className="text-base-content/60">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="link link-primary">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>



      </motion.div>
    </div>
  )
};

export default Login;
