// Redux hooks for state access and dispatch
import { useDispatch, useSelector } from "react-redux";

import axios from "axios";
import { useEffect, useState } from "react";

// Redux action to store connections
import { addConnections } from "../utils/connectionSlice";
import { Link } from "react-router-dom";
import { BASE_URL } from "../utils/constants";

// Animation library
import AOS from "aos";
import "aos/dist/aos.css";

/**
 * Connections component
 * Displays all accepted user connections
 */
const Connections = () => {
  // Retrieve connections from Redux store
  const connections = useSelector((store) => store.connections);
  // Redux dispatcher
  const dispatch = useDispatch();
  // Error state for API failures
  const [error, setError] = useState("");

  /**
   * Fetches user's connections from backend
   */
  const fetchConnections = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/connections`, {
        withCredentials: true,
      });
      // Store connections in Redux
      dispatch(addConnections(res.data.data));
    } catch (err) {
      console.error(err);
      setError("Failed to fetch connections. Please try again later.");
    }
  };

  /**
   * Fetch connections on component mount
   * Initialize AOS animations
   */
  useEffect(() => {
    fetchConnections();
    AOS.init({ duration: 800, once: true });
  }, []);

  if (!connections) return;

  if (error) {
    return (
      <div className="alert alert-error max-w-md mx-auto my-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{error}</span>
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="hero min-h-[50vh]">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-2xl font-bold">No Connections Found 🥲</h1>
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

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-center mb-8">Connections</h1>

      <div className="space-y-4 max-w-3xl mx-auto">
        {connections.map((connection, index) => {
          const { _id, firstName, lastName, photoUrl, age, gender, about } =
            connection;

          return (
            <div
              key={_id}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border border-primary/30"
            >
              <div className="card-body">
                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                  {/* User Info Section */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 flex-1">
                    <div className="avatar">
                      <div className="w-20 h-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                        <img src={photoUrl} alt={`${firstName} ${lastName}`} />
                      </div>
                    </div>

                    <div className="text-center sm:text-left flex-1">
                      <h2 className="card-title text-xl justify-center sm:justify-start">
                        {firstName} {lastName}
                      </h2>
                      {age && gender && (
                        <div className="badge badge-outline badge-sm mt-1">
                          {age}, {gender}
                        </div>
                      )}
                      {about && (
                        <p className="text-sm opacity-80 mt-2 line-clamp-2">
                          {about}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Chat Button */}
                  <div className="card-actions justify-center sm:justify-end">
                    <Link
                      to={`/chat/${_id}`}
                      state={{ user: connection }}
                      className="btn btn-primary btn-sm gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      Chat
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Section */}
      <div className="stats shadow mt-10 mx-auto">
        <div className="stat place-items-center">
          <div className="stat-title">Total Connections</div>
          <div className="stat-value text-primary">{connections.length}</div>
          <div className="stat-desc">Keep growing your network!</div>
        </div>
      </div>
    </div>
  );
};

export default Connections;