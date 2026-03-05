// ==========================================
// 1. IMPORTS
// ==========================================
import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import CreatePost from "./CreatePost";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const GlobalFeed = () => {
  // ==========================================
  // 2. STATE MANAGEMENT
  // ==========================================
  const loggedInUser = useSelector((store) => store.user);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // ✨ NEW: Tracks whether the Create Post editor is open or closed
  const [showEditor, setShowEditor] = useState(false);

  // ==========================================
  // 3. FETCH FEED LOGIC
  // ==========================================
  const fetchFeed = async (pageNumber = 1, isRefresh = false) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/post/feed?page=${pageNumber}&limit=10`, {
        withCredentials: true,
      });

      const newPosts = res.data.data;
      if (newPosts.length < 10) setHasMore(false);

      if (isRefresh) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }
    } catch (error) {
      console.error("Failed to fetch feed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed(1, true);
  }, []);

  // ==========================================
  // 4. EVENT HANDLERS
  // ==========================================
  const handlePostCreated = () => {
    setPage(1);
    setHasMore(true);
    fetchFeed(1, true);
    // ✨ NEW: Automatically close the editor after they successfully publish a post!
    setShowEditor(false); 
  };

  const loadMorePosts = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(nextPage, false);
  };

  const handleLike = async (postId) => {
    try {
      const res = await axios.post(`${BASE_URL}/post/like/${postId}`, {}, { withCredentials: true });
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id === postId) {
            const updatedLikes = res.data.isLiked
              ? [...post.likes, loggedInUser._id]
              : post.likes.filter((id) => id !== loggedInUser._id);
            return { ...post, likes: updatedLikes };
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  // ==========================================
  // 5. UI RENDER
  // ==========================================
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      
      {/* ✨ TOP ACTION BAR */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-base-300">
        
        {/* Left Side: The Toggle Button */}
        <button 
          onClick={() => setShowEditor(!showEditor)} 
          className={`btn shadow-lg transition-all duration-300 ${showEditor ? 'btn-ghost text-error' : 'btn-primary hover:scale-105'}`}
        >
          {/* Changes text based on whether it is open or closed */}
          {showEditor ? "✕ Cancel Post" : "✍️ Create Post"}
        </button>

        {/* Right Side: Page Title */}
        <h1 className="text-xl sm:text-2xl font-black text-base-content/50 uppercase tracking-widest">
          Community Feed
        </h1>
      </div>

      {/* ✨ THE CREATE POST EDITOR (Only renders if showEditor is true) */}
      {showEditor && (
        <div className="mb-10 transition-all duration-500 ease-in-out transform origin-top">
          <CreatePost onPostCreated={handlePostCreated} />
        </div>
      )}

      {/* THE POSTS LIST */}
      <div className="space-y-6">
        {posts?.map((post) => {
          const isLikedByMe = post.likes?.includes(loggedInUser?._id);

          return (
            <div key={post._id} className="card bg-base-100 shadow-xl border border-base-300 hover:border-primary/30 transition-colors">
              <div className="card-body p-5 sm:p-7">
                
                {/* POST HEADER */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center">
                    <Link to={`/profile/${post.author?._id}`} className="avatar hover:opacity-80 transition-opacity">
                      <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                        <img src={post.author?.photoUrl || "https://via.placeholder.com/150"} alt="author" />
                      </div>
                    </Link>
                    <div>
                      <Link to={`/profile/${post.author?._id}`} className="font-bold text-lg hover:text-primary transition-colors">
                        {post.author?.firstName} {post.author?.lastName}
                      </Link>
                      <div className="text-xs opacity-60 flex gap-2 items-center">
                        <span>{post.author?.headline || "Developer"}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(post.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`badge badge-sm sm:badge-md font-bold uppercase tracking-wider ${
                    post.type === "launch" ? "badge-success" :
                    post.type === "question" ? "badge-error" :
                    post.type === "article" ? "badge-info" : "badge-primary"
                  }`}>
                    {post.type}
                  </div>
                </div>

                {/* POST BODY */}
                {post.title && <h2 className="text-2xl font-bold mb-2">{post.title}</h2>}
                <p className="whitespace-pre-wrap text-base-content/90 mb-4">{post.content}</p>

                {post.codeSnippet && (
                  <div className="mockup-code bg-neutral text-neutral-content mb-4 before:hidden">
                    <pre data-prefix=">" className="text-warning"><code>{post.codeLanguage}</code></pre> 
                    <pre><code>{post.codeSnippet}</code></pre>
                  </div>
                )}

                {post.images && post.images.length > 0 && (
                  <figure className="mb-4 rounded-xl overflow-hidden border border-base-300 max-h-[400px]">
                    <img src={post.images[0]} alt="Post attachment" className="object-cover w-full" />
                  </figure>
                )}

                {post.type === "launch" && post.projectUrl && (
                  <a href={post.projectUrl} target="_blank" rel="noreferrer" className="btn btn-success btn-outline btn-sm w-fit mb-4">
                    🚀 View Live Project
                  </a>
                )}

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {post.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs font-semibold text-primary opacity-80 hover:opacity-100 cursor-pointer">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* POST FOOTER */}
                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-base-200">
                  <button 
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center gap-2 transition-transform active:scale-90 ${isLikedByMe ? "text-error" : "hover:text-error opacity-70"}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isLikedByMe ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isLikedByMe ? 0 : 2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="font-semibold">{post.likes?.length || 0}</span>
                  </button>

                  <button className="flex items-center gap-2 hover:text-primary opacity-70 transition-colors">
                    <Link to={`/post/${post._id}`} className="flex items-center gap-2 hover:text-primary opacity-70 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03-8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="font-semibold">{post.comments?.length || 0}</span>
                    </Link>
                  </button>
                </div>

              </div>
            </div>
          );
        })}

        {/* LOADING & EMPTY STATES */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        )}

        {!isLoading && hasMore && posts.length > 0 && (
          <div className="flex justify-center pt-4">
            <button onClick={loadMorePosts} className="btn btn-outline btn-primary rounded-full px-8">
              Load More Posts ↓
            </button>
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <p className="text-center opacity-50 font-medium py-8">You've reached the end of the dev-verse! 🌌</p>
        )}

        {!isLoading && posts.length === 0 && (
          <p className="text-center opacity-50 font-medium py-8">No posts yet. Be the first to launch something! 🚀</p>
        )}

      </div>
    </div>
  );
};

export default GlobalFeed;