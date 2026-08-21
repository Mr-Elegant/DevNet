// ==========================================
// 1. IMPORTS
// ==========================================
import axios from "axios"; // HTTP client to talk to your backend
import { BASE_URL } from "../utils/constants"; // Your backend server URL
import { useDispatch, useSelector } from "react-redux"; // Redux hooks for global state management
import { useEffect, useState } from "react"; // React hooks for component lifecycle and local memory
import { useNavigate } from "react-router-dom"; // Navigation hook
import { addFeed, removeUserFromFeed } from "../store/feedSlice"; // Redux actions to update the feed list
import UserCard from "../components/UserCard"; // Your custom UI component to display user info
import SwipeableCard from "../components/SwipeableCard"; // Custom Framer Motion swiper
import { useSocket } from "../context/SocketContext"; // Your global socket connection for real-time notifications
import { motion } from "framer-motion"; // Animation library

const Feed = () => {
  const navigate = useNavigate();
  // ==========================================
  // 2. GLOBAL STATE & HOOKS
  // ==========================================
  // Grab the current array of developers to swipe on from Redux
  const feed = useSelector((store) => store.feed);
  // Grab the currently logged-in user (needed to send notifications)
  const loggedInUser = useSelector((store) => store.user);
  // dispatch is used to send actions to Redux (like removing a user)
  const dispatch = useDispatch();
  // Get the active websocket connection
  const socket = useSocket();

  // ==========================================
  // 3. LOCAL STATE (UI Trackers)
  // ==========================================
  // Tracks if the user is dragging 'left' or 'right' to show the NOPE/LIKE stamps
  const [dragDirection, setDragDirection] = useState(null);
  // Tracks WHICH specific card is being dragged so stamps don't show on all cards
  const [activeCardId, setActiveCardId] = useState(null);
  // Tracks button-triggered swipe targets for smooth programmatic animation
  const [swipeTarget, setSwipeTarget] = useState({ userId: null, dir: null });
  // NEW: Prevents spam-clicking the action buttons
  const [isProcessing, setIsProcessing] = useState(false);

  // ==========================================
  // 4. FETCH DATA FUNCTION
  // ==========================================
  const getFeed = async () => {
    // If we already have feed data, stop! This prevents re-fetching if you leave and come back to the page.
    if (feed) return; 
    try {
      // Fetch fresh feed data from the backend
      const res = await axios.get(BASE_URL + "/feed", { withCredentials: true });
      // Save it into the global Redux store
      dispatch(addFeed(res?.data?.data));
    } catch (error) {
      console.log(error);
    }
  };

  // Run 'getFeed' exactly once when the component first loads
  useEffect(() => {
    getFeed();
  }, []);

  // ==========================================
  // 5. CORE ACTION LOGIC (API & Sockets)
  // ==========================================
  // This function handles both physical swipes AND button clicks
  const processAction = async (direction, targetUserId) => {
    let status = "";
    // Translate direction into database language
    if (direction === "left") status = "ignored";
    if (direction === "right") status = "interested";

    // Cancel if it wasn't a valid direction
    if (!status) return;

    try {
      // Send the request to your backend to save the match/ignore
      await axios.post(
        `${BASE_URL}/request/send/${status}/${targetUserId}`,
        {},
        { withCredentials: true }
      );

      // If they liked the person, fire a real-time notification via Sockets!
      if (status === "interested" && socket && loggedInUser) {
        socket.emit("sendConnectionRequest", {
          senderId: loggedInUser._id,
          receiverId: targetUserId,
          firstName: loggedInUser.firstName,
          lastName: loggedInUser.lastName,
          text: "Sent you a connection request!",
        });
      }
    } catch (err) {
      console.error("Action API failed:", err);
    }
  };

  // ==========================================
  // 6. SWIPE EVENT HANDLERS
  // ==========================================
  // Triggers when a physical or programmatic swipe finishes
  const onSwipe = async (direction, targetUserId) => {
    setIsProcessing(true);
    await processAction(direction, targetUserId);
  };

  // Triggers after the card flies completely off the screen
  const onCardLeftScreen = (targetUserId) => {
    setDragDirection(null);
    setActiveCardId(null);
    setSwipeTarget({ userId: null, dir: null });
    dispatch(removeUserFromFeed(targetUserId));
    setIsProcessing(false);
  };

  // ==========================================
  // 7. BUTTON EVENT HANDLER
  // ==========================================
  // Triggers when a user clicks the Ignore or Connect buttons
  const handleButtonClick = (direction) => {
    if (isProcessing || !feed || feed.length === 0) return;
    setIsProcessing(true);
    const topCardUser = feed[0];
    setSwipeTarget({ userId: topCardUser._id, dir: direction });
  };

  // ==========================================
  // 8. DRAG STATE OVERLAY HANDLER
  // ==========================================
  const handleDragStateChange = (direction, userId) => {
    setDragDirection(direction);
    setActiveCardId(direction ? userId : null);
  };

  // ==========================================
  // ==========================================
  // 9. RENDER: LOADING & EMPTY STATES
  // ==========================================
  if (!feed) return null;

  // Show message if out of developers with a gorgeous empty card state
  if (feed.length <= 0) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-base-200/50 backdrop-blur-xl border border-base-content/10 shadow-2xl text-center space-y-6"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary border border-primary/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black text-base-content tracking-tight">You're All Caught Up!</h1>
            <p className="text-sm text-base-content/60 mt-2 font-medium leading-relaxed">
              No new developers found matching your criteria. Check back later or update your profile to find more peers!
            </p>
          </div>
          <div className="pt-2">
            <button 
              onClick={() => navigate("/profile")}
              className="btn btn-primary w-full rounded-xl font-bold tracking-wide shadow-lg shadow-primary/20 h-11"
            >
              Update My Tech Stack
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ==========================================
  // 10. RENDER: THE DECK & BUTTONS
  // ==========================================
  return (
    <div className="flex flex-col items-center justify-center my-8 min-h-[72vh] overflow-hidden">
      
      {/* Container for the cards */}
      <div className="relative w-96 h-[520px]">
        {feed.slice().reverse().map((user) => {
          const isActive = feed[0]?._id === user._id;
          const forceSwipe = swipeTarget.userId === user._id ? swipeTarget.dir : null;

          return (
            <SwipeableCard
              key={user._id}
              active={isActive}
              forceSwipe={forceSwipe}
              onSwipe={(dir) => onSwipe(dir, user._id)}
              onCardLeftScreen={() => onCardLeftScreen(user._id)}
              onDragStateChange={(dir) => handleDragStateChange(dir, user._id)}
            >
              <div className="relative w-full h-full">
                {/* 🟢 LIKE STAMP */}
                {dragDirection === "right" && activeCardId === user._id && (
                  <div className="absolute top-10 left-8 z-50 pointer-events-none opacity-90 transition-opacity duration-200">
                    <div className="border-[5px] border-success text-success font-black text-4xl px-4 py-1.5 rounded-xl uppercase tracking-widest transform -rotate-12 bg-base-100/80 backdrop-blur-md shadow-2xl">
                      LIKE
                    </div>
                  </div>
                )}

                {/* 🔴 NOPE STAMP */}
                {dragDirection === "left" && activeCardId === user._id && (
                  <div className="absolute top-10 right-8 z-50 pointer-events-none opacity-90 transition-opacity duration-200">
                    <div className="border-[5px] border-error text-error font-black text-4xl px-4 py-1.5 rounded-xl uppercase tracking-widest transform rotate-12 bg-base-100/80 backdrop-blur-md shadow-2xl">
                      NOPE
                    </div>
                  </div>
                )}

                {/* The User Info Card */}
                <UserCard user={user} isPreview={true} />
              </div>
            </SwipeableCard>
          );
        })}
      </div>

      {/* ==========================================
          11. ACTION BUTTONS (Tinder Style)
          ========================================== */}
      <div className="mt-8 flex items-center justify-center gap-6">
        
        {/* IGNORE BUTTON */}
        <motion.button 
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleButtonClick("left")}
          disabled={isProcessing}
          className="btn btn-circle btn-lg bg-base-100 border border-base-content/10 hover:bg-error hover:text-error-content hover:border-error text-error shadow-xl disabled:opacity-50 h-16 w-16"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>

        {/* INTERESTED BUTTON */}
        <motion.button 
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleButtonClick("right")}
          disabled={isProcessing}
          className="btn btn-circle btn-lg bg-base-100 border border-base-content/10 hover:bg-success hover:text-success-content hover:border-success text-success shadow-xl disabled:opacity-50 h-16 w-16"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </motion.button>
      </div>

      {/* Instructions */}
      <p className="mt-5 text-xs font-semibold tracking-wider uppercase opacity-40">
        Swipe cards or click buttons
      </p>
      
    </div>
  );
};

export default Feed;