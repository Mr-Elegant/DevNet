import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import CreatePost from "./CreatePost";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import VerifiedBadge from "./VerifiedBadge";
import { motion } from "framer-motion";

const GlobalFeed = () => {
  const loggedInUser = useSelector((store) => store.user);
  
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [searchText, setSearchText] = useState("");

  // ==========================================
  // ✨ NEW: EDIT POST STATES
  // ==========================================
  const [editingPost, setEditingPost] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    codeSnippet: "",
    codeLanguage: "javascript",
    tags: ""
  });

  // ==========================================
  // FETCH FEED LOGIC
  // ==========================================
  const fetchFeed = async (pageNumber = 1, isRefresh = false, query = "") => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/post/feed?page=${pageNumber}&limit=10&q=${query}`, {
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
    const delayDebounceFn = setTimeout(() => {
      setPage(1); 
      setHasMore(true); 
      fetchFeed(1, true, searchText); 
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText]); 

  // ==========================================
  // POST ACTIONS (Create, Like, Delete)
  // ==========================================
  const handlePostCreated = () => {
    setPage(1);
    setHasMore(true);
    fetchFeed(1, true, searchText);
    setShowEditor(false); 
  };

  const loadMorePosts = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(nextPage, false, searchText); 
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

  const handleDeletePost = async (postId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this post? This cannot be undone.");
    if (!isConfirmed) return;

    try {
      await axios.delete(`${BASE_URL}/post/${postId}`, { withCredentials: true });
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert("Failed to delete the post.");
    }
  };

  // ==========================================
  // ✨ NEW: EDIT POST HANDLERS
  // ==========================================
  const openEditModal = (post) => {
    setEditingPost(post);
    setEditForm({
      title: post.title || "",
      content: post.content || "",
      codeSnippet: post.codeSnippet || "",
      codeLanguage: post.codeLanguage || "javascript",
      // Convert the tags array back into a comma-separated string for the input box
      tags: post.tags ? post.tags.join(", ") : ""
    });
    document.getElementById("edit_post_modal").showModal();
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // Convert the comma-separated string back into a clean array
      const tagsArray = editForm.tags.split(",").map(tag => tag.trim()).filter(tag => tag !== "");

      const res = await axios.patch(
        `${BASE_URL}/post/${editingPost._id}`,
        {
          ...editForm,
          tags: tagsArray
        },
        { withCredentials: true }
      );

      // Optimistic UI Update: Swap the old post with the newly edited one returned from the server!
      setPosts((prevPosts) => prevPosts.map((p) => (p._id === editingPost._id ? res.data.data : p)));
      
      document.getElementById("edit_post_modal").close();
      setEditingPost(null);
    } catch (error) {
      console.error("Failed to update post:", error);
      alert("Failed to update post.");
    } finally {
      setIsUpdating(false);
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
      
      {/* TOP ACTION BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-5 border-b border-base-content/10 gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto shrink-0">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowEditor(!showEditor)} 
            className={`btn rounded-xl shadow-md transition-all duration-300 w-full sm:w-auto h-11 min-h-[44px] font-bold tracking-wide ${
              showEditor 
                ? 'btn-outline border-error/20 hover:border-error hover:bg-error/5 text-error' 
                : 'btn-primary shadow-lg shadow-primary/10 text-primary-content'
            }`}
          >
            {showEditor ? "✕ Close Post Editor" : "✍️ Write a Post"}
          </motion.button>
        </div>

        <div className="join w-full sm:max-w-xs shadow-md rounded-xl border border-base-content/10 overflow-hidden bg-base-100/50 backdrop-blur-md">
          <input 
            type="text" 
            placeholder="Search posts, tags, bugs..." 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="input input-ghost join-item w-full focus:outline-none focus:bg-base-100 text-sm h-11" 
          />
          <button type="button" className="btn btn-ghost join-item border-l border-base-content/10 bg-base-200/50 pointer-events-none text-base-content/50 w-12 h-11 min-h-[44px]">🔍</button>
        </div>
      </div>

      {showEditor && (
        <div className="mb-8">
          <CreatePost onPostCreated={handlePostCreated} />
        </div>
      )}

      {/* THE POSTS LIST */}
      <div className="space-y-6">
        {posts?.map((post) => {
          const isLikedByMe = post.likes?.includes(loggedInUser?._id);

          return (
            <div 
              key={post._id} 
              className="rounded-3xl bg-base-200/40 backdrop-blur-xl border border-base-content/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-primary/20"
            >
              <div className="p-6 sm:p-7">
                
                <div className="flex justify-between items-start mb-5">
                  <div className="flex gap-3.5 items-center">
                    <Link to={`/profile/${post.author?._id}`} className="avatar hover:opacity-90 transition-opacity">
                      <div className="w-11 h-11 rounded-full ring-2 ring-primary/30 ring-offset-2 ring-offset-base-100">
                        <img src={post.author?.photoUrl || "https://www.w3schools.com/howto/img_avatar.png"} alt="author" className="object-cover" />
                      </div>
                    </Link>
                    <div>
                      <Link to={`/profile/${post.author?._id}`} className="font-extrabold text-base hover:text-primary transition-colors flex items-center gap-1 leading-tight text-base-content">
                        {post.author?.firstName} {post.author?.lastName}
                        <VerifiedBadge isPremium={post.author?.isPremium} membershipType={post.author?.membershipType} />
                      </Link>
                      <div className="text-[10px] font-semibold opacity-50 flex gap-2 items-center mt-1 uppercase tracking-wider">
                        <span>{post.author?.headline || "Developer"}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(post.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* BADGE & DROPDOWN MENU */}
                  <div className="flex flex-col items-end gap-2.5">
                    <span className={`badge badge-sm font-extrabold uppercase tracking-widest px-2.5 py-1.5 rounded-lg border ${
                      post.type === "launch" 
                        ? "bg-success/10 border-success/20 text-success" 
                        : post.type === "question" 
                          ? "bg-error/10 border-error/20 text-error" 
                          : post.type === "article" 
                            ? "bg-info/10 border-info/20 text-info" 
                            : "bg-primary/10 border-primary/20 text-primary"
                    }`}>
                      {post.type}
                    </span>

                    {loggedInUser?._id === post.author?._id && (
                      <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-xs btn-circle opacity-50 hover:opacity-100">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                        </div>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-1.5 shadow-2xl bg-base-100/90 backdrop-blur-xl rounded-xl w-32 border border-base-content/10 animate-fade-in space-y-0.5">
                          <li>
                            <a onClick={() => openEditModal(post)} className="hover:bg-primary/10 hover:text-primary rounded-lg py-2 font-semibold text-xs text-base-content/85">
                              ✏️ Edit Post
                            </a>
                          </li>
                          <li>
                            <a onClick={() => handleDeletePost(post._id)} className="text-error hover:bg-error/10 rounded-lg py-2 font-semibold text-xs mt-0.5">
                              🗑️ Delete
                            </a>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {post.title && <h2 className="text-lg font-black tracking-tight mb-2 text-base-content leading-snug">{post.title}</h2>}
                <p className="whitespace-pre-wrap text-sm text-base-content/85 mb-4 leading-relaxed font-medium">{post.content}</p>

                {post.codeSnippet && (
                  <div className="rounded-2xl overflow-hidden border border-base-content/10 mb-4 bg-neutral shadow-inner">
                    <div className="bg-neutral-focus/60 px-4 py-2 border-b border-neutral-focus flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-content/65">{post.codeLanguage}</span>
                    </div>
                    <pre className="p-4 font-mono text-xs text-warning overflow-x-auto leading-relaxed"><code>{post.codeSnippet}</code></pre>
                  </div>
                )}

                {post.images && post.images.length > 0 && (
                  <figure className="mb-4 rounded-2xl overflow-hidden border border-base-content/10 max-h-[400px] shadow-sm">
                    <img src={post.images[0]} alt="Post attachment" className="object-cover w-full" />
                  </figure>
                )}

                {post.type === "launch" && post.projectUrl && (
                  <a href={post.projectUrl} target="_blank" rel="noreferrer" className="btn btn-success btn-outline btn-sm rounded-xl font-bold tracking-wide w-fit mb-4">
                    🚀 View Live App
                  </a>
                )}

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {post.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs font-bold text-primary opacity-80 hover:opacity-100 cursor-pointer">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-6 mt-5 pt-4 border-t border-base-content/5">
                  <button onClick={() => handleLike(post._id)} className={`flex items-center gap-2 transition-transform active:scale-95 text-xs font-semibold ${isLikedByMe ? "text-error" : "hover:text-error opacity-60 hover:opacity-100"}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isLikedByMe ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isLikedByMe ? 0 : 2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{post.likes?.length || 0} Likes</span>
                  </button>

                  <Link to={`/post/${post._id}`} className="flex items-center gap-2 hover:text-primary opacity-60 hover:opacity-100 transition-all text-xs font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03-8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{post.comments?.length || 0} Comments</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && <div className="flex justify-center py-8"><span className="loading loading-spinner loading-lg text-primary"></span></div>}
        {!isLoading && hasMore && posts.length > 0 && (
          <div className="flex justify-center pt-4">
            <button onClick={loadMorePosts} className="btn btn-outline btn-primary rounded-xl px-8 font-bold tracking-wide h-11 min-h-[44px]">Load More Posts ↓</button>
          </div>
        )}
        {!hasMore && posts.length > 0 && !searchText && <p className="text-center opacity-40 font-bold text-xs tracking-wider uppercase py-8">End of the dev-verse! 🌌</p>}
        {!isLoading && posts.length === 0 && searchText && <p className="text-center opacity-45 font-semibold text-sm py-8">No results found for "{searchText}". Try a different keyword!</p>}
        {!isLoading && posts.length === 0 && !searchText && <p className="text-center opacity-45 font-semibold text-sm py-8">No posts yet. Be the first to share something! 🚀</p>}
      </div>

      {/* ==========================================
          ✨ EDIT MODAL
          ========================================== */}
      <dialog id="edit_post_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-base-100/90 backdrop-blur-xl border border-base-content/10 shadow-2xl rounded-3xl p-6 sm:p-8 max-w-lg">
          <h3 className="font-black text-xl mb-4 text-primary bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Edit Post</h3>
          
          <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="Post Title (Optional)" 
              value={editForm.title} 
              onChange={(e) => setEditForm({...editForm, title: e.target.value})} 
              className="input input-bordered w-full font-bold text-sm bg-base-100/50 border-base-content/10 focus:border-primary focus:outline-none transition-all rounded-xl" 
            />
            
            <textarea 
              placeholder="What do you want to share with the dev community?" 
              value={editForm.content} 
              onChange={(e) => setEditForm({...editForm, content: e.target.value})} 
              className="textarea textarea-bordered h-36 w-full text-sm bg-base-100/50 border-base-content/10 focus:border-primary focus:outline-none transition-all rounded-xl leading-relaxed" 
              required
            ></textarea>
            
            {editForm.codeSnippet !== "" && (
              <div className="p-4 bg-neutral text-neutral-content rounded-2xl border border-neutral-focus space-y-3">
                <p className="text-[10px] font-black uppercase tracking-wider opacity-60">Code Snippet</p>
                <div className="flex gap-2">
                  <select 
                    value={editForm.codeLanguage} 
                    onChange={(e) => setEditForm({...editForm, codeLanguage: e.target.value})} 
                    className="select select-bordered select-xs bg-neutral-focus text-neutral-content border-neutral-content/10 rounded-lg text-[10px]"
                  >
                    <option value="javascript">JavaScript / JSX</option>
                    <option value="python">Python</option>
                    <option value="html">HTML / CSS</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="json">JSON</option>
                    <option value="bash">Terminal / Bash</option>
                  </select>
                </div>
                <textarea 
                  value={editForm.codeSnippet} 
                  onChange={(e) => setEditForm({...editForm, codeSnippet: e.target.value})} 
                  className="textarea textarea-bordered w-full font-mono text-xs h-32 bg-neutral-focus text-neutral-content focus:outline-none focus:bg-neutral-focus/80" 
                ></textarea>
              </div>
            )}

            <input 
              type="text" 
              placeholder="Tags (comma-separated, e.g. react, api)" 
              value={editForm.tags} 
              onChange={(e) => setEditForm({...editForm, tags: e.target.value})} 
              className="input input-bordered input-sm w-full bg-base-100/50 border-base-content/10 focus:border-primary focus:outline-none transition-all rounded-xl text-xs h-9" 
            />

            <div className="modal-action mt-2">
              <button 
                type="button" 
                className="btn btn-outline border-base-content/10 rounded-xl font-bold text-xs h-9 min-h-[36px]" 
                onClick={() => {
                  document.getElementById("edit_post_modal").close();
                  setEditingPost(null);
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary rounded-xl font-bold text-xs h-9 min-h-[36px] text-primary-content shadow-lg shadow-primary/10" disabled={isUpdating}>
                {isUpdating ? <span className="loading loading-spinner loading-xs"></span> : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
        
        {/* Click outside to close */}
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setEditingPost(null)}>close</button>
        </form>
      </dialog>

    </div>
  );
};

export default GlobalFeed;