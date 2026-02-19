// ==========================================
// 1. IMPORTS
// ==========================================
import axios from "axios"; // HTTP client to talk to your backend
import { BASE_URL } from "../utils/constants"; // Your backend server URL
import { useDispatch, useSelector } from "react-redux"; // Redux hooks for global state management
import { useEffect, useState } from "react"; // React hooks for component lifecycle and local memory
import { addFeed, removeUserFromFeed } from "../utils/feedSlice"; // Redux actions to update the feed list
import UserCard from "./UserCard"; // Your custom UI component to display user info
import TinderCard from "react-tinder-card"; // The swipe physics library
import { useSocket } from "../utils/SocketContext"; // Your global socket connection for real-time notifications

const Feed = () => {
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
  // Triggers when a physical swipe finishes
  const onSwipe = async (direction, targetUserId) => {
    await processAction(direction, targetUserId);
  };

  // Triggers after the card flies completely off the screen
  const onCardLeftScreen = (targetUserId) => {
    // Reset the stamps
    setDragDirection(null);
    setActiveCardId(null);
    // Finally, remove the user from Redux to reveal the next card
    dispatch(removeUserFromFeed(targetUserId));
  };

  // ==========================================
  // 7. NEW: BUTTON EVENT HANDLER
  // ==========================================
  // Triggers when a user clicks the Ignore or Interested buttons
  const handleButtonClick = async (direction) => {
    // Prevent double-clicking
    if (isProcessing || !feed || feed.length === 0) return;
    
    setIsProcessing(true);
    
    // Grab the user who is currently on the TOP of the deck
    const topCardUser = feed[0];

    // 1. Process the API request and Socket event
    await processAction(direction, topCardUser._id);
    
    // 2. Instantly remove them from Redux (skips the fly-away animation for speed)
    onCardLeftScreen(topCardUser._id);
    
    setIsProcessing(false);
  };

  // ==========================================
  // 8. STAMP OVERLAY HANDLERS
  // ==========================================
  // Triggers when the card is dragged past the 100px threshold
  const handleRequirementFulfilled = (direction, userId) => {
    if (direction === "left" || direction === "right") {
      setDragDirection(direction); // Tells UI to show stamp
      setActiveCardId(userId); // Tells UI WHICH card gets the stamp
    }
  };

  // Triggers if they drag it out, but pull it back to the middle
  const handleRequirementUnfulfilled = () => {
    setDragDirection(null); // Hides the stamp
    setActiveCardId(null);
  };

  // ==========================================
  // 9. RENDER: LOADING & EMPTY STATES
  // ==========================================
  // Show nothing while fetching data
  if (!feed) return null;

  // Show message if out of developers
  if (feed.length <= 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-base-content/70">No new users found!</h1>
          <p className="text-base-content/50 mt-2">Check back later for new connections</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // 10. RENDER: THE DECK & BUTTONS
  // ==========================================
  return (
    // Main wrapper ensuring everything is centered
    <div className="flex flex-col items-center justify-center my-10 min-h-[70vh] overflow-hidden">
      
      {/* Container for the cards */}
      <div className="relative w-96 h-[500px]">
        
        {/* We map in reverse (.slice().reverse()) so feed[0] renders LAST and sits on TOP of the visual stack */}
        {feed.slice().reverse().map((user) => (
          <TinderCard
            key={user._id}
            className="absolute shadow-xl w-full"
            onSwipe={(dir) => onSwipe(dir, user._id)}
            onCardLeftScreen={() => onCardLeftScreen(user._id)}
            onSwipeRequirementFulfilled={(dir) => handleRequirementFulfilled(dir, user._id)}
            onSwipeRequirementUnfulfilled={handleRequirementUnfulfilled}
            preventSwipe={["up", "down"]} // Disables vertical swiping
            swipeRequirementType="position"
            swipeThreshold={100} // Requires a 100px drag to lock in the swipe
          >
            {/* Inner wrapper for stamps and the UserCard */}
            <div className="relative w-full h-full">
              
              {/* 🟢 LIKE STAMP */}
              {dragDirection === "right" && activeCardId === user._id && (
                <div className="absolute top-10 left-6 z-50 pointer-events-none opacity-90 transition-opacity duration-200">
                  <div className="border-[6px] border-success text-success font-black text-5xl px-4 py-1 rounded-lg uppercase tracking-widest transform -rotate-12 bg-base-100/40 backdrop-blur-sm shadow-xl">
                    LIKE
                  </div>
                </div>
              )}

              {/* 🔴 NOPE STAMP */}
              {dragDirection === "left" && activeCardId === user._id && (
                <div className="absolute top-10 right-6 z-50 pointer-events-none opacity-90 transition-opacity duration-200">
                  <div className="border-[6px] border-error text-error font-black text-5xl px-4 py-1 rounded-lg uppercase tracking-widest transform rotate-12 bg-base-100/40 backdrop-blur-sm shadow-xl">
                    NOPE
                  </div>
                </div>
              )}

              {/* The User Info Card (isPreview hides its original internal buttons) */}
              <UserCard user={user} isPreview={true} />
            </div>
          </TinderCard>
        ))}
      </div>

      {/* ==========================================
          11. NEW: ACTION BUTTONS (Tinder Style)
          ========================================== */}
      <div className="mt-8 flex items-center justify-center gap-6">
        
        {/* IGNORE BUTTON (Left) */}
        <button 
          onClick={() => handleButtonClick("left")}
          disabled={isProcessing}
          className="btn btn-circle btn-lg bg-base-100 border-error/20 hover:bg-error hover:text-white hover:border-error text-error shadow-xl hover:scale-110 transition-all duration-300 disabled:opacity-50"
        >
          {/* 'X' Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* INTERESTED BUTTON (Right) */}
        <button 
          onClick={() => handleButtonClick("right")}
          disabled={isProcessing}
          className="btn btn-circle btn-lg bg-base-100 border-success/20 hover:bg-success hover:text-white hover:border-success text-success shadow-xl hover:scale-110 transition-all duration-300 disabled:opacity-50"
        >
          {/* 'Heart' Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Swipe instructions (Optional, can be removed now that buttons exist) */}
      <div className="mt-6 flex items-center justify-center gap-8 text-sm opacity-50 font-medium">
        <span>Swipe or Click to decide</span>
      </div>
      
    </div>
  );
};

export default Feed;