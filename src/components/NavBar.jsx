import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { removeUser } from "../utils/userSlice";
import { motion } from "framer-motion";


const NavBar = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md bg-[#1F1F1F]/80"
      style={{
        borderBottom: "1px solid rgba(253, 63, 202, 0.3)",
        boxShadow: `
          inset 0 -1px 4px rgba(253, 63, 202, 0.2),
          0 4px 20px rgba(253, 63, 202, 0.05)
        `,
      }}
    >
      <div className="flex items-center justify-between px-4 py-2 transition-all duration-300 group">

        {/* Logo & Title */}
        <Link
          to="/"
          className="flex items-center gap-2 hover:scale-105 transition-transform duration-300"
        >
          <div
            className="relative rounded-lg overflow-hidden p-[2px]"
            style={{
              background: "linear-gradient(to right, #fd3fca, #7a5fff)",
              boxShadow: "0 0 12px rgba(253, 63, 202, 0.5)",
              borderRadius: "12px",
            }}
          >
            <img
              src="/DevNet F1.png"
              alt="DevNet Logo"
              className="w-9 h-9 rounded-md bg-black"
            />
          </div>


          <motion.span
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{
    scale: 1.08,
    textShadow: "0px 0px 12px rgba(135, 206, 250, 0.7)",
  }}
  transition={{ duration: 0.5, delay: 0.2 }}
  className="relative text-2xl font-bold text-sky-400 tracking-wide px-3 py-1 rounded-md overflow-hidden z-10"
>
  <span
    aria-hidden
    className="absolute inset-0 z-[-1] bg-gradient-to-r from-sky-500/20 via-blue-500/10 to-indigo-500/20 blur-sm rounded-md"
  ></span>
  DevNet
</motion.span>







        </Link>

        {/* Right Side */}
        {user && (
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-gray-300">
              Welcome, {user.firstName}
            </span>

            {/* Avatar dropdown */}
            <div className="dropdown dropdown-end relative">
              <button
                tabIndex={0}
                className="btn btn-ghost btn-circle avatar ring-2 ring-[#FD3FCA] hover:ring-purple-500 transition duration-300"
                style={{
                  boxShadow: "0 0 8px rgba(253, 63, 202, 0.4)",
                }}
              >
                <div className="w-10 rounded-full overflow-hidden">
                  <img
                    alt="User Avatar"
                    src={user.photoUrl}
                    className="hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </button>

              <ul
                tabIndex={0}
                className="menu dropdown-content mt-3 p-3 shadow-xl rounded-xl bg-[#2b2b2b]/90 backdrop-blur text-sm z-[999] w-52 space-y-1"
                style={{
                  border: "1px solid rgba(253, 63, 202, 0.3)",
                  boxShadow: "0 0 15px rgba(253, 63, 202, 0.2)",
                }}
              >
                <li>
                  <Link
                    to="/profile"
                    className="flex justify-between hover:text-sky-400 transition"
                  >
                    Profile
                    <span className="badge badge-primary text-white">New</span>
                  </Link>
                </li>
                <li>
                  <Link to="/connections" className="hover:text-sky-400 transition">
                    Connections
                  </Link>
                </li>
                <li>
                  <Link to="/requests" className="hover:text-sky-400 transition">
                    Requests
                  </Link>
                </li>
                <li>
                  <Link
                    to="/premium"
                    className="text-pink-400 hover:text-pink-500 transition"
                  >
                    Premium
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="text-red-400 hover:text-red-500 text-left w-full transition"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
