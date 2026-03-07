import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { addUser } from "../utils/userSlice"; // Ensure this path matches your Redux slice!

import EditProfile from "./EditProfile";
import PortfolioManager from "./PortfolioManager";
import GithubFlex from "./GithubFlex";

const Profile = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();

  // ==========================================
  // GITHUB LINK STATE
  // ==========================================
  // Initialize the input with their existing username if they already have one
  const [githubInput, setGithubInput] = useState(user?.githubUsername || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // ==========================================
  // HANDLE SAVE GITHUB USERNAME
  // ==========================================
  const handleSaveGithub = async () => {
    setIsSaving(true);
    setSaveMessage("");

    try {
      const res = await axios.patch(
        `${BASE_URL}/profile/github`,
        { githubUsername: githubInput },
        { withCredentials: true }
      );

      // Instantly update the global Redux store so the UI updates
      dispatch(addUser(res.data.data));

      setSaveMessage("✅ GitHub linked successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Failed to link GitHub:", error);
      setSaveMessage("❌ Failed to link account.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    user && (
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
        
        {/* 1. MAIN PROFILE EDIT */}
        <EditProfile user={user} />

        {/* ==========================================
            2. GITHUB INTEGRATION SECTION
            ========================================== */}
        <div className="bg-base-200 p-6 rounded-2xl border border-base-300 shadow-sm w-full">
          <div className="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="fill-current text-base-content">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <h3 className="text-lg font-bold">Developer Portfolio</h3>
          </div>

          <p className="text-sm opacity-70 mb-4">
            Link your GitHub username to automatically showcase your top repositories.
          </p>

          <div className="flex flex-col gap-2 max-w-lg">
            <div className="join w-full shadow-sm">
              <span className="join-item bg-base-300 flex items-center px-4 text-sm opacity-70 border border-base-300">
                github.com/
              </span>
              <input
                type="text"
                placeholder="username"
                value={githubInput}
                onChange={(e) => setGithubInput(e.target.value)}
                className="input input-bordered join-item w-full focus:outline-primary"
              />
              <button
                onClick={handleSaveGithub}
                disabled={isSaving || githubInput === user?.githubUsername}
                className="btn btn-primary join-item"
              >
                {isSaving ? <span className="loading loading-spinner loading-sm"></span> : "Save"}
              </button>
            </div>

            {saveMessage && (
              <p className={`text-sm mt-2 font-semibold ${saveMessage.includes("✅") ? "text-success" : "text-error"}`}>
                {saveMessage}
              </p>
            )}
          </div>
        </div>

        {/* ==========================================
            3. DISPLAY THE REPOSITORIES
            ========================================== */}
        {/* Only render the GithubFlex component if they have actually saved a username to the database */}
        {user.githubUsername && (
          <div className="w-full">
            <GithubFlex username={user.githubUsername} />
          </div>
        )}

        {/* 4. PORTFOLIO MANAGER */}
        <PortfolioManager />

      </div>
    )
  );
};

export default Profile;