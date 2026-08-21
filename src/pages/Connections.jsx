import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useEffect, useState } from "react";
import { addConnections } from "../store/connectionSlice";
import { Link } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { useSocket } from "../context/SocketContext"; 
import AOS from "aos";
import "aos/dist/aos.css";
import VerifiedBadge from "../components/VerifiedBadge";
import { motion } from "framer-motion";

const Connections = () => {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();
  const [error, setError] = useState("");
  
  const socket = useSocket();
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const fetchConnections = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/connections`, {
        withCredentials: true,
      });
      dispatch(addConnections(res.data.data));
    } catch (err) {
      console.error(err);
      setError("Failed to fetch connections. Please try again later.");
    }
  };

  useEffect(() => {
    fetchConnections();
    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    if (!socket || !connections || connections.length === 0) return;

    connections.forEach((conn) => {
      socket.emit("checkOnlineStatus", conn._id);
    });

    const handleOnlineStatus = ({ userId, isOnline }) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        if (isOnline) newSet.add(userId);
        else newSet.delete(userId);
        return newSet;
      });
    };

    const handleUserOnline = (userId) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.add(userId);
        return newSet;
      });
    };

    const handleUserOffline = (userId) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    };

    socket.on("onlineStatus", handleOnlineStatus);
    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);

    return () => {
      socket.off("onlineStatus", handleOnlineStatus);
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);
    };
  }, [socket, connections]);

  if (!connections) return null;

  if (error) {
    return (
      <div className="flex justify-center py-10">
        <div className="alert alert-error/15 text-error text-sm max-w-md border border-error/25 rounded-2xl flex gap-2 font-medium">
          <span>⚠️ {error}</span>
        </div>
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-base-200/50 backdrop-blur-xl border border-base-content/10 shadow-2xl text-center space-y-6"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary border border-primary/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.318a4.5 4.5 0 00-6.364 0L12 17.657l8.682-8.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black text-base-content tracking-tight">No Connections Yet</h1>
            <p className="text-sm text-base-content/60 mt-2 font-medium leading-relaxed">
              Build your network of developers! Swipe right on developers in the feed who share your interests to start connecting.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/" className="btn btn-primary w-full rounded-xl font-bold tracking-wide shadow-lg shadow-primary/20 h-11">
              Explore Feed
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const onlineCount = connections.filter(conn => onlineUsers.has(conn._id)).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black tracking-tight text-base-content bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          My Network
        </h1>
        <p className="text-sm font-semibold text-base-content/50 uppercase tracking-widest mt-1">Connections</p>
      </div>

      <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
        {/* Statistics Panel */}
        <div className="w-full lg:w-1/3 lg:sticky lg:top-24" data-aos="fade-right">
          <div className="rounded-3xl bg-base-200/50 backdrop-blur-xl border border-base-content/10 shadow-2xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-base-content">Network Stats</h3>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="p-4 rounded-2xl bg-base-100/50 border border-base-content/5 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-semibold text-base-content/65 uppercase tracking-wide">Total Connections</span>
                <span className="text-3xl font-black text-primary mt-1.5">{connections.length}</span>
              </div>
              <div className="p-4 rounded-2xl bg-base-100/50 border border-base-content/5 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-semibold text-base-content/65 uppercase tracking-wide">Online Now</span>
                <span className="text-3xl font-black text-success mt-1.5">{onlineCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Connections List */}
        <div className="w-full lg:w-2/3 max-w-2xl space-y-4">
          {connections.map((connection, index) => {
            const { _id, firstName, lastName, photoUrl, age, gender, about, isPremium, membershipType } = connection;
            const isOnline = onlineUsers.has(_id);

            return (
              <div
                key={_id}
                data-aos="fade-up"
                data-aos-delay={index * 80}
                className="rounded-3xl bg-base-200/40 backdrop-blur-xl border border-base-content/10 shadow-xl p-5 hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] hover:border-primary/20"
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 flex-1">
                    
                    <div className={`avatar ${isOnline ? 'online' : ''} shrink-0`}>
                      <div className="w-16 h-16 rounded-full ring-2 ring-primary/40 ring-offset-2 ring-offset-base-100">
                        <img src={photoUrl} alt={`${firstName} ${lastName}`} className="object-cover" />
                      </div>
                    </div>

                    <div className="text-center sm:text-left flex-1 min-w-0">
                      <h2 className="text-lg font-black tracking-tight text-base-content flex items-center justify-center sm:justify-start gap-1">
                        {firstName} {lastName}
                        <VerifiedBadge isPremium={isPremium} membershipType={membershipType} />
                      </h2>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                        {age && gender && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-base-content/5 text-base-content/70 uppercase">
                            {age} • {gender}
                          </span>
                        )}
                        
                        <div className="text-[10px] font-bold uppercase tracking-wider">
                          {isOnline ? (
                            <span className="text-success flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-success"></span> Online
                            </span>
                          ) : (
                            <span className="opacity-40 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-base-content/25"></span> Offline
                            </span>
                          )}
                        </div>
                      </div>

                      {about && (
                        <p className="text-xs font-semibold text-base-content/70 mt-3 line-clamp-2 leading-relaxed">
                          {about}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 w-full sm:w-auto">
                    <Link
                      to={`/chat/${_id}`}
                      state={{ user: connection }}
                      className="btn btn-primary rounded-xl font-bold tracking-wide w-full sm:w-24 h-10 min-h-[40px] shadow-md shadow-primary/10"
                    >
                      Chat
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Connections;