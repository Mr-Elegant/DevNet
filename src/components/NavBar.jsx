import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { removeUser } from "../utils/userSlice";
import { removeNotification } from "../utils/notificationSlice";
import { motion } from "framer-motion";
import ThemeSwitcher from "./ThemeSwitcher";
// ✨ IMPORT THE BADGE HERE
import VerifiedBadge from "./VerifiedBadge"; 

const NavBar = () => {
  const user = useSelector((store) => store.user);
  const notifications = useSelector((store) => store.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Safely calculate total unread badge number
  const totalUnread = notifications
    ? notifications.reduce((acc, curr) => acc + curr.count, 0)
    : 0;

  // Helper function for top-level NavLinks (Adds primary border when active)
  const getNavClass = ({ isActive }) => {
    return `btn btn-ghost btn-sm transition-all duration-200 ${
      isActive
        ? "text-primary border-b-2 border-primary rounded-b-none font-bold"
        : "opacity-70 hover:opacity-100"
    }`;
  };

  const handleNotificationClick = (notif) => {
    dispatch(
      removeNotification({ senderId: notif.senderId, type: notif.type }),
    );
    if (notif.type === "message") {
      navigate(`/chat/${notif.senderId}`);
    } else if (notif.type === "request") {
      navigate(`/requests`);
    }
  };

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
        {/* ==========================================
            LEFT SIDE: LOGO & TITLE
            ========================================== */}
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

        {/* ==========================================
            RIGHT SIDE: NAVIGATION & CONTROLS
            ========================================== */}
        {user && (
          <div className="flex items-center gap-3 sm:gap-4">
            {/* ✨ TOP LEVEL DESKTOP LINKS */}
            {/* Hidden on small screens so it doesn't clutter the mobile view */}
            <div className="hidden md:flex items-center gap-2 mr-2">
              <NavLink to="/search" className={getNavClass}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Search
              </NavLink>
              <NavLink to="/" className={getNavClass}>
                Swipe
              </NavLink>
              <NavLink to="/community" className={getNavClass}>
                Community 🚀
              </NavLink>
              <NavLink to="/connections" className={getNavClass}>
                Connections
              </NavLink>
            </div>

            {/* ✨ UPDATED: Added flex and items-center to align the badge perfectly with the text */}
            <span className="hidden lg:flex items-center gap-1 text-sm text-base-content/70 font-medium">
              Welcome, {user.firstName}
              <VerifiedBadge isPremium={user.isPremium} membershipType={user.membershipType} /> {/* 👈 Blue Tick inserted here! */}
            </span>

            {/* Theme Switcher (Preserved) */}
            <ThemeSwitcher />

            {/* 🔔 NOTIFICATION BELL (Preserved) */}
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle transition-transform hover:scale-105"
              >
                <div className="indicator">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-base-content"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {totalUnread > 0 && (
                    <span className="badge badge-sm badge-primary indicator-item shadow-sm">
                      {totalUnread}
                    </span>
                  )}
                </div>
              </div>

              <ul
                tabIndex={0}
                className="mt-3 z-[999] p-2 shadow-xl menu menu-sm dropdown-content bg-base-200 rounded-box w-72 border border-primary/20"
              >
                <li className="menu-title px-4 py-2 text-base-content font-bold border-b border-base-300">
                  Notifications
                </li>
                {notifications && notifications.length === 0 ? (
                  <li className="px-4 py-4 text-sm opacity-60 text-center">
                    No new notifications
                  </li>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notif, idx) => (
                      <li key={idx}>
                        <a
                          onClick={() => handleNotificationClick(notif)}
                          className="flex flex-col items-start gap-1 py-3 border-b border-base-300/50 last:border-0 hover:bg-base-300 transition-colors"
                        >
                          <div className="flex justify-between w-full items-center">
                            <span className="font-semibold text-primary">
                              {notif.type === "message"
                                ? "💬 New Message"
                                : "🤝 Friend Request"}
                            </span>
                            {notif.count > 1 && (
                              <span className="badge badge-xs badge-secondary">
                                {notif.count} new
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-medium">
                            {notif.firstName}
                          </span>
                          <span className="text-xs opacity-70 truncate w-full">
                            {notif.text}
                          </span>
                        </a>
                      </li>
                    ))}
                  </div>
                )}
              </ul>
            </div>

            {/* 👤 AVATAR DROPDOWN (Preserved & Cleaned up) */}
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
                className="menu dropdown-content mt-3 p-2 shadow-xl bg-base-200 rounded-box w-52 z-[999] border border-primary/10"
              >
                <li>
                  <Link to="/profile" className="flex justify-between">
                    Profile{" "}
                    <span className="badge badge-primary badge-sm">New</span>
                  </Link>
                </li>
                {/* These are still here for mobile users if they don't have BottomNav */}
                <li className="md:hidden">
                  <Link to="/">Swipe</Link>
                </li>
                <li className="md:hidden">
                  <Link to="/community">Community 🚀</Link>
                </li>
                <li className="md:hidden">
                  <Link to="/connections">Connections</Link>
                </li>

                <li>
                  <Link to="/requests">Requests</Link>
                </li>
                <li>
                  <Link to="/premium" className="text-secondary font-bold">
                    Premium
                  </Link>
                </li>

                <div className="divider my-0"></div>

                <li>
                  <button
                    onClick={handleLogout}
                    className="text-error font-semibold hover:bg-error/10"
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