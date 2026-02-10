import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { removeUser } from "../utils/userSlice";
import { motion } from "framer-motion";
import ThemeSwitcher from "./ThemeSwitcher";

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
    <nav className="sticky top-0 z-50 bg-base-200 border-b border-primary/20 shadow-lg">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo & Title */}
        <Link
          to="/"
          className="flex items-center gap-2 hover:scale-105 transition-transform duration-300"
        >
          <div className="avatar">
            <div className="w-10 rounded-lg ring ring-primary ring-offset-base-100 ring-offset-2">
              <img src="/DevNet F1.png" alt="DevNet Logo" />
            </div>
          </div>

          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-bold text-primary"
          >
            DevNet
          </motion.span>
        </Link>

        {/* Right Side */}
        {user && (
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-base-content/70">
              Welcome, {user.firstName}
            </span>

            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* Avatar dropdown */}
            <div className="dropdown dropdown-end">
              <button
                tabIndex={0}
                className="btn btn-ghost btn-circle avatar ring-2 ring-primary hover:ring-secondary transition"
              >
                <div className="w-10 rounded-full">
                  <img alt="User Avatar" src={user.photoUrl} />
                </div>
              </button>

              <ul
                tabIndex={0}
                className="menu dropdown-content mt-3 p-2 shadow-xl bg-base-200 rounded-box w-52 z-[999]"
              >
                <li>
                  <Link to="/profile" className="flex justify-between">
                    Profile
                    <span className="badge badge-primary badge-sm">New</span>
                  </Link>
                </li>
                <li>
                  <Link to="/connections">Connections</Link>
                </li>
                <li>
                  <Link to="/requests">Requests</Link>
                </li>
                <li>
                  <Link to="/premium" className="text-secondary">
                    Premium
                  </Link>
                </li>
                <li>
                  <button onClick={handleLogout} className="text-error">
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