import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useEffect, useState } from "react";
import { addConnections } from "../utils/connectionSlice";
import { Link } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { useSocket } from "../utils/SocketContext"; 
import AOS from "aos";
import "aos/dist/aos.css";
// ✨ IMPORT THE BADGE
import VerifiedBadge from "./VerifiedBadge";

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

  if (!connections) return;

  if (error) {
    return (
      <div className="alert alert-error max-w-md mx-auto my-10">
        <span>{error}</span>
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="hero min-h-[50vh]">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-2xl font-bold">No Connections Found 🤝</h1>
            <p className="py-6 text-lg">
              But you can easily make many from your feed 😎
            </p>
            <Link to="/feed" className="btn btn-primary">
              Explore Feed
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const onlineCount = connections.filter(conn => onlineUsers.has(conn._id)).length;

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      <h1 className="text-4xl font-bold text-center mb-10">Connections</h1>

      <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
        <div className="w-full lg:w-1/4 lg:sticky lg:top-24" data-aos="fade-right">
          <div className="stats stats-vertical shadow w-full bg-base-200 border border-primary/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
            <div className="stat place-items-center py-6 border-b border-base-300">
              <div className="stat-title text-base-content/80 font-medium">Total Connections</div>
              <div className="stat-value text-primary text-4xl my-2">{connections.length}</div>
              <div className="stat-desc text-sm">Keep growing your network!</div>
            </div>
            <div className="stat place-items-center py-6">
              <div className="stat-title text-base-content/80 font-medium">Online Now</div>
              <div className="stat-value text-success text-4xl my-2">{onlineCount}</div>
              <div className="stat-desc text-sm">Ready to chat</div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-3/4 max-w-3xl space-y-4">
          {connections.map((connection, index) => {
            const { _id, firstName, lastName, photoUrl, age, gender, about, isPremium, membershipType } = connection;
            const isOnline = onlineUsers.has(_id);

            return (
              <div
                key={_id}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border border-primary/30"
              >
                <div className="card-body">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 flex-1">
                      
                      <div className={`avatar ${isOnline ? 'online' : ''}`}>
                        <div className="w-20 h-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                          <img src={photoUrl} alt={`${firstName} ${lastName}`} />
                        </div>
                      </div>

                      <div className="text-center sm:text-left flex-1">
                        {/* ✨ ADDED BADGE HERE */}
                        <h2 className="card-title text-xl justify-center sm:justify-start flex items-center">
                          {firstName} {lastName}
                          <VerifiedBadge isPremium={isPremium} membershipType={membershipType} />
                        </h2>

                        {age && gender && (
                          <div className="badge badge-outline badge-sm mt-1">
                            {age}, {gender}
                          </div>
                        )}
                        
                        <div className="mt-1 text-xs font-medium">
                          {isOnline ? (
                            <span className="text-success flex items-center justify-center sm:justify-start gap-1">
                              <span className="w-2 h-2 rounded-full bg-success"></span> Online now
                            </span>
                          ) : (
                            <span className="opacity-50 flex items-center justify-center sm:justify-start gap-1">
                              <span className="w-2 h-2 rounded-full bg-base-content/30"></span> Offline
                            </span>
                          )}
                        </div>

                        {about && (
                          <p className="text-sm opacity-80 mt-2 line-clamp-2">
                            {about}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="card-actions justify-center sm:justify-end">
                      <Link
                        to={`/chat/${_id}`}
                        state={{ user: connection }}
                        className="btn btn-primary btn-sm gap-2"
                      >
                        Chat
                      </Link>
                    </div>
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