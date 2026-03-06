import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import CreatePost from "./CreatePost";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      
      {/* TOP ACTION BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 pb-4 border-b border-base-300 gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={() => setShowEditor(!showEditor)} 
            className={`btn shadow-md transition-all duration-300 w-full sm:w-auto ${showEditor ? 'btn-ghost text-error' : 'btn-primary hover:scale-105'}`}
          >
            {showEditor ? "✕ Cancel Post" : "✍️ Create Post"}
          </button>
        </div>
        <div className="join w-full sm:max-w-xs shadow-sm">
          <input 
            type="text" 
            placeholder="Search posts, tags, or bugs..." 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="input input-bordered input-sm sm:input-md join-item w-full focus:outline-primary" 
          />
          <button className="btn btn-sm sm:btn-md btn-ghost join-item bg-base-200 border border-base-300 pointer-events-none">🔍</button>
        </div>
      </div>

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

                  {/* BADGE & DROPDOWN MENU */}
                  <div className="flex flex-col items-end gap-2">
                    <div className={`badge badge-sm sm:badge-md font-bold uppercase tracking-wider ${
                      post.type === "launch" ? "badge-success" : post.type === "question" ? "badge-error" : post.type === "article" ? "badge-info" : "badge-primary"
                    }`}>
                      {post.type}
                    </div>

                    {/* ✨ UPDATED: 3-Dot Menu hooked up to the Edit function */}
                    {loggedInUser?._id === post.author?._id && (
                      <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-xs btn-circle opacity-50 hover:opacity-100">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                        </div>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-xl bg-base-200 rounded-box w-32 border border-base-300">
                          <li>
                            <a onClick={() => openEditModal(post)} className="hover:text-primary font-semibold">
                              ✏️ Edit
                            </a>
                          </li>
                          <li>
                            <a onClick={() => handleDeletePost(post._id)} className="text-error hover:bg-error hover:text-white font-semibold mt-1">
                              🗑️ Delete
                            </a>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

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

                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-base-200">
                  <button onClick={() => handleLike(post._id)} className={`flex items-center gap-2 transition-transform active:scale-90 ${isLikedByMe ? "text-error" : "hover:text-error opacity-70"}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isLikedByMe ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isLikedByMe ? 0 : 2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="font-semibold">{post.likes?.length || 0}</span>
                  </button>

                  <Link to={`/post/${post._id}`} className="flex items-center gap-2 hover:text-primary opacity-70 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03-8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="font-semibold">{post.comments?.length || 0}</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && <div className="flex justify-center py-8"><span className="loading loading-spinner loading-lg text-primary"></span></div>}
        {!isLoading && hasMore && posts.length > 0 && (
          <div className="flex justify-center pt-4">
            <button onClick={loadMorePosts} className="btn btn-outline btn-primary rounded-full px-8">Load More Posts ↓</button>
          </div>
        )}
        {!hasMore && posts.length > 0 && !searchText && <p className="text-center opacity-50 font-medium py-8">You've reached the end of the dev-verse! 🌌</p>}
        {!isLoading && posts.length === 0 && searchText && <p className="text-center opacity-50 font-medium py-8">No results found for "{searchText}". Try searching something else!</p>}
        {!isLoading && posts.length === 0 && !searchText && <p className="text-center opacity-50 font-medium py-8">No posts yet. Be the first to launch something! 🚀</p>}
      </div>

      {/* ==========================================
          ✨ NEW: THE EDIT MODAL
          ========================================== */}
      <dialog id="edit_post_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-base-100 border border-primary/20">
          <h3 className="font-bold text-xl mb-4 text-primary">Edit Post</h3>
          
          <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="Post Title (Optional)" 
              value={editForm.title} 
              onChange={(e) => setEditForm({...editForm, title: e.target.value})} 
              className="input input-bordered w-full font-bold" 
            />
            
            <textarea 
              placeholder="What do you want to share with the dev community?" 
              value={editForm.content} 
              onChange={(e) => setEditForm({...editForm, content: e.target.value})} 
              className="textarea textarea-bordered h-32 w-full text-base leading-relaxed" 
              required
            ></textarea>
            
            {editForm.codeSnippet !== "" && (
              <div className="p-4 bg-base-200 rounded-xl border border-base-300">
                <p className="text-xs font-bold mb-2 opacity-50 uppercase tracking-wider">Code Snippet</p>
                <div className="flex gap-2 mb-2">
                  <select 
                    value={editForm.codeLanguage} 
                    onChange={(e) => setEditForm({...editForm, codeLanguage: e.target.value})} 
                    className="select select-sm select-bordered max-w-xs"
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
                  className="textarea textarea-bordered w-full font-mono text-sm h-32 bg-neutral text-neutral-content" 
                ></textarea>
              </div>
            )}

            <input 
              type="text" 
              placeholder="Tags (comma separated, e.g. React, Node.js)" 
              value={editForm.tags} 
              onChange={(e) => setEditForm({...editForm, tags: e.target.value})} 
              className="input input-bordered input-sm w-full" 
            />

            <div className="modal-action mt-2">
              <button 
                type="button" 
                className="btn" 
                onClick={() => {
                  document.getElementById("edit_post_modal").close();
                  setEditingPost(null);
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isUpdating}>
                {isUpdating ? <span className="loading loading-spinner loading-sm"></span> : "Save Changes"}
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