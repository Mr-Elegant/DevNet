import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { removeUser } from "../utils/userSlice";
import { removeNotification } from "../utils/notificationSlice";
import { motion } from "framer-motion";
import ThemeSwitcher from "./ThemeSwitcher";

const NavBar = () => {
  const user = useSelector((store) => store.user);
  const notifications = useSelector((store) => store.notifications); // Get notifications from Redux store
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Safely calculate total unread badge number
  const totalUnread = notifications ? notifications.reduce((acc, curr) => acc + curr.count, 0) : 0;

  const handleNotificationClick = (notif) => {
    // Dispatch an action to remove this notification from the store
    dispatch(removeNotification({ senderId: notif.senderId, type: notif.type }));

    // Navigate to the relevant chat or page based on notification type
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

            {/* 🔔 NOTIFICATION BELL ADDED HERE */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle transition-transform hover:scale-105">
                <div className="indicator">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-base-content" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {totalUnread > 0 && (
                    <span className="badge badge-sm badge-primary indicator-item shadow-sm">
                      {totalUnread}
                    </span>
                  )}
                </div>
              </div>
              
              <ul tabIndex={0} className="mt-3 z-[999] p-2 shadow-xl menu menu-sm dropdown-content bg-base-200 rounded-box w-72 border border-primary/20">
                <li className="menu-title px-4 py-2 text-base-content font-bold border-b border-base-300">
                  Notifications
                </li>
                
                {notifications && notifications.length === 0 ? (
                  <li className="px-4 py-4 text-sm opacity-60 text-center">No new notifications</li>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notif, idx) => (
                      <li key={idx}>
                        <a onClick={() => handleNotificationClick(notif)} className="flex flex-col items-start gap-1 py-3 border-b border-base-300/50 last:border-0 hover:bg-base-300 transition-colors">
                          <div className="flex justify-between w-full items-center">
                            <span className="font-semibold text-primary">
                              {notif.type === 'message' ? '💬 New Message' : '👤 Friend Request'}
                            </span>
                            {notif.count > 1 && (
                              <span className="badge badge-xs badge-secondary">{notif.count} new</span>
                            )}
                          </div>
                          <span className="text-sm font-medium">{notif.firstName}</span>
                          <span className="text-xs opacity-70 truncate w-full">{notif.text}</span>
                        </a>
                      </li>
                    ))}
                  </div>
                )}
              </ul>
            </div>

            {/* Avatar dropdown (Untouched) */}
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