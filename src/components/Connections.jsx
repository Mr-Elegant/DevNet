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
    return <p className="text-red-400 text-center my-10">{error}</p>;
  }

  if (connections.length === 0) {
    return (
      <h1 className="text-center text-white text-lg my-10">
        No Connections Found 🥲 <br />
        But you can easily make many from your feed 😎
      </h1>
    );
  }

  return (
    <div className="text-center my-10 px-4">
      <h1 className="font-bold text-white text-3xl mb-6">Connections</h1>

      {connections.map((connection, index) => {
        const { _id, firstName, lastName, photoUrl, age, gender, about } = connection;

        return (
          <div
            key={_id}
            data-aos="fade-up"
            data-aos-delay={index * 100}
            className="flex flex-col sm:flex-row items-center justify-between m-4 p-6 rounded-2xl w-full max-w-2xl mx-auto
              bg-white/10 backdrop-blur-md border"
            style={{
              borderColor: "#fd3fca",
              boxShadow: `
                inset 0 0 10px rgba(253, 63, 202, 0.3),
                0 0 20px rgba(253, 63, 202, 0.6)
              `,
              transition: "all 0.5s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `
                inset 0 0 15px rgba(253, 63, 202, 0.4),
                0 0 30px rgba(253, 63, 202, 0.8)
              `;
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = `
                inset 0 0 10px rgba(253, 63, 202, 0.3),
                0 0 20px rgba(253, 63, 202, 0.6)
              `;
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <div className="flex items-center gap-4">
              <img
                alt="profile"
                className="w-20 h-20 rounded-full object-cover border"
                style={{ borderColor: "#fd3fca" }}
                src={photoUrl}
              />
              <div className="text-left">
                <h2 className="font-semibold text-xl">
                  {firstName + " " + lastName}
                </h2>
                {age && gender && (
                  <p className="text-sm text-gray-300">
                    {age}, {gender}
                  </p>
                )}
                <p className="text-sm text-gray-200">{about}</p>
              </div>
            </div>

            <Link to={`/chat/${_id}`} state={{user: connection}} className="mt-4 sm:mt-0">
              <button
                className="text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                style={{
                  backgroundColor: "#fd3fca",
                  boxShadow: "0 0 10px rgba(253, 63, 202, 0.6)",
                }}
              >
                Chat
              </button>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default Connections;
