// ==========================================
// 1. IMPORTS
// ==========================================
import { useState, useEffect } from "react"; // React hooks for state and lifecycle
import { useParams, Link, useNavigate } from "react-router-dom"; // Hooks for routing and URL parameters
import axios from "axios"; // HTTP client
import { BASE_URL } from "../utils/constants"; // Backend URL
import { useSelector } from "react-redux"; // To get the logged-in user

const PostDetails = () => {
  // ==========================================
  // 2. STATE & HOOKS
  // ==========================================
  // Extract the 'postId' directly from the URL (e.g., /post/12345 -> postId = 12345)
  const { postId } = useParams();
  const navigate = useNavigate();
  const loggedInUser = useSelector((store) => store.user);

  // State to hold the fetched post data
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for the new comment input box
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==========================================
  // 3. FETCH DATA LOGIC
  // ==========================================
  useEffect(() => {
    const fetchSinglePost = async () => {
      try {
        // Hit the new backend route we just created
        const res = await axios.get(`${BASE_URL}/post/${postId}`, { withCredentials: true });
        setPost(res.data.data);
      } catch (error) {
        console.error("Failed to fetch post:", error);
        // If the post was deleted or doesn't exist, kick them back to the community feed
        navigate("/community");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSinglePost();
  }, [postId, navigate]);

  // ==========================================
  // 4. ACTION HANDLERS
  // ==========================================
  // Handle submitting a new comment
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return; // Prevent empty comments

    setIsSubmitting(true);
    try {
      // Send the comment to the backend route we built previously
      const res = await axios.post(
        `${BASE_URL}/post/comment/${postId}`,
        { text: newComment },
        { withCredentials: true }
      );

      // Optimistic UI Update: Overwrite the post's comments array with the new one returned by the server
      // This makes the comment appear instantly without needing to refresh the whole page!
      setPost((prev) => ({ ...prev, comments: res.data.comments }));
      
      // Clear the input box
      setNewComment("");
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // StackOverflow Feature: Mark an answer as accepted (Only the post author can do this)
  const handleAcceptAnswer = async (commentId) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/post/comment/accept/${postId}/${commentId}`,
        {},
        { withCredentials: true }
      );

      // Update the local state to instantly show the green checkmark
      setPost((prev) => ({
        ...prev,
        comments: prev.comments.map((c) => 
          c._id === commentId ? { ...c, isAcceptedAnswer: res.data.isAccepted } : c
        )
      }));
    } catch (error) {
      console.error("Failed to accept answer:", error);
    }
  };

  // Helper to format dates
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  // ==========================================
  // 5. RENDER UI
  // ==========================================
  if (isLoading) {
    return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  }

  if (!post) return null;

  // Check if the currently logged-in user is the person who wrote the post
  const isMyPost = loggedInUser?._id === post.author?._id;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      
      {/* 🔙 BACK BUTTON */}
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm mb-6 opacity-70 hover:opacity-100">
        ← Back to Feed
      </button>

      {/* ==========================================
          THE MAIN POST CARD 
          ========================================== */}
      <div className="card bg-base-100 shadow-xl border border-base-300 mb-8">
        <div className="card-body p-6 sm:p-8">
          
          {/* Header (Author & Badge) */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-4 items-center">
              <Link to={`/profile/${post.author?._id}`} className="avatar">
                <div className="w-14 h-14 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src={post.author?.photoUrl || "https://via.placeholder.com/150"} alt="author" />
                </div>
              </Link>
              <div>
                <Link to={`/profile/${post.author?._id}`} className="font-bold text-xl hover:text-primary transition-colors">
                  {post.author?.firstName} {post.author?.lastName}
                </Link>
                <div className="text-sm opacity-60">
                  {post.author?.headline} • {formatTimeAgo(post.createdAt)}
                </div>
              </div>
            </div>
            
            <div className={`badge badge-lg font-bold uppercase tracking-wider ${
              post.type === "launch" ? "badge-success" : post.type === "question" ? "badge-error" : "badge-primary"
            }`}>
              {post.type}
            </div>
          </div>

          {/* Body Content */}
          {post.title && <h1 className="text-3xl font-bold mb-4">{post.title}</h1>}
          <p className="whitespace-pre-wrap text-lg mb-6 leading-relaxed">{post.content}</p>

          {/* Code Snippet */}
          {post.codeSnippet && (
            <div className="mockup-code bg-neutral text-neutral-content mb-6">
              <pre data-prefix=">" className="text-warning"><code>{post.codeLanguage}</code></pre> 
              <pre><code>{post.codeSnippet}</code></pre>
            </div>
          )}

          {/* Image */}
          {post.images?.length > 0 && (
            <figure className="mb-6 rounded-xl overflow-hidden border border-base-300">
              <img src={post.images[0]} alt="Post attachment" className="object-cover w-full" />
            </figure>
          )}

        </div>
      </div>

      {/* ==========================================
          THE COMMENTS SECTION
          ========================================== */}
      <div className="bg-base-200 rounded-2xl p-4 sm:p-8 border border-base-300 shadow-inner">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          Discussions <span className="badge badge-primary">{post.comments?.length || 0}</span>
        </h3>

        {/* INPUT: Add a new comment */}
        <div className="flex gap-4 mb-8">
          <div className="avatar hidden sm:block">
            <div className="w-10 h-10 rounded-full">
              <img src={loggedInUser?.photoUrl} alt="You" />
            </div>
          </div>
          <div className="flex-1 flex gap-2">
            <input 
              type="text" 
              placeholder="Add to the discussion..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()} // Submit on Enter key!
              className="input input-bordered w-full" 
            />
            <button 
              onClick={handleCommentSubmit} 
              disabled={isSubmitting || !newComment.trim()} 
              className="btn btn-primary"
            >
              Reply
            </button>
          </div>
        </div>

        {/* LIST: Loop through existing comments */}
        <div className="space-y-6">
          {post.comments?.length === 0 ? (
            <p className="text-center opacity-50 italic py-4">No comments yet. Be the first to share your thoughts!</p>
          ) : (
            // Reverse the array so the newest comments appear at the bottom (like standard chat/threads)
            post.comments?.slice().reverse().map((comment) => (
              
              <div key={comment._id} className={`flex gap-4 p-4 rounded-xl transition-colors ${comment.isAcceptedAnswer ? 'bg-success/10 border border-success/30' : 'bg-base-100 border border-base-300'}`}>
                
                {/* Commenter Avatar */}
                <Link to={`/profile/${comment.user?._id}`} className="avatar flex-shrink-0">
                  <div className="w-10 h-10 rounded-full">
                    <img src={comment.user?.photoUrl || "https://via.placeholder.com/150"} alt="commenter" />
                  </div>
                </Link>

                <div className="flex-1">
                  {/* Commenter Name & Time */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Link to={`/profile/${comment.user?._id}`} className="font-bold hover:text-primary">
                        {comment.user?.firstName} {comment.user?.lastName}
                      </Link>
                      <span className="text-xs opacity-50">{formatTimeAgo(comment.createdAt)}</span>
                    </div>

                    {/* 🔥 STACKOVERFLOW FEATURE: "Accepted Answer" Badge */}
                    {comment.isAcceptedAnswer && (
                      <span className="badge badge-success badge-sm gap-1 font-bold">
                        ✓ Answer
                      </span>
                    )}
                  </div>
                  
                  {/* The actual comment text */}
                  <p className="text-base-content/90 text-sm leading-relaxed">{comment.text}</p>

                  {/* 🔥 STACKOVERFLOW FEATURE: "Mark as Answer" Button */}
                  {/* Only show this button IF: 
                      1. The post is a "question"
                      2. The person viewing the post is the original author
                      3. This comment wasn't written by the author themselves! */}
                  {post.type === "question" && isMyPost && comment.user?._id !== loggedInUser?._id && (
                    <button 
                      onClick={() => handleAcceptAnswer(comment._id)}
                      className={`text-xs mt-3 font-semibold transition-colors ${comment.isAcceptedAnswer ? 'text-success hover:text-error' : 'opacity-50 hover:text-success'}`}
                    >
                      {comment.isAcceptedAnswer ? "Remove Answer Status" : "✓ Mark as Accepted Answer"}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
      </div>
    </div>
  );
};

export default PostDetails;