import { useState, useEffect } from "react";

const GithubFlex = ({ username }) => {
  const [repos, setRepos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If they haven't linked an account, do nothing!
    if (!username) {
      setIsLoading(false);
      return;
    }

    const fetchGithubRepos = async () => {
      try {
        setIsLoading(true);
        // Hit the public GitHub API (No auth tokens required!)
        const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
        
        if (!res.ok) throw new Error("GitHub account not found");
        
        const data = await res.json();

        // Sort the repos by stars (highest first), filter out forks, and grab the top 4
        const topRepos = data
          .filter(repo => !repo.fork) // Don't show projects they just forked
          .sort((a, b) => b.stargazers_count - a.stargazers_count)
          .slice(0, 4); // Display the top 4

        setRepos(topRepos);
      } catch (err) {
        console.error(err);
        setError("Could not load GitHub repositories.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGithubRepos();
  }, [username]);

  if (!username) return null; // Hide the section entirely if no username is linked

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current text-base-content"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
        <h3 className="text-2xl font-bold">Top Repositories</h3>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4"><span className="loading loading-spinner text-primary"></span></div>
      ) : error ? (
        <p className="text-error opacity-70">{error}</p>
      ) : repos.length === 0 ? (
        <p className="opacity-50 italic">No public repositories found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {repos.map((repo) => (
            <a 
              key={repo.id} 
              href={repo.html_url} 
              target="_blank" 
              rel="noreferrer"
              className="card bg-base-200 border border-base-300 shadow-sm hover:shadow-md hover:border-primary/40 transition-all group"
            >
              <div className="card-body p-5">
                <h4 className="card-title text-lg group-hover:text-primary transition-colors">
                  {repo.name}
                </h4>
                <p className="text-sm opacity-70 line-clamp-2 min-h-[40px]">
                  {repo.description || "No description provided."}
                </p>
                
                <div className="flex items-center gap-4 mt-4 text-sm font-semibold">
                  {/* Language Bubble */}
                  {repo.language && (
                    <div className="flex items-center gap-1 opacity-80">
                      <span className="w-3 h-3 rounded-full bg-primary"></span>
                      {repo.language}
                    </div>
                  )}
                  {/* Stars Bubble */}
                  <div className="flex items-center gap-1 opacity-80 hover:text-warning transition-colors">
                    ⭐ {repo.stargazers_count}
                  </div>
                  {/* Forks Bubble */}
                  <div className="flex items-center gap-1 opacity-80">
                    📂 {repo.forks_count}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default GithubFlex;