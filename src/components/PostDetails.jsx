import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useSelector } from "react-redux";
import { useSocket } from "../utils/SocketContext"; 

const PostDetails = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const loggedInUser = useSelector((store) => store.user);
  const socket = useSocket(); 

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // States for main comments
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✨ NEW: States for replies
  const [activeReplyId, setActiveReplyId] = useState(null); // Tracks which comment is being replied to
  const [replyText, setReplyText] = useState(""); // Holds the text for the reply box

  useEffect(() => {
    const fetchSinglePost = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/post/${postId}`, { withCredentials: true });
        setPost(res.data.data);
      } catch (error) {
        console.error("Failed to fetch post:", error);
        navigate("/community");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSinglePost();
  }, [postId, navigate]);

  // ==========================================
  // REAL-TIME SOCKET LOGIC
  // ==========================================
  useEffect(() => {
    if (!socket || !postId) return;
    socket.emit("joinPost", { postId });
    return () => socket.emit("leavePost", { postId });
  }, [socket, postId]);

  useEffect(() => {
    if (!socket) return;

    const handleCommentReceived = (incomingComment) => {
      setPost((prev) => ({ ...prev, comments: [...prev.comments, incomingComment] }));
    };

    const handleAnswerUpdate = ({ commentId, isAccepted }) => {
      setPost((prev) => ({
        ...prev,
        comments: prev.comments.map((c) => c._id === commentId ? { ...c, isAcceptedAnswer: isAccepted } : c),
      }));
    };

    // ✨ NEW: Handle incoming replies from other users in real-time
    const handleReplyReceived = ({ commentId, reply }) => {
      setPost((prev) => ({
        ...prev,
        comments: prev.comments.map((c) => 
          c._id === commentId ? { ...c, replies: [...(c.replies || []), reply] } : c
        ),
      }));
    };

    socket.on("commentReceived", handleCommentReceived);
    socket.on("answerAcceptedUpdate", handleAnswerUpdate);
    socket.on("replyReceived", handleReplyReceived);

    return () => {
      socket.off("commentReceived", handleCommentReceived);
      socket.off("answerAcceptedUpdate", handleAnswerUpdate);
      socket.off("replyReceived", handleReplyReceived);
    };
  }, [socket]);

  // ==========================================
  // ACTION HANDLERS
  // ==========================================
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${BASE_URL}/post/comment/${postId}`, { text: newComment }, { withCredentials: true });
      const updatedCommentsArray = res.data.comments;
      setPost((prev) => ({ ...prev, comments: updatedCommentsArray }));
      setNewComment("");
      if (socket) {
        const newlyAddedComment = updatedCommentsArray[updatedCommentsArray.length - 1];
        socket.emit("newComment", { postId, comment: newlyAddedComment });
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptAnswer = async (commentId) => {
    try {
      const res = await axios.patch(`${BASE_URL}/post/comment/accept/${postId}/${commentId}`, {}, { withCredentials: true });
      setPost((prev) => ({
        ...prev,
        comments: prev.comments.map((c) => c._id === commentId ? { ...c, isAcceptedAnswer: res.data.isAccepted } : c)
      }));
      if (socket) socket.emit("acceptAnswer", { postId, commentId, isAccepted: res.data.isAccepted });
    } catch (error) {
      console.error("Failed to accept answer:", error);
    }
  };

  // ✨ NEW: Submit a reply to a specific comment
  const handleReplySubmit = async (commentId) => {
    if (!replyText.trim()) return;
    try {
      const res = await axios.post(
        `${BASE_URL}/post/comment/reply/${postId}/${commentId}`,
        { text: replyText },
        { withCredentials: true }
      );
      
      const updatedComment = res.data.comment;
      
      // Update local UI
      setPost((prev) => ({
        ...prev,
        comments: prev.comments.map((c) => c._id === commentId ? updatedComment : c)
      }));
      
      // Clear input and close the reply box
      setReplyText("");
      setActiveReplyId(null);

      // Broadcast to socket room
      if (socket) {
        const newlyAddedReply = updatedComment.replies[updatedComment.replies.length - 1];
        socket.emit("newReply", { postId, commentId, reply: newlyAddedReply });
      }
    } catch (error) {
      console.error("Failed to post reply:", error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (isLoading) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  if (!post) return null;

  const isMyPost = loggedInUser?._id === post.author?._id;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm mb-6 opacity-70 hover:opacity-100">
        ← Back to Feed
      </button>

      {/* POST CARD HEADER & BODY (Unchanged) */}
      <div className="card bg-base-100 shadow-xl border border-base-300 mb-8">
        <div className="card-body p-6 sm:p-8">
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
                <div className="text-sm opacity-60">{post.author?.headline} • {formatTimeAgo(post.createdAt)}</div>
              </div>
            </div>
            <div className={`badge badge-lg font-bold uppercase tracking-wider ${post.type === "launch" ? "badge-success" : post.type === "question" ? "badge-error" : "badge-primary"}`}>
              {post.type}
            </div>
          </div>
          {post.title && <h1 className="text-3xl font-bold mb-4">{post.title}</h1>}
          <p className="whitespace-pre-wrap text-lg mb-6 leading-relaxed">{post.content}</p>
          {post.codeSnippet && (
            <div className="mockup-code bg-neutral text-neutral-content mb-6">
              <pre data-prefix=">" className="text-warning"><code>{post.codeLanguage}</code></pre> 
              <pre><code>{post.codeSnippet}</code></pre>
            </div>
          )}
          {post.images?.length > 0 && (
            <figure className="mb-6 rounded-xl overflow-hidden border border-base-300">
              <img src={post.images[0]} alt="Post attachment" className="object-cover w-full" />
            </figure>
          )}
        </div>
      </div>

      {/* COMMENTS SECTION */}
      <div className="bg-base-200 rounded-2xl p-4 sm:p-8 border border-base-300 shadow-inner">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          Discussions <span className="badge badge-primary">{post.comments?.length || 0}</span>
        </h3>

        {/* MAIN COMMENT INPUT */}
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
              onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()} 
              className="input input-bordered w-full" 
            />
            <button onClick={handleCommentSubmit} disabled={isSubmitting || !newComment.trim()} className="btn btn-primary">
              Post
            </button>
          </div>
        </div>

        {/* COMMENT LIST */}
        <div className="space-y-6">
          {post.comments?.length === 0 ? (
            <p className="text-center opacity-50 italic py-4">No comments yet. Be the first to share your thoughts!</p>
          ) : (
            post.comments?.slice().reverse().map((comment) => (
              
              <div key={comment._id} className={`flex gap-4 p-4 rounded-xl transition-colors ${comment.isAcceptedAnswer ? 'bg-success/10 border border-success/30' : 'bg-base-100 border border-base-300'}`}>
                
                <Link to={`/profile/${comment.user?._id}`} className="avatar flex-shrink-0">
                  <div className="w-10 h-10 rounded-full"><img src={comment.user?.photoUrl || "https://via.placeholder.com/150"} alt="commenter" /></div>
                </Link>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Link to={`/profile/${comment.user?._id}`} className="font-bold hover:text-primary">
                        {comment.user?.firstName} {comment.user?.lastName}
                      </Link>
                      <span className="text-xs opacity-50">{formatTimeAgo(comment.createdAt)}</span>
                    </div>
                    {comment.isAcceptedAnswer && <span className="badge badge-success badge-sm gap-1 font-bold">✓ Answer</span>}
                  </div>
                  
                  <p className="text-base-content/90 text-sm leading-relaxed">{comment.text}</p>

                  {/* ACTION BUTTONS (Accept Answer & Reply) */}
                  <div className="flex items-center gap-4 mt-2">
                    <button 
                      onClick={() => setActiveReplyId(activeReplyId === comment._id ? null : comment._id)}
                      className="text-xs font-semibold opacity-60 hover:opacity-100 hover:text-primary transition-colors"
                    >
                      ↩ Reply
                    </button>

                    {post.type === "question" && isMyPost && comment.user?._id !== loggedInUser?._id && (
                      <button 
                        onClick={() => handleAcceptAnswer(comment._id)}
                        className={`text-xs font-semibold transition-colors ${comment.isAcceptedAnswer ? 'text-success hover:text-error' : 'opacity-50 hover:text-success'}`}
                      >
                        {comment.isAcceptedAnswer ? "Remove Answer Status" : "✓ Mark as Accepted"}
                      </button>
                    )}
                  </div>

                  {/* ✨ NEW: REPLY INPUT BOX (Only shows if this comment's Reply button was clicked) */}
                  {activeReplyId === comment._id && (
                    <div className="flex gap-2 mt-4 ml-4">
                      <input 
                        type="text" 
                        autoFocus
                        placeholder={`Replying to ${comment.user?.firstName}...`} 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit(comment._id)} 
                        className="input input-bordered input-sm w-full" 
                      />
                      <button onClick={() => handleReplySubmit(comment._id)} className="btn btn-primary btn-sm">Reply</button>
                    </div>
                  )}

                  {/* ✨ NEW: NESTED REPLIES LIST */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 space-y-3 pl-4 border-l-2 border-base-300">
                      {comment.replies.map((reply) => (
                        <div key={reply._id} className="flex gap-3">
                          <Link to={`/profile/${reply.user?._id}`} className="avatar flex-shrink-0">
                            <div className="w-6 h-6 rounded-full"><img src={reply.user?.photoUrl || "https://via.placeholder.com/150"} alt="replier" /></div>
                          </Link>
                          <div className="bg-base-200 p-2 px-3 rounded-lg w-full">
                            <div className="flex items-center gap-2 mb-1">
                              <Link to={`/profile/${reply.user?._id}`} className="text-xs font-bold hover:text-primary">
                                {reply.user?.firstName} {reply.user?.lastName}
                              </Link>
                              <span className="text-[10px] opacity-50">{formatTimeAgo(reply.createdAt)}</span>
                            </div>
                            <p className="text-sm opacity-90">{reply.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
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