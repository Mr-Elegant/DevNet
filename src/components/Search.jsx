import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { Link } from "react-router-dom";

const Search = () => {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState(new Set()); // Tracks who we just sent a request to

  // ==========================================
  // DEBOUNCED SEARCH FUNCTION
  // ==========================================
  useEffect(() => {
    // If input is empty, clear results and stop
    if (!searchText.trim()) {
      setResults([]);
      return;
    }

    // We use a "debounce" timer. It waits 500ms after the user stops typing before hitting the backend.
    // This prevents app from making 50 API calls if they type "Preet" really fast!
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

  // ==========================================
  // SEND CONNECTION REQUEST
  // ==========================================
  const handleSendRequest = async (targetUserId) => {
    try {
      // Reusing your existing connection request route! (Adjust the URL if yours is different)
      await axios.post(
        `${BASE_URL}/request/send/interested/${targetUserId}`,
        {},
        { withCredentials: true }
      );
      
      // Update local state to instantly change the button to "Sent!"
      setSentRequests((prev) => new Set(prev).add(targetUserId));
    } catch (error) {
      console.error("Failed to send request:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl min-h-screen">
      
      {/* 1. SEARCH INPUT BOX */}
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

      {/* 2. LOADING SPINNER */}
      {isLoading && (
        <div className="flex justify-center my-8">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      )}

      {/* 3. SEARCH RESULTS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!isLoading && results.length > 0 && results.map((user) => (
          
          <div key={user._id} className="card bg-base-200 border border-base-300 shadow-sm hover:shadow-md transition-shadow flex-row p-4 items-center gap-4">
            
            {/* Avatar */}
            <Link to={`/profile/${user._id}`} className="avatar">
              <div className="w-16 h-16 rounded-full ring ring-primary/30 ring-offset-base-100 ring-offset-2">
                <img src={user.photoUrl || "https://via.placeholder.com/150"} alt="Avatar" />
              </div>
            </Link>
            
            {/* Info */}
            <div className="flex-1 overflow-hidden">
              <Link to={`/profile/${user._id}`} className="font-bold text-lg hover:text-primary truncate block">
                {user.firstName} {user.lastName}
              </Link>
              <p className="text-xs opacity-70 truncate">{user.headline || "Developer"}</p>
            </div>

            {/* Connect Button */}
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

      {/* 4. EMPTY STATE */}
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