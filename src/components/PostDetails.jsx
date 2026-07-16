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
    <div className="container mx-auto px-4 py-8 max-w-3xl relative z-10">
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm mb-6 opacity-70 hover:opacity-100 rounded-xl font-bold tracking-wide">
        ← Back to Feed
      </button>

      {/* POST CARD HEADER & BODY */}
      <div className="rounded-3xl bg-base-200/40 backdrop-blur-xl border border-base-content/10 shadow-2xl overflow-hidden mb-8 hover:border-primary/20 transition-all duration-300">
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-4 items-center">
              <Link to={`/profile/${post.author?._id}`} className="avatar hover:opacity-90 transition-opacity">
                <div className="w-12 h-12 rounded-full ring-2 ring-primary/40 ring-offset-2 ring-offset-base-100">
                  <img src={post.author?.photoUrl || "https://www.w3schools.com/howto/img_avatar.png"} alt="author" className="object-cover" />
                </div>
              </Link>
              <div>
                <Link to={`/profile/${post.author?._id}`} className="font-extrabold text-lg hover:text-primary transition-colors text-base-content flex items-center gap-1 leading-tight">
                  {post.author?.firstName} {post.author?.lastName}
                </Link>
                <div className="text-[10px] font-semibold opacity-50 uppercase tracking-wider mt-1">{post.author?.headline || "Developer"} • {formatTimeAgo(post.createdAt)}</div>
              </div>
            </div>
            <span className={`badge badge-sm font-extrabold uppercase tracking-widest px-2.5 py-1.5 rounded-lg border ${
              post.type === "launch" 
                ? "bg-success/10 border-success/20 text-success" 
                : post.type === "question" 
                  ? "bg-error/10 border-error/20 text-error" 
                  : "bg-primary/10 border-primary/20 text-primary"
            }`}>
              {post.type}
            </span>
          </div>

          {post.title && <h1 className="text-2xl font-black tracking-tight mb-3 text-base-content leading-tight">{post.title}</h1>}
          <p className="whitespace-pre-wrap text-sm text-base-content/95 mb-6 leading-relaxed font-medium">{post.content}</p>
          
          {post.codeSnippet && (
            <div className="rounded-2xl overflow-hidden border border-base-content/10 mb-6 bg-neutral shadow-inner">
              <div className="bg-neutral-focus/60 px-4 py-2 border-b border-neutral-focus flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-content/65">{post.codeLanguage}</span>
              </div>
              <pre className="p-4 font-mono text-xs text-warning overflow-x-auto leading-relaxed"><code>{post.codeSnippet}</code></pre>
            </div>
          )}
          
          {post.images?.length > 0 && (
            <figure className="mb-6 rounded-2xl overflow-hidden border border-base-content/10 max-h-[400px]">
              <img src={post.images[0]} alt="Post attachment" className="object-cover w-full" />
            </figure>
          )}
        </div>
      </div>

      {/* COMMENTS SECTION */}
      <div className="rounded-3xl bg-base-200/50 backdrop-blur-xl border border-base-content/10 shadow-2xl p-6 sm:p-8">
        <h3 className="text-lg font-black text-base-content mb-6 flex items-center gap-2">
          Discussions 
          <span className="bg-primary/15 border border-primary/20 text-primary font-bold px-2 py-0.5 rounded-lg text-xs">
            {post.comments?.length || 0}
          </span>
        </h3>

        {/* MAIN COMMENT INPUT */}
        <div className="flex gap-4 mb-8">
          <div className="avatar hidden sm:block shrink-0">
            <div className="w-10 h-10 rounded-full ring-2 ring-primary/20">
              <img src={loggedInUser?.photoUrl} alt="You" className="object-cover rounded-full" />
            </div>
          </div>
          <div className="flex-1 flex gap-2">
            <input 
              type="text" 
              placeholder="Add to the discussion..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()} 
              className="input input-bordered w-full text-sm bg-base-100/50 border-base-content/10 focus:border-primary focus:outline-none transition-all rounded-xl h-11" 
            />
            <button 
              onClick={handleCommentSubmit} 
              disabled={isSubmitting || !newComment.trim()} 
              className="btn btn-primary rounded-xl font-bold px-5 text-sm h-11 min-h-[44px] shadow-md shadow-primary/10"
            >
              Post
            </button>
          </div>
        </div>

        {/* COMMENT LIST */}
        <div className="space-y-5">
          {post.comments?.length === 0 ? (
            <p className="text-center opacity-40 font-semibold text-xs uppercase tracking-wider py-8">Be the first to share your thoughts! ✍️</p>
          ) : (
            post.comments?.slice().reverse().map((comment) => (
              
              <div 
                key={comment._id} 
                className={`p-4 rounded-2xl border transition-all duration-300 ${
                  comment.isAcceptedAnswer 
                    ? 'bg-success/5 border-success/30 shadow-md' 
                    : 'bg-base-100/40 border-base-content/10 shadow-sm'
                }`}
              >
                <div className="flex gap-4">
                  <Link to={`/profile/${comment.user?._id}`} className="avatar shrink-0">
                    <div className="w-9 h-9 rounded-full ring-1 ring-base-content/10">
                      <img src={comment.user?.photoUrl || "https://www.w3schools.com/howto/img_avatar.png"} alt="commenter" className="object-cover rounded-full" />
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Link to={`/profile/${comment.user?._id}`} className="font-extrabold text-xs hover:text-primary transition-colors text-base-content leading-tight">
                          {comment.user?.firstName} {comment.user?.lastName}
                        </Link>
                        <span className="text-[9px] font-semibold opacity-40 uppercase tracking-wider">{formatTimeAgo(comment.createdAt)}</span>
                      </div>
                      {comment.isAcceptedAnswer && (
                        <span className="badge badge-success bg-success/15 border-success/30 text-success text-[9px] font-bold py-1 px-2 rounded-lg uppercase tracking-wide">
                          ✓ Answer
                        </span>
                      )}
                    </div>
                    
                    <p className="text-base-content/85 text-xs leading-relaxed font-semibold mt-1">{comment.text}</p>

                    {/* ACTION BUTTONS */}
                    <div className="flex items-center gap-4 mt-3">
                      <button 
                        onClick={() => setActiveReplyId(activeReplyId === comment._id ? null : comment._id)}
                        className="text-[10px] font-bold uppercase tracking-wider opacity-50 hover:opacity-100 hover:text-primary transition-all flex items-center gap-1"
                      >
                        ↩ Reply
                      </button>

                      {post.type === "question" && isMyPost && comment.user?._id !== loggedInUser?._id && (
                        <button 
                          onClick={() => handleAcceptAnswer(comment._id)}
                          className={`text-[10px] font-bold uppercase tracking-wider transition-all ${
                            comment.isAcceptedAnswer 
                              ? 'text-error hover:text-error/80' 
                              : 'opacity-50 hover:text-success'
                          }`}
                        >
                          {comment.isAcceptedAnswer ? "Remove Answer Status" : "✓ Mark as Accepted"}
                        </button>
                      )}
                    </div>

                    {/* REPLY INPUT BOX */}
                    {activeReplyId === comment._id && (
                      <div className="flex gap-2 mt-4 ml-2">
                        <input 
                          type="text" 
                          autoFocus
                          placeholder={`Replying to ${comment.user?.firstName}...`} 
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit(comment._id)} 
                          className="input input-bordered input-sm w-full bg-base-100/50 border-base-content/10 focus:border-primary focus:outline-none transition-all rounded-xl text-xs h-9" 
                        />
                        <button onClick={() => handleReplySubmit(comment._id)} className="btn btn-primary btn-sm rounded-xl font-bold h-9 min-h-[36px] text-xs px-4">Reply</button>
                      </div>
                    )}

                    {/* NESTED REPLIES LIST */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 space-y-3 pl-4 border-l-2 border-base-content/10">
                        {comment.replies.map((reply) => (
                          <div key={reply._id} className="flex gap-3">
                            <Link to={`/profile/${reply.user?._id}`} className="avatar shrink-0">
                              <div className="w-6 h-6 rounded-full">
                                <img src={reply.user?.photoUrl || "https://www.w3schools.com/howto/img_avatar.png"} alt="replier" className="object-cover rounded-full" />
                              </div>
                            </Link>
                            <div className="bg-base-200/50 border border-base-content/5 p-2.5 px-3.5 rounded-2xl w-full">
                              <div className="flex items-center gap-2 mb-1">
                                <Link to={`/profile/${reply.user?._id}`} className="text-xs font-bold hover:text-primary transition-colors text-base-content">
                                  {reply.user?.firstName} {reply.user?.lastName}
                                </Link>
                                <span className="text-[8px] font-semibold opacity-40 uppercase tracking-wider">{formatTimeAgo(reply.createdAt)}</span>
                              </div>
                              <p className="text-xs text-base-content/80 font-medium leading-relaxed">{reply.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
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