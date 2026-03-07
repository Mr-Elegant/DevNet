import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { Link } from "react-router-dom";

import VerifiedBadge from "./VerifiedBadge";

const Search = () => {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState(new Set()); 

  useEffect(() => {
    if (!searchText.trim()) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/user/search?q=${searchText}`, {
          withCredentials: true,
        });
        setResults(res.data.data);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText]);

  const handleSendRequest = async (targetUserId) => {
    try {
      await axios.post(
        `${BASE_URL}/request/send/interested/${targetUserId}`,
        {},
        { withCredentials: true }
      );
      setSentRequests((prev) => new Set(prev).add(targetUserId));
    } catch (error) {
      console.error("Failed to send request:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl min-h-screen">
      <div className="flex flex-col items-center mb-10">
        <h1 className="text-3xl font-black mb-6">Find Developers 🔍</h1>
        <div className="join w-full max-w-md shadow-xl">
          <input 
            type="text" 
            placeholder="Search by name or tech stack (e.g. React)..." 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="input input-bordered input-primary join-item w-full" 
          />
          <button className="btn btn-primary join-item">
            Search
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center my-8">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!isLoading && results.length > 0 && results.map((user) => (
          <div key={user._id} className="card bg-base-200 border border-base-300 shadow-sm hover:shadow-md transition-shadow flex-row p-4 items-center gap-4">
            
            <Link to={`/profile/${user._id}`} className="avatar">
              <div className="w-16 h-16 rounded-full ring ring-primary/30 ring-offset-base-100 ring-offset-2">
                <img src={user.photoUrl || "https://via.placeholder.com/150"} alt="Avatar" />
              </div>
            </Link>
            
            <div className="flex-1 overflow-hidden">
              {/* ✨ ADDED BADGE HERE - Wrapped in flex box to keep text truncation clean */}
              <Link to={`/profile/${user._id}`} className="font-bold text-lg hover:text-primary flex items-center gap-1 overflow-hidden">
                <span className="truncate">{user.firstName} {user.lastName}</span>
                <VerifiedBadge isPremium={user.isPremium} membershipType={user.membershipType} />
              </Link>
              <p className="text-xs opacity-70 truncate">{user.headline || "Developer"}</p>
            </div>

            <div>
              {sentRequests.has(user._id) ? (
                <button className="btn btn-sm btn-success btn-outline cursor-default">
                  ✓ Sent
                </button>
              ) : (
                <button 
                  onClick={() => handleSendRequest(user._id)}
                  className="btn btn-sm btn-primary"
                >
                  Connect +
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {!isLoading && searchText && results.length === 0 && (
        <div className="text-center opacity-50 mt-10">
          <p className="text-xl">No developers found matching "{searchText}"</p>
          <p className="text-sm mt-2">Try searching for a different name or skill.</p>
        </div>
      )}
    </div>
  );
};

export default Search;