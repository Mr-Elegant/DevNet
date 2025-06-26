import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { removeUser } from "../utils/userSlice";

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
    <nav className="sticky top-0 z-50 bg-[#1F1F1F]/80 backdrop-blur-md shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 animate-fade-in transition-all duration-300 group">

        {/* Logo & Title */}
        <Link
          to="/"
          className="flex items-center gap-2 hover:scale-105 transition-transform duration-300"
        >
          <div className="relative rounded-lg overflow-hidden p-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 group-hover:animate-spin-slow">
            <img
              src="/DevNet F1.png"
              alt="DevNet Logo"
              className="w-9 h-9 rounded-md bg-black"
            />
          </div>
          <span className="text-2xl font-bold text-sky-400 tracking-wide">DevNet</span>
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
                className="btn btn-ghost btn-circle avatar ring-2 ring-pink-500 hover:ring-purple-500 transition duration-300"
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
