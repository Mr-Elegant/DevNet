import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import VerifiedBadge from "./VerifiedBadge";

const ViewProfile = () => {
  const { userId } = useParams(); // Gets the ID from the URL (/profile/:userId)
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/user/${userId}`, {
          withCredentials: true,
        });
        setProfile(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleSendRequest = async () => {
    try {
      await axios.post(
        `${BASE_URL}/request/send/interested/${userId}`,
        {},
        { withCredentials: true }
      );
      // Optimistically update the UI
      setProfile((prev) => ({ ...prev, connectionStatus: "interested" }));
    } catch (error) {
      console.error("Failed to send request:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Oops!</h2>
        <p className="text-error">{error}</p>
        <Link to="/search" className="btn btn-primary mt-4">Go Back to Search</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl min-h-screen">
      
      {/* 🟢 Hero Profile Section */}
      <div className="card bg-base-200 shadow-xl border border-base-300 mb-8 flex-col md:flex-row p-6 gap-8 items-center md:items-start">
        <div className="avatar">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 shadow-2xl">
            <img src={profile.photoUrl || "https://via.placeholder.com/150"} alt="Profile" />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl font-black flex items-center justify-center md:justify-start gap-2 mb-2">
            {profile.firstName} {profile.lastName}
            <VerifiedBadge isPremium={profile.isPremium} membershipType={profile.membershipType} />
          </h1>
          <p className="text-xl font-medium text-primary mb-4">
            {profile.headline || "Software Developer"}
          </p>

          <p className="text-base-content/80 mb-6 max-w-lg leading-relaxed">
            {profile.about || "This developer hasn't added an about section yet."}
          </p>

          {/* Connection Button Logic */}
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            {profile.connectionStatus === "self" ? (
              <Link to="/profile" className="btn btn-secondary">Edit My Profile</Link>
            ) : profile.connectionStatus === "accepted" ? (
              <button className="btn btn-success btn-outline cursor-default">🤝 Connected</button>
            ) : profile.connectionStatus === "interested" ? (
              <button className="btn btn-disabled">Request Pending...</button>
            ) : (
              <button onClick={handleSendRequest} className="btn btn-primary">
                Connect +
              </button>
            )}
            
            {profile.githubUsername && (
              <a 
                href={`https://github.com/${profile.githubUsername}`} 
                target="_blank" 
                rel="noreferrer"
                className="btn btn-outline"
              >
                View GitHub
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 🟢 Skills Section */}
      {profile.skills && profile.skills.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Tech Stack ⚡</h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, index) => (
              <span key={index} className="badge badge-primary badge-outline badge-lg p-4 font-semibold">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 🟢 Portfolio / Projects Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Projects & Portfolio 🚀</h2>
        {profile.projects && profile.projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.projects.map((project, index) => (
              <div key={index} className="card bg-base-100 shadow-md border border-base-300">
                {project.imageUrl && (
                  <figure>
                    <img src={project.imageUrl} alt={project.title} className="h-48 w-full object-cover" />
                  </figure>
                )}
                <div className="card-body p-5">
                  <h3 className="card-title text-lg">{project.title}</h3>
                  <p className="text-sm text-base-content/70">{project.description}</p>
                  {project.link && (
                    <div className="card-actions justify-end mt-4">
                      <a href={project.link} target="_blank" rel="noreferrer" className="btn btn-sm btn-secondary">
                        Live Demo
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-base-200 rounded-xl p-8 text-center border border-base-300 opacity-70">
            <p>No projects showcased yet.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default ViewProfile;