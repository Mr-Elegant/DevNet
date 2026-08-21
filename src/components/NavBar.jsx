import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { removeUser } from "../store/userSlice";
import { removeNotification } from "../store/notificationSlice";
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

  // Helper function for top-level NavLinks (Modern Capsule indicators)
  const getNavClass = ({ isActive }) => {
    return `px-4 py-2 text-xs font-extrabold transition-all duration-200 rounded-full flex items-center gap-1.5 ${
      isActive
        ? "bg-primary text-primary-content shadow-lg shadow-primary/10 scale-105"
        : "text-base-content/65 hover:text-base-content hover:bg-base-200/50"
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
    <nav className="sticky top-0 z-50 bg-base-100/70 backdrop-blur-2xl border-b border-base-content/10 shadow-xl shadow-primary/5 transition-all">
      <div className="flex items-center justify-between px-6 py-3.5">
        {/* LEFT SIDE: LOGO */}
        <Link
          to="/"
          className="flex items-center gap-2.5 hover:opacity-90 transition-all duration-200"
        >
          <div className="avatar">
            <div className="w-8.5 h-8.5 rounded-xl ring-2 ring-primary/40 ring-offset-base-100 ring-offset-2">
              <img src="/DevNet F1.png" alt="DevNet Logo" />
            </div>
          </div>

          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-lg font-black tracking-tight text-base-content bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
          >
            DevNet
          </motion.span>
        </Link>

        {/* RIGHT SIDE: CONTROLS */}
        {user && (
          <div className="flex items-center gap-3.5">
            {/* DESKTOP LINKS */}
            <div className="hidden md:flex items-center gap-1">
              <NavLink to="/search" className={getNavClass}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
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

            <span className="hidden lg:flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-base-content/75 bg-base-200/50 py-1.5 px-3.5 rounded-full border border-base-content/5">
              {user.firstName}
              <VerifiedBadge isPremium={user.isPremium} membershipType={user.membershipType} />
            </span>

            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* NOTIFICATION BELL */}
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle btn-sm hover:bg-base-200/50"
              >
                <div className="indicator">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-base-content/85"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {totalUnread > 0 && (
                    <span className="badge badge-xs badge-primary indicator-item ring-2 ring-base-100 font-bold">
                      {totalUnread}
                    </span>
                  )}
                </div>
              </div>

              <ul
                tabIndex={0}
                className="mt-3 z-[999] p-2 shadow-2xl menu menu-sm dropdown-content bg-base-100/90 backdrop-blur-xl rounded-2xl w-80 border border-base-content/10 animate-fade-in"
              >
                <li className="menu-title px-4 py-2.5 text-base-content font-bold border-b border-base-content/5 text-sm">
                  Notifications
                </li>
                {notifications && notifications.length === 0 ? (
                  <li className="px-4 py-6 text-sm text-base-content/50 text-center italic">
                    No new notifications
                  </li>
                ) : (
                  <div className="max-h-80 overflow-y-auto mt-1 space-y-1">
                    {notifications.map((notif, idx) => (
                      <li key={idx}>
                        <a
                          onClick={() => handleNotificationClick(notif)}
                          className="flex flex-col items-start gap-1 py-3 px-4 rounded-xl hover:bg-base-200/50 transition-colors"
                        >
                          <div className="flex justify-between w-full items-center">
                            <span className="font-bold text-xs uppercase tracking-wider text-primary">
                              {notif.type === "message"
                                ? "💬 New Message"
                                : "🤝 Friend Request"}
                            </span>
                            {notif.count > 1 && (
                              <span className="badge badge-sm badge-secondary text-[10px]">
                                {notif.count} new
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-base-content">
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

            {/* AVATAR DROPDOWN */}
            <div className="dropdown dropdown-end">
              <button
                tabIndex={0}
                className="btn btn-ghost btn-circle btn-sm avatar hover:scale-105 transition"
              >
                <div className="w-8 h-8 rounded-full ring-2 ring-primary/40">
                  <img alt="User Avatar" src={user.photoUrl} className="object-cover rounded-full" />
                </div>
              </button>

              <ul
                tabIndex={0}
                className="menu dropdown-content mt-3 p-2 shadow-2xl bg-base-100/90 backdrop-blur-xl rounded-2xl w-56 z-[999] border border-base-content/10 animate-fade-in"
              >
                <li className="px-4 py-2 border-b border-base-content/5 mb-1.5">
                  <div className="flex flex-col gap-0.5 p-0 font-medium">
                    <span className="text-sm font-bold text-base-content">{user.firstName} {user.lastName}</span>
                    <span className="text-[10px] text-base-content/50 truncate w-full">{user.emailId}</span>
                  </div>
                </li>
                <li>
                  <Link to="/profile" className="flex justify-between py-2.5 px-4 rounded-xl hover:bg-base-200/50">
                    Profile
                    <span className="badge badge-primary badge-sm">View</span>
                  </Link>
                </li>
                <li className="md:hidden">
                  <Link to="/search" className="py-2.5 px-4 rounded-xl hover:bg-base-200/50">Search</Link>
                </li>
                <li className="md:hidden">
                  <Link to="/" className="py-2.5 px-4 rounded-xl hover:bg-base-200/50">Swipe</Link>
                </li>
                <li className="md:hidden">
                  <Link to="/community" className="py-2.5 px-4 rounded-xl hover:bg-base-200/50">Community 🚀</Link>
                </li>
                <li className="md:hidden">
                  <Link to="/connections" className="py-2.5 px-4 rounded-xl hover:bg-base-200/50">Connections</Link>
                </li>
                <li>
                  <Link to="/requests" className="py-2.5 px-4 rounded-xl hover:bg-base-200/50">Requests</Link>
                </li>
                <li>
                  <Link to="/premium" className="text-secondary font-bold py-2.5 px-4 rounded-xl hover:bg-base-200/50">
                    Premium Subscriptions
                  </Link>
                </li>

                <div className="divider my-1 opacity-50"></div>

                <li>
                  <button
                    onClick={handleLogout}
                    className="text-error font-semibold hover:bg-error/10 py-2.5 px-4 rounded-xl"
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